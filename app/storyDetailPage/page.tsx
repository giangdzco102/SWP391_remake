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
import useRatingService from "@/api/useRating.service";
import useFollowService from "@/api/useFollow.service";
import { useToast } from "@/hooks/use-toast";

import { COVER_GRADIENTS } from "@/utils/storyDetailPage.constants";
import { RatingModal } from "@/components/storyDetailPage/RatingModal";
import { PurchaseChapterModal } from "@/components/storyDetailPage/PurchaseChapterModal";
import { GiftPanel } from "@/components/storyDetailPage/GiftPanel";
import { ReportPanel } from "@/components/storyDetailPage/ReportPanel";
import { ReviewSection } from "@/components/storyDetailPage/ReviewSection";

function StoryDetailContent() {
  const {
    allStories: stories,
    unlockedChapters,
    chapters,
    setChapters,
    toggleLike,
  } = useStoryStore();

  const { selectedStory: story, setSelectedStory, setSelectedChapterId } = useNavStore();
  const gotoStory = useGotoStory();
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getStory, getStoryDetail } = useStoryService();
  const { getChaptersByStory } = useChapterService();
  const { getRatingsByStory, rateStory, getMyRating } = useRatingService();
  const { toggleFollow, getFollowStatus } = useFollowService();
  const toast = useToast();

  const [followed, setFollowed] = useState(false);
  const [followCount, setFollowCount] = useState<number | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [storyLoading, setStoryLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reviews, setReviews] = useState<any[]>([]);
  const [myScore, setMyScore] = useState(0);
  const [myReview, setMyReview] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [confirmPurchase, setConfirmPurchase] = useState<{ id: number; title: string; price: number } | null>(null);
  const [displayRating, setDisplayRating] = useState(0);
  const [displayRatingCount, setDisplayRatingCount] = useState(0);

  const [storyReportOpen, setStoryReportOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);

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

  useEffect(() => {
    if (!story?.id) return;
    setChapters([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applyChapters = (list: any[], purchasedIds?: Set<number>) => {
      const getChapterWordCount = (c: any) =>
        c.wordCount ?? (c.content ? c.content.trim().split(/\\s+/).filter(Boolean).length : 0);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped = list.map((ch: any) => {
        const purchased = purchasedIds != null ? purchasedIds.has(ch.id) : (ch.isPurchased ?? false);
        const wCount = getChapterWordCount(ch);
        return {
          id: ch.id,
          title: ch.title,
          chapterOrder: ch.chapterOrder ?? ch.chapterNumber ?? 0,
          coinPrice: ch.coinPrice ?? ch.price ?? 0,
          isPurchased: purchased,
          words: wCount,
          readTime: wCount > 0 ? `${Math.ceil(wCount / 250)} phút` : "\\u2014",
          publishedAt: ch.publishAt
            ? new Date(ch.publishAt).toLocaleDateString("vi-VN")
            : undefined,
          locked: (ch.coinPrice ?? ch.price ?? 0) > 0 && !purchased,
          price: ch.coinPrice ?? ch.price ?? 0,
        };
      });
      setChapters(mapped);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loadFromDetail = (): Promise<any> =>
      getStoryDetail(story.id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((r: any) => {
          const detail = r?.data ?? r;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const detailList: any[] = Array.isArray(detail?.chapters) ? detail.chapters : [];
          if (detail?.avgRating != null) setDisplayRating(detail.avgRating);
          if (detail?.ratingCount != null) setDisplayRatingCount(detail.ratingCount);
          const detailFollowCount = detail?.followCount ?? detail?.favoriteCount;
          if (detailFollowCount != null) setFollowCount(detailFollowCount);
          applyChapters(detailList);
        });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getChaptersByStory(story.id).then((res: any) => {
      const list: any[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (!list.length) return loadFromDetail().catch(() => {});
      if (user) {
        return getStoryDetail(story.id)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .then((r: any) => {
            const detail = r?.data ?? r;
            if (detail?.avgRating != null) setDisplayRating(detail.avgRating);
            if (detail?.ratingCount != null) setDisplayRatingCount(detail.ratingCount);
            const detailFollowCount = detail?.followCount ?? detail?.favoriteCount;
            if (detailFollowCount != null) setFollowCount(detailFollowCount);
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
    }).catch(() => { loadFromDetail().catch(() => {}); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id, user]);

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
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id, user]);

  useEffect(() => {
    if (!story) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = story as any;
    if (s.followCount != null) setFollowCount(s.followCount);
    if (user && s.isFollowing != null) setFollowed(!!s.isFollowing);
    if (s.rating != null) setDisplayRating(s.rating);
    if (s.reviewCount != null) setDisplayRatingCount(s.reviewCount);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);

  useEffect(() => {
    if (!story?.id || !user) { if (!user) setFollowed(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = story as any;
    if (s.isFollowing != null) return;
    getFollowStatus(story.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((res: any) => setFollowed(!!(res?.data ?? res)))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id, user]);

  useEffect(() => {
    if (!story?.id) return;
    const fetchReviews = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res: any = await getRatingsByStory(story.id);
        const list: any[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setReviews(list.map((r: any) => ({ ...r, rating: r.score ?? r.rating ?? 0 })));
      } catch {}
    };
    fetchReviews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);

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
        toggleLike(story.id);
        if (data?.followCount != null) setFollowCount(data.followCount);
        else setFollowCount((c) => (c ?? 0) + 1);
        toast.success("Đã thêm vào yêu thích!");
      } else {
        setFollowed(false);
        toggleLike(story.id);
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

  const avgRating = displayRating > 0 ? Number(displayRating).toFixed(1) : "—";
  const relatedStories = stories.filter((s) => s.id !== story.id && s.genre === story.genre).slice(0, 3);

  return (
    <>
    <div className="fade-in">
      <div className="detail-wrap">
        <div className="mobile-user-info">
          <button className="back-btn" onClick={() => router.push("/homePage")}>
            <Ico.Back /> Quay lại
          </button>

          <div className="detail-cover-row" style={{ alignItems: "flex-start" }}>
            <div className="detail-cover shrink-0" style={{ width: 140, height: 200 }}>
              <div className="w-full h-full" style={{ background: story.cover }} />
            </div>

            <div className="hero-left flex flex-col" style={{ gap: 10 }}>
              <div>
                <span className={`story-status-badge ${story.status === "done" ? "badge-done" : "badge-ongoing"}`} style={{ position: "static" }}>
                  {story.status === "done" ? "✓ Hoàn thành" : "Đang ra"}
                </span>
              </div>
              <h1 className="detail-title" style={{ marginBottom: 0 }}>{story.title}</h1>
              <div className="flex items-center flex-wrap" style={{ gap: "4px 6px", fontSize: 13, color: "#9e8e82" }}>
                <span>Tác giả:</span>
                <span style={{ color: "#c23d3f", fontWeight: 600, fontSize: 14 }}>{story.author}</span>
                <span style={{ color: "#ddd" }}>·</span>
                <span style={{ color: "#b0a096", fontStyle: "italic" }}>{story.penName}</span>
              </div>
              <div className="flex flex-wrap items-center" style={{ gap: "6px" }}>
                <span className="tag" style={{ background: "#fde8e8", color: "#c23d3f", border: "1.5px solid #f0b4b5", fontWeight: 600 }}>{story.genre}</span>
                {story.tags?.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
              <div className="flex items-stretch rounded-xl overflow-hidden" style={{ border: "1.5px solid #ece6dc", background: "#fff", alignSelf: "flex-start" }}>
                {[
                  { num: story.reads, label: "Lượt đọc" },
                  { num: chapters.length || story.chapters || 0, label: "Chương" },
                  { num: displayRatingCount, label: "Đánh giá" },
                  { num: followCount != null ? followCount.toLocaleString("vi-VN") : (story.favorites || 0).toLocaleString("vi-VN"), label: "Yêu thích" },
                ].map(({ num, label }, i) => (
                  <div key={label} className="stat" style={{ padding: "10px 18px", borderRight: i < 3 ? "1.5px solid #ece6dc" : "none", minWidth: 72 }}>
                    <div className="stat-num">{num}</div>
                    <div className="stat-label">{label}</div>
                  </div>
                ))}
              </div>
              <div className="detail-rating" style={{ marginBottom: 0 }}>
                <StarRating rating={parseFloat(avgRating) || 0} size={18} />
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#c23d3f" }}>{avgRating}</span>
                <span style={{ fontSize: 13, color: "#9e8e82" }}>/ 5</span>
              </div>
              <div className="detail-actions" style={{ marginTop: 4, flexWrap: "nowrap", gap: 6 }}>
                <button
                  className="btn-hero btn-hero-primary"
                  style={{ fontSize: 12, padding: "8px 14px", gap: 5 }}
                  onClick={() => {
                    const first = chapters[0];
                    if (!first?.id) return;
                    if (first.locked && !unlockedChapters?.includes(first.id)) { requireAuth(() => {}); }
                    else { setSelectedChapterId(first.id); router.push("/readerPage"); }
                  }}
                >
                  <Ico.Book /> Đọc từ đầu
                </button>
                <button
                  className={`btn-hero ${followed ? "btn-hero-primary" : "btn-hero-outline"}`}
                  style={ followed ? { background: "#fde8e8", color: "#c23d3f", borderColor: "#c23d3f", fontSize: 12, padding: "8px 14px", gap: 5, opacity: followLoading ? 0.6 : 1 } : { borderColor: "#c23d3f", color: "#c23d3f", fontSize: 12, padding: "8px 14px", gap: 5, opacity: followLoading ? 0.6 : 1 } }
                  disabled={followLoading} onClick={handleToggleFollow}
                >
                  <Ico.Heart f={followed} /> {followed ? "Đã yêu thích" : "Yêu thích"}
                </button>
                <button
                  className="btn-hero btn-hero-outline"
                  style={{ fontSize: 12, padding: "8px 14px", color: ratingSubmitted ? "#c23d3f" : "#6b5a4e", borderColor: ratingSubmitted ? "#c23d3f" : "#e8e0d6" }}
                  onClick={() => requireAuth(() => setRatingModalOpen(true))}
                >
                  ⭐ {ratingSubmitted ? `${myScore}/5` : "Đánh giá"}
                </button>
                <button
                  className="btn-hero btn-hero-outline"
                  style={{ fontSize: 12, padding: "8px 14px", color: "#9ca3af", borderColor: "#e8e0d6" }}
                  onClick={() => requireAuth(() => setStoryReportOpen(true))}
                >
                  🚩 Báo cáo
                </button>
                <button
                  className="btn-hero btn-hero-outline"
                  style={{ fontSize: 12, padding: "8px 14px", color: "#b08430", borderColor: "#f0daa8", background: giftOpen ? "#fef9ee" : undefined }}
                  onClick={() => requireAuth(() => setGiftOpen((o) => !o))}
                >
                  🎁 Tặng quà
                </button>
              </div>
            </div>
          </div>

          <GiftPanel isOpen={giftOpen} storyId={story.id} author={story.author} onClose={() => setGiftOpen(false)} />
          <ReportPanel isOpen={storyReportOpen} storyId={story.id} storyTitle={story.title} onClose={() => setStoryReportOpen(false)} />

          <blockquote className="detail-desc">{story.description}</blockquote>

          <div className="sec-head" style={{ marginBottom: 12 }}>
            <div className="sec-title" style={{ fontSize: 18 }}>
              Danh sách chương
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 400, color: "#9e8e82", marginLeft: 6 }}>
                ({chapters.length} chương · {chapters.reduce((s, c) => s + (c.words || 0), 0).toLocaleString()} chữ)
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
                    if (!isLocked && ch.id) { setSelectedChapterId(ch.id); router.push("/readerPage"); }
                    else if (isLocked) { requireAuth(() => {}); }
                  }}
                  style={ isLocked ? { cursor: "pointer", background: "#fdf7f0", borderColor: "#f0dfc8" } : {} }
                >
                  <span className="shrink-0 text-center font-bold" style={{ width: 28, fontSize: 12, color: "#c9b89a", fontFamily: "DM Sans, sans-serif" }}>{i + 1}</span>
                  <div className="hero-left" style={{ flex: 1 }}>
                    <div className="ch-title flex items-center" style={{ gap: 6 }}>
                      {isLocked && <span className="shrink-0 font-bold" style={{ fontSize: 10, background: "#fef3c7", color: "#b45309", border: "1px solid #fcd34d", padding: "1px 7px", borderRadius: 10 }}>🔒 VIP</span>}
                      {ch.title}
                    </div>
                    <div className="ch-meta flex items-center gap-1">
                      <Ico.Book /> {ch.words.toLocaleString()} chữ · ⏱ {ch.readTime}{ch.publishedAt && ` · ${ch.publishedAt}`}
                    </div>
                  </div>
                  {isLocked ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); requireAuth(() => setConfirmPurchase({ id: ch.id, title: ch.title, price: ch.price || 10 })); }}
                      className="flex items-center shrink-0 whitespace-nowrap font-bold"
                      style={{ gap: 5, background: "linear-gradient(135deg,#c69526,#9a7020)", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer", boxShadow: "0 2px 8px rgba(194,149,38,.3)" }}
                    >
                      🪙 {ch.price} xu
                    </button>
                  ) : (
                    <div className="ch-arrow"><Ico.Next /></div>
                  )}
                </div>
              );
            })}
          </div>

          <ReviewSection
            reviews={reviews}
            ratingSubmitted={ratingSubmitted}
            myScore={myScore}
            myReview={myReview}
            onOpenRatingModal={() => setRatingModalOpen(true)}
          />
        </div>

        <div className="detail-sidebar">
          <div className="sidebar-card" style={{ padding: "16px 14px" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="sidebar-title" style={{ marginBottom: 0 }}>Cùng thể loại</div>
              <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#fde8e8", color: "#c23d3f", border: "1px solid #f0b4b5" }}>{story.genre}</span>
            </div>
            {relatedStories.length > 0 ? (
              <div className="flex flex-col" style={{ gap: 8 }}>
                {relatedStories.map((s) => (
                  <div
                    key={s.id} onClick={() => gotoStory(s)}
                    style={{ display: "flex", gap: 10, padding: 10, borderRadius: 12, cursor: "pointer", border: "1.5px solid #f0ebe3", background: "#fdfaf7", transition: "all .15s", position: "relative", overflow: "hidden" }}
                    onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "#c23d3f"; el.style.background = "#fff"; el.style.boxShadow = "0 4px 16px rgba(194,61,63,.1)"; }}
                    onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "#f0ebe3"; el.style.background = "#fdfaf7"; el.style.boxShadow = "none"; }}
                  >
                    <div className="shrink-0 rounded-lg overflow-hidden" style={{ width: 52, height: 72, background: s.cover, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", position: "relative" }}>
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, textAlign: "center", fontSize: 8, fontWeight: 700, color: "#fff", letterSpacing: "0.3px", padding: "2px 0", background: s.status === "done" ? "rgba(28,101,58,.85)" : "rgba(194,61,63,.85)" }}>
                        {s.status === "done" ? "HOÀN THÀNH" : "ĐANG RA"}
                      </div>
                    </div>
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#1c1512", lineHeight: 1.35, marginBottom: 3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.title}</div>
                        <div style={{ fontSize: 11, color: "#9e8e82", fontStyle: "italic" }}>{s.penName}</div>
                      </div>
                      <div className="flex items-center flex-wrap" style={{ gap: "3px 8px", marginTop: 5 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#c69526" }}>★ {s.rating}</span>
                        <span style={{ fontSize: 10, color: "#e0d8d0" }}>·</span>
                        <span style={{ fontSize: 11, color: "#9e8e82" }}>{s.reads} đọc</span>
                        <span style={{ fontSize: 10, color: "#e0d8d0" }}>·</span>
                        <span style={{ fontSize: 11, color: "#9e8e82" }}>{chapters.length} ch.</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6" style={{ color: "#b0a096", fontSize: 13, textAlign: "center" }} >
                <div style={{ fontSize: 28, marginBottom: 6 }}>📚</div>Chưa có truyện cùng thể loại
              </div>
            )}
          </div>

          <div className="sidebar-card">
            <div className="sidebar-title">Thông vị tác phẩm</div>
            {(
              [
                ["Tác giả", story.author],
                ["Trạng thái", story.status === "done" ? "Hoàn thành" : "Đã xuất bản"],
                ["Số chương", `${chapters.length || story.chapters || 0} chương`],
                ["Lượt đọc", story.reads],
                ["Yêu thích", `${(followCount ?? story.favorites ?? 0).toLocaleString("vi-VN")} người`],
                ["Đánh giá", `${avgRating}/5 (${displayRatingCount} đánh giá)`],
              ] as [string, string][]
            ).map(([k, v], i, arr) => (
              <div key={k} className="flex justify-between text-sm" style={{ padding: "9px 0", borderBottom: i < arr.length - 1 ? "1px solid #f5ede4" : "none" }}>
                <span style={{ color: "#9e8e82" }}>{k}</span>
                <span style={{ fontWeight: 600, color: "#1c1512", marginLeft: 8, textAlign: "right" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    <RatingModal
      isOpen={ratingModalOpen}
      onClose={() => setRatingModalOpen(false)}
      storyTitle={story.title}
      ratingSubmitted={ratingSubmitted}
      initialScore={myScore}
      initialReview={myReview}
      onDelete={() => {
        setMyScore(0);
        setMyReview("");
        setRatingSubmitted(false);
        setRatingModalOpen(false);
      }}
      onSubmit={async (score, review) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (rateStory as any)({ storyId: story.id, score, review: review || undefined });
        toast.success(ratingSubmitted ? "Đã cập nhật đánh giá!" : "Cảm ơn bạn đã đánh giá! ⭐");
        setRatingSubmitted(true);
        setMyScore(score);
        setMyReview(review);
        // Refresh
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getRatingsByStory(story.id).then((res: any) => {
          const list: any[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setReviews(list.map((r: any) => ({ ...r, rating: r.score ?? r.rating ?? 0 })));
        }).catch(() => {});
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getStory(story.id).then((res: any) => {
          const s = res?.data ?? res;
          if (s?.avgRating != null) setDisplayRating(s.avgRating);
          if (s?.ratingCount != null) setDisplayRatingCount(s.ratingCount);
        }).catch(() => {});
      }}
    />

    <PurchaseChapterModal
      confirmPurchase={confirmPurchase}
      onClose={() => setConfirmPurchase(null)}
    />
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