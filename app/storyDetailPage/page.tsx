"use client";
import React, { useEffect, useState, Suspense } from "react";
import { Ico } from "@/components/Icons";
import { StarRating } from "@/components/ui";
import { useStoryStore } from "@/stores/storyStore";
import { useNavStore } from "@/stores/navStore";
import { useAuthStore } from "@/stores";
import { useRouter, useSearchParams } from "next/navigation";
import { useGotoStory } from "@/hooks/useGotoStory";
import useChapterService from "@/api/useChapter.service";
import useStoryService from "@/api/useStory.service";
import useReportService from "@/api/useReport.service";
import useRatingService from "@/api/useRating.service";
import useFollowService from "@/api/useFollow.service";
import useGiftService from "@/api/useGift.service";
import { useToast } from "@/hooks/use-toast";

function StoryDetailContent() {
  const {
    allStories: stories,
    unlockedChapters,
    unlockChapter,
    chapters,
    setChapters,
  } = useStoryStore();

  const { selectedStory: story, setSelectedStory, setSelectedChapterId } = useNavStore();
  const gotoStory = useGotoStory();
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getStory, getStoryDetail } = useStoryService();
  const { getChaptersByStory, purchaseChapter } = useChapterService();
  const { getRatingsByStory, rateStory, getMyRating } = useRatingService();
  const { toggleFollow, getFollowStatus } = useFollowService();
  const { sendGift } = useGiftService();

  const [followed, setFollowed] = useState(false);
  const [followCount, setFollowCount] = useState<number | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [storyLoading, setStoryLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reviews, setReviews] = useState<any[]>([]);
  const [myScore, setMyScore] = useState(0);
  const [myReview, setMyReview] = useState("");
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [purchasingChapterId, setPurchasingChapterId] = useState<number | null>(null);
  const [confirmPurchase, setConfirmPurchase] = useState<{ id: number; title: string; price: number } | null>(null);
  // Rating stats from API (more reliable than computing from reviews list)
  const [displayRating, setDisplayRating] = useState(0);
  const [displayRatingCount, setDisplayRatingCount] = useState(0);

  // Load story from URL ?id param when navStore is empty (e.g., on page refresh or direct URL)
  useEffect(() => {
    const id = searchParams.get("id");
    if (story || !id) return;
    setStoryLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getStory(id).then((res: any) => {
      const s = res?.data ?? res;
      if (!s?.id) return;
      const isRealCover = (url?: string) =>
        !!url && !url.includes("placeholder.com") && !url.includes("placeholder");
      const COVER_GRADIENTS = [
        "linear-gradient(135deg,#f093fb,#f5576c)",
        "linear-gradient(135deg,#4facfe,#00f2fe)",
        "linear-gradient(135deg,#43e97b,#38f9d7)",
        "linear-gradient(135deg,#fa709a,#fee140)",
        "linear-gradient(135deg,#a18cd1,#fbc2eb)",
        "linear-gradient(135deg,#667eea,#764ba2)",
      ];
      setSelectedStory({
        id: s.id,
        title: s.title ?? "",
        author: s.authorName ?? s.author?.fullName ?? "",
        penName: s.authorName ?? s.author?.fullName ?? "",
        cover: isRealCover(s.coverUrl)
          ? `url("${s.coverUrl}")`
          : COVER_GRADIENTS[s.id % COVER_GRADIENTS.length],
        coverUrl: s.coverUrl ?? "",
        genre: s.categories?.[0]?.name ?? s.genre ?? "",
        categoryId: s.categories?.[0]?.id ?? null,
        tags: s.tags ?? [],
        rating: s.avgRating ?? s.averageRating ?? 0,
        reads: s.viewCount != null ? String(s.viewCount) : "0",
        favorites: s.favoriteCount ?? s.followCount ?? 0,
        chapters: s.allChaptersCount ?? s.totalChapterCount ?? s.chapterCount ?? 0,
        reviewCount: s.ratingCount ?? 0,
        description: s.summary ?? s.description ?? "",
        status: s.status === "COMPLETED" || s.isCompleted ? "done" : "ongoing",
      });
    }).catch(() => {}).finally(() => setStoryLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Load chapter list. Uses getStoryDetail as the primary reliable source (public endpoint,
  // includes isPurchased per chapter). Falls back to getChaptersByStory result when the
  // detail endpoint is unavailable. Authors see all chapters via getChaptersByStory.
  useEffect(() => {
    if (!story?.id) return;
    setChapters([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applyChapters = (list: any[], purchasedIds?: Set<number>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped = list.map((ch: any) => {
        const purchased = purchasedIds != null ? purchasedIds.has(ch.id) : (ch.isPurchased ?? false);
        return {
          id: ch.id,
          title: ch.title,
          chapterOrder: ch.chapterOrder ?? ch.chapterNumber ?? 0,
          coinPrice: ch.coinPrice ?? ch.price ?? 0,
          isPurchased: purchased,
          words: 0,
          readTime: "\u2014",
          publishedAt: ch.publishAt
            ? new Date(ch.publishAt).toLocaleDateString("vi-VN")
            : undefined,
          locked: (ch.coinPrice ?? ch.price ?? 0) > 0 && !purchased,
          price: ch.coinPrice ?? ch.price ?? 0,
        };
      });
      setChapters(mapped);
    };

    // Helper: load chapters via story detail endpoint (public, includes isPurchased)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loadFromDetail = (): Promise<any> =>
      getStoryDetail(story.id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((r: any) => {
          const detail = r?.data ?? r;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const detailList: any[] = Array.isArray(detail?.chapters) ? detail.chapters : [];
          // Also update rating stats from fresh detail response
          if (detail?.avgRating != null) setDisplayRating(detail.avgRating);
          if (detail?.ratingCount != null) setDisplayRatingCount(detail.ratingCount);
          applyChapters(detailList);
        });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getChaptersByStory(story.id).then((res: any) => {
      const list: any[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (!list.length) {
        // Empty list — fall back to story detail to get published chapters
        return loadFromDetail().catch(() => {});
      }
      if (user) {
        // Merge isPurchased from story detail for authenticated users
        return getStoryDetail(story.id)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .then((r: any) => {
            const detail = r?.data ?? r;
            // Also update rating stats from fresh detail response
            if (detail?.avgRating != null) setDisplayRating(detail.avgRating);
            if (detail?.ratingCount != null) setDisplayRatingCount(detail.ratingCount);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const detailChaps: any[] = Array.isArray(detail?.chapters) ? detail.chapters : [];
            const purchasedIds = new Set<number>(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              detailChaps.filter((c: any) => c.isPurchased).map((c: any) => c.id as number)
            );
            applyChapters(list, purchasedIds);
          })
          .catch(() => applyChapters(list));
      }
      applyChapters(list);
    }).catch(() => {
      // getChaptersByStory failed (e.g. auth required) — load from story detail instead
      loadFromDetail().catch(() => {});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id, user]);

  // Load my existing rating for this story
  useEffect(() => {
    if (!story?.id || !user) return;
    getMyRating(story.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((res: any) => {
        const r = res?.data ?? res;
        if (r?.score) {
          setMyScore(r.score);
          setMyReview(r.review ?? "");
          setRatingSubmitted(true);
        }
      })
      .catch(() => {}); // 404 = chưa đánh giá → bỏ qua
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id, user]);

  // Initialize followCount / rating stats from story data
  useEffect(() => {
    if (!story) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = story as any;
    if (s.followCount != null) setFollowCount(s.followCount);
    // Use isFollowing if present (null = not logged in, true/false = logged in)
    if (user && s.isFollowing != null) setFollowed(!!s.isFollowing);
    // Sync rating stats — story.rating = avgRating, story.reviewCount = ratingCount
    if (s.rating != null) setDisplayRating(s.rating);
    if (s.reviewCount != null) setDisplayRatingCount(s.reviewCount);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);

  // Load follow status for this story (fallback when isFollowing not in story data)
  useEffect(() => {
    if (!story?.id || !user) { if (!user) setFollowed(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = story as any;
    if (s.isFollowing != null) return; // already set from story data
    getFollowStatus(story.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((res: any) => {
        const val = res?.data ?? res;
        setFollowed(!!val);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id, user]);

  // Load real ratings/reviews for this story
  useEffect(() => {
    if (!story?.id) return;
    getRatingsByStory(story.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((res: any) => {
        const list: any[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setReviews(list.map((r: any) => ({ ...r, rating: r.score ?? r.rating ?? 0 })));
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);
  // Report
  const { createReport } = useReportService();
  const toast = useToast();
  const [storyReportOpen, setStoryReportOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [giftAmount, setGiftAmount] = useState(100);
  const [giftSending, setGiftSending] = useState(false);
  const [storyReportReason, setStoryReportReason] = useState("");
  const [storyReporting, setStoryReporting] = useState(false);

  const handleReportStory = async () => {
    if (!storyReportReason.trim() || !story) return;
    setStoryReporting(true);
    try {
      await createReport({ targetType: "STORY", targetId: story.id, reason: storyReportReason.trim() });
      toast.success("Báo cáo đã được gửi. Cảm ơn bạn!");
      setStoryReportOpen(false);
      setStoryReportReason("");
    } catch {
      toast.error("Không thể gửi báo cáo. Thử lại sau.");
    } finally {
      setStoryReporting(false);
    }
  };

  if (!story) {
    if (storyLoading) {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", fontSize: 14, color: "#9e8e82" }}>
          <div>⏳ Đang tải thông tin truyện...</div>
        </div>
      );
    }
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1c1512", marginBottom: 8 }}>Không tìm thấy truyện</div>
        <div style={{ fontSize: 14, color: "#9e8e82", marginBottom: 24 }}>Truyện không tồn tại hoặc đã bị xóa.</div>
        <button
          onClick={() => router.push("/homePage")}
          style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#c23d3f", color: "#fff", fontWeight: 600, cursor: "pointer" }}
        >
          ← Về trang chủ
        </button>
      </div>
    );
  }

  const requireAuth = (cb: () => void) => {
    if (!user) { router.push("?login"); return; }
    cb();
  };

  const handleSendGift = async () => {
    if (!story || giftAmount < 1 || giftSending) return;
    setGiftSending(true);
    try {
      await sendGift(story.id, giftAmount);
      toast.success(`Đã tặng ${giftAmount} xu cho tác giả!`);
      setGiftOpen(false);
      setGiftAmount(100);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Không thể tặng quà. Thử lại sau.");
    } finally {
      setGiftSending(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!user) { router.push("?login"); return; }
    if (!story || followLoading) return;
    setFollowLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await toggleFollow(story.id);
      const data = res?.data ?? res;
      const status = data?.status ?? res?.status;
      if (status === "FOLLOWED") {
        setFollowed(true);
        if (data?.followCount != null) setFollowCount(data.followCount);
        else setFollowCount((c) => (c ?? 0) + 1);
        toast.success("Đã thêm vào yêu thích!");
      } else {
        setFollowed(false);
        if (data?.followCount != null) setFollowCount(data.followCount);
        else setFollowCount((c) => Math.max(0, (c ?? 1) - 1));
        toast.success("Đã bỏ yêu thích.");
      }
    } catch {
      toast.error("Không thể thực hiện. Thử lại sau.");
    } finally {
      setFollowLoading(false);
    }
  };

  // Use API-provided avgRating/ratingCount as the source of truth.
  // displayRating is synced from getStory / getStoryDetail responses.
  const avgRating = displayRating > 0 ? Number(displayRating).toFixed(1) : "—";

  const relatedStories = stories
    .filter((s) => s.id !== story.id && s.genre === story.genre)
    .slice(0, 3);

  return (
    <>
    <div className="fade-in">
      <div className="detail-wrap">
        {/* ── MAIN ─────────────────────────────────────────────────────────── */}
        <div className="mobile-user-info">
          <button className="back-btn" onClick={() => router.push("/homePage")}>
            <Ico.Back /> Quay lại
          </button>

          {/* ── Hero: cover + meta ───────────────────────────────────────── */}
          <div
            className="detail-cover-row"
            style={{ alignItems: "flex-start" }}
          >
            <div
              className="detail-cover shrink-0"
              style={{ width: 140, height: 200 }}
            >
              <div
                className="w-full h-full"
                style={{ background: story.cover }}
              />
            </div>

            <div className="hero-left flex flex-col" style={{ gap: 10 }}>
              {/* Status badge */}
              <div>
                <span
                  className={`story-status-badge ${story.status === "done" ? "badge-done" : "badge-ongoing"}`}
                  style={{ position: "static" }}
                >
                  {story.status === "done" ? "✓ Hoàn thành" : "Đang ra"}
                </span>
              </div>

              {/* Title */}
              <h1 className="detail-title" style={{ marginBottom: 0 }}>
                {story.title}
              </h1>

              {/* Tác giả */}
              <div
                className="flex items-center flex-wrap"
                style={{ gap: "4px 6px", fontSize: 13, color: "#9e8e82" }}
              >
                <span>Tác giả:</span>
                <span
                  style={{ color: "#c23d3f", fontWeight: 600, fontSize: 14 }}
                >
                  {story.author}
                </span>
                <span style={{ color: "#ddd" }}>·</span>
                <span style={{ color: "#b0a096", fontStyle: "italic" }}>
                  {story.penName}
                </span>
              </div>

              {/* Genre + Tags */}
              <div
                className="flex flex-wrap items-center"
                style={{ gap: "6px" }}
              >
                <span
                  className="tag"
                  style={{
                    background: "#fde8e8",
                    color: "#c23d3f",
                    border: "1.5px solid #f0b4b5",
                    fontWeight: 600,
                  }}
                >
                  {story.genre}
                </span>
                {story.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div
                className="flex items-stretch rounded-xl overflow-hidden"
                style={{
                  border: "1.5px solid #ece6dc",
                  background: "#fff",
                  alignSelf: "flex-start",
                }}
              >
                {[
                  { num: story.reads, label: "Lượt đọc" },
                  { num: chapters.length || story.chapters || 0, label: "Chương" },
                  { num: displayRatingCount, label: "Đánh giá" },
                  {
                    num: followCount != null
                      ? followCount.toLocaleString("vi-VN")
                      : (story.favorites || 0).toLocaleString("vi-VN"),
                    label: "Yêu thích",
                  },
                ].map(({ num, label }, i) => (
                  <div
                    key={label}
                    className="stat"
                    style={{
                      padding: "10px 18px",
                      borderRight: i < 3 ? "1.5px solid #ece6dc" : "none",
                      minWidth: 72,
                    }}
                  >
                    <div className="stat-num">{num}</div>
                    <div className="stat-label">{label}</div>
                  </div>
                ))}
              </div>

              {/* Rating */}
              <div className="detail-rating" style={{ marginBottom: 0 }}>
                <StarRating rating={parseFloat(avgRating) || 0} size={18} />
                <span
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#c23d3f",
                  }}
                >
                  {avgRating}
                </span>
                <span style={{ fontSize: 13, color: "#9e8e82" }}>/ 5</span>
              </div>

              {/* CTA */}
              <div className="detail-actions" style={{ marginTop: 4, flexWrap: "nowrap", gap: 6 }}>
                <button
                  className="btn-hero btn-hero-primary"
                  style={{ fontSize: 12, padding: "8px 14px", gap: 5 }}
                  onClick={() => {
                    const first = chapters[0];
                    if (!first?.id) return;
                    const firstLocked = first.locked && !unlockedChapters?.includes(first.id);
                    if (firstLocked) {
                      // First chapter is paid — require login
                      requireAuth(() => {});
                    } else {
                      setSelectedChapterId(first.id);
                      router.push("/readerPage");
                    }
                  }}
                >
                  <Ico.Book /> Đọc từ đầu
                </button>

                <button
                  className={`btn-hero ${followed ? "btn-hero-primary" : "btn-hero-outline"}`}
                  style={
                    followed
                      ? {
                          background: "#fde8e8",
                          color: "#c23d3f",
                          borderColor: "#c23d3f",
                          fontSize: 12,
                          padding: "8px 14px",
                          gap: 5,
                          opacity: followLoading ? 0.6 : 1,
                        }
                      : {
                          borderColor: "#c23d3f",
                          color: "#c23d3f",
                          fontSize: 12,
                          padding: "8px 14px",
                          gap: 5,
                          opacity: followLoading ? 0.6 : 1,
                        }
                  }
                  disabled={followLoading}
                  onClick={handleToggleFollow}
                >
                  <Ico.Heart f={followed} />
                  {followed ? "Đã yêu thích" : "Yêu thích"}
                </button>
                <button
                  className="btn-hero btn-hero-outline"
                  style={{ fontSize: 12, padding: "8px 14px", color: ratingSubmitted ? "#c23d3f" : "#6b5a4e", borderColor: ratingSubmitted ? "#c23d3f" : "#e8e0d6" }}
                  onClick={() => {
                    if (!user) { router.push("?login"); return; }
                    setRatingModalOpen(true);
                  }}
                >
                  ⭐ {ratingSubmitted ? `${myScore}/5` : "Đánh giá"}
                </button>
                <button
                  className="btn-hero btn-hero-outline"
                  style={{
                    fontSize: 12,
                    padding: "8px 14px",
                    color: "#9ca3af",
                    borderColor: "#e8e0d6",
                  }}
                  onClick={() => requireAuth(() => setStoryReportOpen(true))}
                >
                  🚩 Báo cáo
                </button>
                <button
                  className="btn-hero btn-hero-outline"
                  style={{
                    fontSize: 12,
                    padding: "8px 14px",
                    color: "#b08430",
                    borderColor: "#f0daa8",
                    background: giftOpen ? "#fef9ee" : undefined,
                  }}
                  onClick={() => requireAuth(() => setGiftOpen((o) => !o))}
                >
                  🎁 Tặng quà
                </button>
              </div>
            </div>
          </div>

          {/* Inline Gift */}
          {giftOpen && (
            <div
              style={{
                background: "#fef9ee",
                border: "1.5px solid #f0daa8",
                borderRadius: 14,
                padding: "16px 18px",
                marginBottom: 16,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1c1512", marginBottom: 4 }}>
                🎁 Tặng xu cho tác giả: <em>{story.author}</em>
              </div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>
                Xu sẽ được chuyển thẳng vào ví tác giả ngay sau khi bạn xác nhận.
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {[10, 50, 100, 200, 500].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setGiftAmount(preset)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      border: `1.5px solid ${giftAmount === preset ? "#b08430" : "#e8e0d6"}`,
                      background: giftAmount === preset ? "#fef9ee" : "#fff",
                      color: giftAmount === preset ? "#b08430" : "#6b5a4e",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    🪙 {preset} xu
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                <input
                  type="number"
                  min={1}
                  value={giftAmount}
                  onChange={(e) => setGiftAmount(Math.max(1, Number(e.target.value)))}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1.5px solid #e8e0d6",
                    fontSize: 13,
                    color: "#3d2f28",
                    fontFamily: "inherit",
                    outline: "none",
                    width: 120,
                  }}
                />
                <span style={{ fontSize: 12, color: "#9ca3af" }}>xu (tùy chỉnh)</span>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() => { setGiftOpen(false); setGiftAmount(100); }}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 9,
                    border: "1.5px solid #e8e0d6",
                    background: "#fff",
                    color: "#6b5a4e",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSendGift}
                  disabled={giftAmount < 1 || giftSending}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 9,
                    border: "none",
                    background: giftAmount < 1 || giftSending ? "#f3f4f6" : "#b08430",
                    color: giftAmount < 1 || giftSending ? "#9ca3af" : "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: giftAmount < 1 || giftSending ? "not-allowed" : "pointer",
                  }}
                >
                  {giftSending ? "⏳ Đang gửi…" : `🎁 Tặng ${giftAmount} xu`}
                </button>
              </div>
            </div>
          )}

          {/* Inline Story Report */}
          {storyReportOpen && (
            <div
              style={{
                background: "#fdfaf7",
                border: "1.5px solid #e8e0d6",
                borderRadius: 14,
                padding: "16px 18px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#1c1512",
                  marginBottom: 8,
                }}
              >
                🚩 Báo cáo truyện: <em>{story.title}</em>
              </div>
              <textarea
                value={storyReportReason}
                onChange={(e) => setStoryReportReason(e.target.value)}
                placeholder="Mô tả lý do báo cáo..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: "1.5px solid #e8e0d6",
                  fontSize: 13,
                  color: "#3d2f28",
                  resize: "none",
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 10,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => {
                    setStoryReportOpen(false);
                    setStoryReportReason("");
                  }}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 9,
                    border: "1.5px solid #e8e0d6",
                    background: "#fff",
                    color: "#6b5a4e",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleReportStory}
                  disabled={!storyReportReason.trim() || storyReporting}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 9,
                    border: "none",
                    background:
                      !storyReportReason.trim() || storyReporting
                        ? "#f3f4f6"
                        : "#c23d3f",
                    color:
                      !storyReportReason.trim() || storyReporting
                        ? "#9ca3af"
                        : "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor:
                      !storyReportReason.trim() || storyReporting
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {storyReporting ? "Đang gửi..." : "Gửi báo cáo"}
                </button>
              </div>
            </div>
          )}


          <blockquote className="detail-desc">{story.description}</blockquote>

          {/* ── Danh sách chương ─────────────────────────────────────────── */}
          <div className="sec-head" style={{ marginBottom: 12 }}>
            <div className="sec-title" style={{ fontSize: 18 }}>
              Danh sách chương
              <span
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 14,
                  fontWeight: 400,
                  color: "#9e8e82",
                  marginLeft: 6,
                }}
              >
                ({chapters.length})
              </span>
            </div>
          </div>

          <div className="chapters-list">
            {chapters.map((ch, i) => {
              const isLocked = ch.locked && !unlockedChapters?.includes(ch.id);
              return (
                <div
                  key={ch.id}
                  className={`chapter-item${isLocked ? " chapter-locked" : ""}`}
                  onClick={() => {
                    if (!isLocked && ch.id) {
                      setSelectedChapterId(ch.id);
                      router.push("/readerPage");
                    } else if (isLocked) {
                      // Paid chapter — require login to unlock
                      requireAuth(() => {});
                    }
                  }}
                  style={
                    isLocked
                      ? {
                          cursor: "pointer",
                          background: "#fdf7f0",
                          borderColor: "#f0dfc8",
                        }
                      : {}
                  }
                >
                  <span
                    className="shrink-0 text-center font-bold"
                    style={{
                      width: 28,
                      fontSize: 12,
                      color: "#c9b89a",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    {i + 1}
                  </span>

                  <div className="hero-left" style={{ flex: 1 }}>
                    <div
                      className="ch-title flex items-center"
                      style={{ gap: 6 }}
                    >
                      {isLocked && (
                        <span
                          className="shrink-0 font-bold"
                          style={{
                            fontSize: 10,
                            background: "#fef3c7",
                            color: "#b45309",
                            border: "1px solid #fcd34d",
                            padding: "1px 7px",
                            borderRadius: 10,
                          }}
                        >
                          🔒 VIP
                        </span>
                      )}
                      {ch.title}
                    </div>
                    <div className="ch-meta flex items-center gap-1">
                      <Ico.Book /> {ch.words.toLocaleString()} chữ · ⏱{" "}
                      {ch.readTime}
                      {ch.publishedAt && ` · ${ch.publishedAt}`}
                    </div>
                  </div>

                  {isLocked ? (
                    <button
                      disabled={purchasingChapterId === ch.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        requireAuth(() => setConfirmPurchase({ id: ch.id, title: ch.title, price: ch.price || 10 }));
                      }}
                      className="flex items-center shrink-0 whitespace-nowrap font-bold"
                      style={{
                        gap: 5,
                        background: purchasingChapterId === ch.id
                          ? "#a0a0a0"
                          : "linear-gradient(135deg,#c69526,#9a7020)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "7px 14px",
                        fontSize: 12,
                        cursor: purchasingChapterId === ch.id ? "not-allowed" : "pointer",
                        boxShadow: "0 2px 8px rgba(194,149,38,.3)",
                      }}
                    >
                      {purchasingChapterId === ch.id ? "⏳ Đang mua..." : `🪙 ${ch.price} xu`}
                    </button>
                  ) : (
                    <div className="ch-arrow">
                      <Ico.Next />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── ĐÁNH GIÁ ─────────────────────────────────────────────────────── */}
          <div style={{ marginTop: 28 }}>
          <div className="sec-head" style={{ marginBottom: 16 }}>
            <div className="sec-title" style={{ fontSize: 18 }}>
              ⭐ Đánh giá
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 400, color: "#9e8e82", marginLeft: 6 }}>
                ({reviews.length})
              </span>
            </div>
          </div>

          {/* Đánh giá của tôi (nếu đã có) */}
          {ratingSubmitted && (
            <div style={{ background: "#fdfaf7", border: "1.5px solid #f0b4b5", borderRadius: 14, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "linear-gradient(135deg,#c23d3f,#9e2d2f)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 900, color: "#fff", flexShrink: 0,
              }}>
                {(user?.fullName ?? user?.email ?? "?")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1c1512" }}>Đánh giá của bạn</span>
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} style={{ fontSize: 14, color: myScore >= s ? "#f59e0b" : "#e5ddd5" }}>★</span>
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: "#c23d3f", fontWeight: 600 }}>{myScore}/5</span>
                </div>
                {myReview && <div style={{ fontSize: 13, color: "#6b5a4e", lineHeight: 1.5 }}>{myReview}</div>}
              </div>
              <button
                onClick={() => setRatingModalOpen(true)}
                style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 8, border: "1.5px solid #e8e0d6", background: "#fff", color: "#6b5a4e", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                Sửa
              </button>
            </div>
          )}

          {/* Danh sách reviews */}
          {reviews.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {reviews.map((r, i) => (
                <div key={r.id ?? i} style={{ background: "#fff", border: "1.5px solid #ece6dc", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "linear-gradient(135deg,#c23d3f,#9e2d2f)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 900, color: "#fff", flexShrink: 0,
                    }}>
                      {(r.userName ?? "?")[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1c1512" }}>{r.userName ?? "Người dùng"}</div>
                      <div style={{ fontSize: 11, color: "#b0a096" }}>
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString("vi-VN") : ""}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                      {[1,2,3,4,5].map((s) => (
                        <span key={s} style={{ fontSize: 14, color: (r.rating ?? 0) >= s ? "#f59e0b" : "#e5ddd5" }}>★</span>
                      ))}
                    </div>
                  </div>
                  {r.review && (
                    <div style={{ fontSize: 13, color: "#3d2f28", lineHeight: 1.6, marginLeft: 46 }}>{r.review}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#b0a096", fontSize: 13 }}>
              Chưa có đánh giá nào. Hãy là người đầu tiên! ⭐
            </div>
          )}
          </div>
        </div>

        {/* ── RATING MODAL ─────────────────────────────────────────────────── */}
        {ratingModalOpen && (
          <div
            onClick={() => setRatingModalOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 9999,
              background: "rgba(0,0,0,0.45)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 16,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff", borderRadius: 18, padding: "28px 28px 24px",
                width: "100%", maxWidth: 420,
                boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#1c1512" }}>
                  {ratingSubmitted ? "✏️ Cập nhật đánh giá" : "⭐ Đánh giá truyện"}
                </div>
                <button
                  onClick={() => setRatingModalOpen(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#9e8e82", lineHeight: 1 }}
                  aria-label="Đóng"
                >✕</button>
              </div>

              {/* Story title */}
              <div style={{ fontSize: 13, color: "#6b5a4e", marginBottom: 16, fontStyle: "italic" }}>{story?.title}</div>

              {/* Star selector */}
              <div style={{ display: "flex", gap: 8, marginBottom: 8, justifyContent: "center" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setRatingHover(star)}
                    onMouseLeave={() => setRatingHover(0)}
                    onClick={() => setMyScore(star)}
                    style={{
                      background: "none", border: "none", cursor: "pointer", padding: 2,
                      fontSize: 36, lineHeight: 1,
                      color: (ratingHover || myScore) >= star ? "#f59e0b" : "#d1c9be",
                      transition: "color 0.1s, transform 0.1s",
                      transform: (ratingHover || myScore) >= star ? "scale(1.18)" : "scale(1)",
                    }}
                  >★</button>
                ))}
              </div>
              <div style={{ textAlign: "center", fontSize: 13, color: "#f59e0b", fontWeight: 700, marginBottom: 16, minHeight: 20 }}>
                {myScore > 0 ? ["" ,"Tệ","Không hay","Tạm được","Hay","Xuất sắc"][myScore] : ""}
              </div>

              {/* Review textarea */}
              <textarea
                value={myReview}
                onChange={(e) => setMyReview(e.target.value)}
                placeholder="Nhận xét của bạn (không bắt buộc)..."
                rows={3}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 10,
                  border: "1.5px solid #e8e0d6", fontSize: 13, color: "#3d2f28",
                  resize: "none", fontFamily: "inherit", outline: "none",
                  boxSizing: "border-box", background: "#fdfaf7",
                }}
              />

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                {ratingSubmitted && (
                  <button
                    onClick={() => { setMyScore(0); setMyReview(""); setRatingSubmitted(false); setRatingModalOpen(false); }}
                    style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid #e8e0d6", background: "#fff", color: "#9e8e82", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  >
                    Xóa đánh giá
                  </button>
                )}
                <button
                  disabled={myScore === 0 || ratingSubmitting}
                  onClick={async () => {
                    if (!story || myScore === 0) return;
                    setRatingSubmitting(true);
                    try {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      await (rateStory as any)({ storyId: story.id, score: myScore, review: myReview.trim() || undefined });
                      toast.success(ratingSubmitted ? "Đã cập nhật đánh giá!" : "Cảm ơn bạn đã đánh giá! ⭐");
                      setRatingSubmitted(true);
                      setRatingModalOpen(false);
                      // Refresh reviews list
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      getRatingsByStory(story.id).then((res: any) => {
                        const list: any[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        setReviews(list.map((r: any) => ({ ...r, rating: r.score ?? r.rating ?? 0 })));
                      }).catch(() => {});
                      // Refresh avgRating / ratingCount from the story endpoint
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      getStory(story.id).then((res: any) => {
                        const s = res?.data ?? res;
                        if (s?.avgRating != null) setDisplayRating(s.avgRating);
                        if (s?.ratingCount != null) setDisplayRatingCount(s.ratingCount);
                      }).catch(() => {});
                    } catch {
                      toast.error("Không thể gửi đánh giá. Thử lại sau.");
                    } finally {
                      setRatingSubmitting(false);
                    }
                  }}
                  style={{
                    flex: 2, padding: "10px 0", borderRadius: 10, border: "none",
                    background: myScore === 0 || ratingSubmitting ? "#e5ddd5" : "#c23d3f",
                    color: myScore === 0 || ratingSubmitting ? "#9e8e82" : "#fff",
                    fontSize: 14, fontWeight: 700,
                    cursor: myScore === 0 || ratingSubmitting ? "not-allowed" : "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  {ratingSubmitting ? "Đang gửi..." : ratingSubmitted ? "Cập nhật" : "Gửi đánh giá"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
        <div className="detail-sidebar">
          {/* Related stories */}
          <div className="sidebar-card" style={{ padding: "16px 14px" }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="sidebar-title" style={{ marginBottom: 0 }}>
                Cùng thể loại
              </div>
              <span
                style={{
                  padding: "2px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  background: "#fde8e8",
                  color: "#c23d3f",
                  border: "1px solid #f0b4b5",
                }}
              >
                {story.genre}
              </span>
            </div>

            {relatedStories.length > 0 ? (
              <div className="flex flex-col" style={{ gap: 8 }}>
                {relatedStories.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => gotoStory(s)}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: 10,
                      borderRadius: 12,
                      cursor: "pointer",
                      border: "1.5px solid #f0ebe3",
                      background: "#fdfaf7",
                      transition: "all .15s",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.borderColor = "#c23d3f";
                      el.style.background = "#fff";
                      el.style.boxShadow = "0 4px 16px rgba(194,61,63,.1)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.borderColor = "#f0ebe3";
                      el.style.background = "#fdfaf7";
                      el.style.boxShadow = "none";
                    }}
                  >
                    {/* Cover */}
                    <div
                      className="shrink-0 rounded-lg overflow-hidden"
                      style={{
                        width: 52,
                        height: 72,
                        background: s.cover,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          textAlign: "center",
                          fontSize: 8,
                          fontWeight: 700,
                          color: "#fff",
                          letterSpacing: "0.3px",
                          padding: "2px 0",
                          background:
                            s.status === "done"
                              ? "rgba(28,101,58,.85)"
                              : "rgba(194,61,63,.85)",
                        }}
                      >
                        {s.status === "done" ? "HOÀN THÀNH" : "ĐANG RA"}
                      </div>
                    </div>
                    {/* Info */}
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: "#1c1512",
                            lineHeight: 1.35,
                            marginBottom: 3,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {s.title}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#9e8e82",
                            fontStyle: "italic",
                          }}
                        >
                          {s.penName}
                        </div>
                      </div>

                      {/* Stats */}
                      <div
                        className="flex items-center flex-wrap"
                        style={{ gap: "3px 8px", marginTop: 5 }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#c69526",
                          }}
                        >
                          ★ {s.rating}
                        </span>
                        <span style={{ fontSize: 10, color: "#e0d8d0" }}>
                          ·
                        </span>
                        <span style={{ fontSize: 11, color: "#9e8e82" }}>
                          {s.reads} đọc
                        </span>
                        <span style={{ fontSize: 10, color: "#e0d8d0" }}>
                          ·
                        </span>
                        <span style={{ fontSize: 11, color: "#9e8e82" }}>
                          {chapters.length} ch.
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center py-6"
                style={{ color: "#b0a096", fontSize: 13, textAlign: "center" }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>📚</div>
                Chưa có truyện cùng thể loại
              </div>
            )}
          </div>

          <div className="sidebar-card">
            <div className="sidebar-title">Thông tin tác phẩm</div>
            {(
              [
                ["Tác giả", story.author],
                [
                  "Trạng thái",
                  story.status === "done" ? "Hoàn thành" : "Đã xuất bản",
                ],
                [
                  "Số chương",
                  `${chapters.length || story.chapters || 0} chương`,
                ],
                ["Lượt đọc", story.reads],
                ["Yêu thích", `${(followCount ?? story.favorites ?? 0).toLocaleString("vi-VN")} người`],
                ["Đánh giá", `${avgRating}/5 (${displayRatingCount} đánh giá)`],
              ] as [string, string][]
            ).map(([k, v], i, arr) => (
              <div
                key={k}
                className="flex justify-between text-sm"
                style={{
                  padding: "9px 0",
                  borderBottom:
                    i < arr.length - 1 ? "1px solid #f5ede4" : "none",
                }}
              >
                <span style={{ color: "#9e8e82" }}>{k}</span>
                <span
                  style={{
                    fontWeight: 600,
                    color: "#1c1512",
                    marginLeft: 8,
                    textAlign: "right",
                  }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

      {/* ── Purchase Confirmation Modal ─────────────────────────────────── */}
      {confirmPurchase && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
          onClick={() => !purchasingChapterId && setConfirmPurchase(null)}
        >
          <div
            style={{
              background: "#fff", borderRadius: 20, padding: "32px 28px",
              maxWidth: 400, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🪙</div>
            <h3 style={{ margin: "0 0 6px", fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, color: "#1c1512" }}>
              Xác nhận mua chương
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: "#6b5a4e", lineHeight: 1.6 }}>
              Bạn sắp mua{" "}
              <strong style={{ color: "#1c1512" }}>&ldquo;{confirmPurchase.title}&rdquo;</strong>
              {" "}với giá
            </p>
            <div style={{
              background: "#fffbeb", border: "1.5px solid #fcd34d",
              borderRadius: 12, padding: "14px 20px", marginBottom: 24, display: "inline-block",
            }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: "#c69526" }}>
                🪙 {confirmPurchase.price} xu
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                disabled={!!purchasingChapterId}
                onClick={() => setConfirmPurchase(null)}
                style={{
                  flex: 1, padding: "11px 20px", borderRadius: 10,
                  border: "1.5px solid #e8e0d6", background: "#fff",
                  color: "#6b5a4e", fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                disabled={!!purchasingChapterId}
                onClick={async () => {
                  const { id, title, price } = confirmPurchase;
                  setPurchasingChapterId(id);
                  try {
                    await purchaseChapter(id);
                    unlockChapter(id, price);
                    setChapters(
                      chapters.map(c =>
                        c.id === id ? { ...c, locked: false, isPurchased: true } : c
                      )
                    );
                    toast.success(`Chương "${title}" đã được mở khóa.`, "Mở khóa thành công!");
                    setConfirmPurchase(null);
                  } catch (err: any) {
                    toast.error(err?.response?.data?.message ?? "Không đủ xu hoặc lỗi hệ thống.", "Mở khóa thất bại");
                  } finally {
                    setPurchasingChapterId(null);
                  }
                }}
                style={{
                  flex: 1, padding: "11px 20px", borderRadius: 10,
                  border: "none",
                  background: purchasingChapterId ? "#a0a0a0" : "linear-gradient(135deg,#c69526,#9a7020)",
                  color: "#fff", fontSize: 14, fontWeight: 700,
                  cursor: purchasingChapterId ? "not-allowed" : "pointer",
                  boxShadow: purchasingChapterId ? "none" : "0 2px 8px rgba(194,149,38,.3)",
                }}
              >
                {purchasingChapterId ? "⏳ Đang mua..." : "✅ Xác nhận mua"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function StoryDetailPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", fontSize: 14, color: "#9e8e82" }}>
        <div>⏳ Đang tải thông tin truyện...</div>
      </div>
    }>
      <StoryDetailContent />
    </Suspense>
  );
}

export default StoryDetailPage;