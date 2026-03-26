/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStoryStore } from "@/stores/storyStore";
import { useNavStore } from "@/stores/navStore";
import { useAuthStore } from "@/stores";
import { useGotoStory } from "@/hooks/useGotoStory";
import { useStoryDetailTheme } from "@/hooks/useStoryDetailTheme";
import useChapterService from "@/api/useChapter.service";
import useStoryService from "@/api/useStory.service";
import useRatingService from "@/api/useRating.service";
import useFollowService from "@/api/useFollow.service";
import { useToast } from "@/hooks/use-toast";
import { formatVNDate } from "@/utils/time";

import { StoryHero } from "@/components/storyDetailPage/StoryHero";
import { ChapterList } from "@/components/storyDetailPage/ChapterList";
import { StorySidebar } from "@/components/storyDetailPage/StorySidebar";
import { GiftPanel } from "@/components/storyDetailPage/GiftPanel";
import { ReportPanel } from "@/components/storyDetailPage/ReportPanel";
import { RatingModal } from "@/components/storyDetailPage/RatingModal";
import { PurchaseChapterModal } from "@/components/storyDetailPage/PurchaseChapterModal";
import { ReviewSection } from "@/components/storyDetailPage/ReviewSection";

// ── helper: normalize cover from API response ─────────────────────────────
const COVER_GRADIENTS = [
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  "linear-gradient(135deg,#667eea,#764ba2)",
];
const isRealCover = (url?: string) =>
  !!url &&
  !url.includes("placeholder.com") &&
  !url.includes("placeholder");

// ── helpers to map API responses ─────────────────────────────────────────
function mapStoryFromApi(s: any) {
  return {
    id: s.id,
    title: s.title ?? "",
    author: s.authorName ?? s.author?.fullName ?? "",
    authorId: s.author?.id ?? s.authorId ?? null,
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
  };
}

function mapChapters(list: any[], purchasedIds?: Set<number>) {
  return list.map((ch: any) => {
    const purchased =
      purchasedIds != null
        ? purchasedIds.has(ch.id)
        : (ch.isPurchased ?? false);
    return {
      id: ch.id,
      title: ch.title,
      chapterOrder: ch.chapterOrder ?? ch.chapterNumber ?? 0,
      coinPrice: ch.coinPrice ?? ch.price ?? 0,
      isPurchased: purchased,
      words: 0,
      readTime: "—",
      publishedAt: ch.publishAt ? formatVNDate(ch.publishAt) : undefined,
      locked: (ch.coinPrice ?? ch.price ?? 0) > 0 && !purchased,
      price: ch.coinPrice ?? ch.price ?? 0,
    };
  });
}

// ── Main inner component (needs Suspense for useSearchParams) ─────────────
function StoryDetailContent() {
  const {
    allStories: stories,
    unlockedChapters,
    chapters,
    setChapters,
    toggleLike,
  } = useStoryStore();
  const {
    selectedStory: story,
    setSelectedStory,
    setSelectedChapterId,
  } = useNavStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getStory, getStoryDetail } = useStoryService();
  const { getChaptersByStory } = useChapterService();
  const { getRatingsByStory, rateStory, getMyRating } = useRatingService();
  const { toggleFollow, getFollowStatus } = useFollowService();
  const toast = useToast();
  const { dk } = useStoryDetailTheme();

  // ── Local state ───────────────────────────────────────────────────────────
  const [storyLoading, setStoryLoading] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [followCount, setFollowCount] = useState<number | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [myScore, setMyScore] = useState(0);
  const [myReview, setMyReview] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [displayRating, setDisplayRating] = useState(0);
  const [displayRatingCount, setDisplayRatingCount] = useState(0);
  const [confirmPurchase, setConfirmPurchase] = useState<{
    id: number;
    title: string;
    price: number;
  } | null>(null);
  const [giftOpen, setGiftOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  // ── Load story from URL ?id when navStore is empty ────────────────────────
  useEffect(() => {
    const id = searchParams.get("id");
    if (story || !id) return;
    setStoryLoading(true);
    getStory(id)
      .then((res: any) => {
        const s = res?.data ?? res;
        if (!s?.id) return;
        setSelectedStory(mapStoryFromApi(s));
      })
      .catch(() => {})
      .finally(() => setStoryLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ── Load chapters ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!story?.id) return;
    setChapters([]);

    const loadFromDetail = (): Promise<any> =>
      getStoryDetail(story.id).then((r: any) => {
        const detail = r?.data ?? r;
        const detailList: any[] = Array.isArray(detail?.chapters)
          ? detail.chapters
          : [];
        if (detail?.avgRating != null) setDisplayRating(detail.avgRating);
        if (detail?.ratingCount != null)
          setDisplayRatingCount(detail.ratingCount);
        const fc = detail?.followCount ?? detail?.favoriteCount;
        if (fc != null) setFollowCount(fc);
        setChapters(mapChapters(detailList));
      });

    getChaptersByStory(story.id)
      .then((res: any) => {
        const list: any[] = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        if (!list.length) return loadFromDetail().catch(() => {});
        if (user) {
          return getStoryDetail(story.id)
            .then((r: any) => {
              const detail = r?.data ?? r;
              if (detail?.avgRating != null) setDisplayRating(detail.avgRating);
              if (detail?.ratingCount != null)
                setDisplayRatingCount(detail.ratingCount);
              const fc = detail?.followCount ?? detail?.favoriteCount;
              if (fc != null) setFollowCount(fc);
              const detailChaps: any[] = Array.isArray(detail?.chapters)
                ? detail.chapters
                : [];
              const purchasedIds = new Set<number>(
                detailChaps
                  .filter((c: any) => c.isPurchased)
                  .map((c: any) => c.id as number),
              );
              setChapters(mapChapters(list, purchasedIds));
            })
            .catch(() => setChapters(mapChapters(list)));
        }
        setChapters(mapChapters(list));
      })
      .catch(() => loadFromDetail().catch(() => {}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id, user]);

  // ── Load my existing rating ───────────────────────────────────────────────
  useEffect(() => {
    if (!story?.id || !user) return;
    getMyRating(story.id)
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

  // ── Sync follow count / rating stats from story object ────────────────────
  useEffect(() => {
    if (!story) return;
    const s = story as any;
    if (s.followCount != null) setFollowCount(s.followCount);
    if (user && s.isFollowing != null) setFollowed(!!s.isFollowing);
    if (s.rating != null) setDisplayRating(s.rating);
    if (s.reviewCount != null) setDisplayRatingCount(s.reviewCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);

  // ── Load follow status ────────────────────────────────────────────────────
  useEffect(() => {
    if (!story?.id || !user) {
      if (!user) setFollowed(false);
      return;
    }
    const s = story as any;
    if (s.isFollowing != null) return;
    getFollowStatus(story.id)
      .then((res: any) => setFollowed(!!(res?.data ?? res)))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id, user]);

  // ── Load reviews ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!story?.id) return;
    getRatingsByStory(story.id)
      .then((res: any) => {
        const list: any[] = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        setReviews(
          list.map((r: any) => ({ ...r, rating: r.score ?? r.rating ?? 0 })),
        );
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);

  // ── Auth guard helper ─────────────────────────────────────────────────────
  const requireAuth = (cb: () => void) => {
    if (!user) { router.push("?login"); return; }
    cb();
  };

  // ── Toggle follow ─────────────────────────────────────────────────────────
  const handleToggleFollow = async () => {
    if (!user) { router.push("?login"); return; }
    if (!story || followLoading) return;
    setFollowLoading(true);
    try {
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

  // ── Submit rating ─────────────────────────────────────────────────────────
  const handleSubmitRating = async (score: number, review: string) => {
    if (!story) return;
    await (rateStory as any)({ storyId: story.id, score, review: review || undefined });
    toast.success(ratingSubmitted ? "Đã cập nhật đánh giá!" : "Cảm ơn bạn đã đánh giá! ⭐");
    setMyScore(score);
    setMyReview(review);
    setRatingSubmitted(true);
    // Refresh data
    getRatingsByStory(story.id)
      .then((res: any) => {
        const list: any[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setReviews(list.map((r: any) => ({ ...r, rating: r.score ?? r.rating ?? 0 })));
      })
      .catch(() => {});
    getStory(story.id)
      .then((res: any) => {
        const s = res?.data ?? res;
        if (s?.avgRating != null) setDisplayRating(s.avgRating);
        if (s?.ratingCount != null) setDisplayRatingCount(s.ratingCount);
      })
      .catch(() => {});
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const avgRating =
    displayRating > 0 ? Number(displayRating).toFixed(1) : "—";
  const relatedStories = stories
    .filter((s) => s.id !== story?.id && s.genre === story?.genre)
    .slice(0, 3);

  // ── Loading / Not found screens ───────────────────────────────────────────
  if (!story) {
    if (storyLoading) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            fontSize: 14,
            color: dk.textFaint,
          }}
        >
          <div>⏳ Đang tải thông tin truyện...</div>
        </div>
      );
    }
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <div
          style={{ fontSize: 18, fontWeight: 700, color: dk.text, marginBottom: 8 }}
        >
          Không tìm thấy truyện
        </div>
        <div style={{ fontSize: 14, color: dk.textFaint, marginBottom: 24 }}>
          Truyện không tồn tại hoặc đã bị xóa.
        </div>
        <button
          onClick={() => router.push("/homePage")}
          style={{
            padding: "10px 24px",
            borderRadius: 10,
            border: "none",
            background: "#c23d3f",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ← Về trang chủ
        </button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="fade-in">
        <div className="detail-wrap">
          {/* Main column */}
          <div className="mobile-user-info">
            <button
              className="back-btn"
              onClick={() => router.push("/homePage")}
            >
              ← Quay lại
            </button>

            {/* Hero */}
            <StoryHero
              story={story as any}
              chapters={chapters}
              unlockedChapters={unlockedChapters}
              followed={followed}
              followLoading={followLoading}
              followCount={followCount}
              displayRating={displayRating}
              displayRatingCount={displayRatingCount}
              ratingSubmitted={ratingSubmitted}
              myScore={myScore}
              giftOpen={giftOpen}
              onToggleFollow={handleToggleFollow}
              onOpenRatingModal={() => {
                if (!user) { router.push("?login"); return; }
                setRatingModalOpen(true);
              }}
              onToggleGift={() => requireAuth(() => setGiftOpen((o) => !o))}
              onToggleReport={() => requireAuth(() => setReportOpen((o) => !o))}
              onReadFirst={() => {
                const first = chapters[0];
                if (!first?.id) return;
                const firstLocked =
                  first.locked && !unlockedChapters?.includes(first.id);
                if (firstLocked) {
                  requireAuth(() => {});
                } else {
                  setSelectedChapterId(first.id);
                  router.push("/readerPage");
                }
              }}
            />

            {/* Gift panel */}
            <GiftPanel
              isOpen={giftOpen}
              storyId={story.id}
              author={story.author}
              onClose={() => setGiftOpen(false)}
            />

            {/* Report panel */}
            <ReportPanel
              isOpen={reportOpen}
              storyId={story.id}
              storyTitle={story.title}
              onClose={() => setReportOpen(false)}
            />

            <blockquote className="detail-desc">
              {story.description}
            </blockquote>

            {/* Chapter list */}
            <ChapterList
              chapters={chapters as any}
              unlockedChapters={unlockedChapters}
              onRequireAuth={() => requireAuth(() => {})}
              onConfirmPurchase={(ch) =>
                requireAuth(() => setConfirmPurchase(ch))
              }
              onSelectChapter={(id) => {
                setSelectedChapterId(id);
                router.push("/readerPage");
              }}
            />

            {/* Reviews */}
            <ReviewSection
              reviews={reviews}
              ratingSubmitted={ratingSubmitted}
              myScore={myScore}
              myReview={myReview}
              storyAuthorId={(story as any).authorId}
              onOpenRatingModal={() => setRatingModalOpen(true)}
            />
          </div>

          {/* Sidebar */}
          <StorySidebar
            story={story as any}
            relatedStories={relatedStories as any}
            chaptersCount={chapters.length || (story as any).chapters || 0}
            followCount={followCount}
            avgRating={avgRating}
            displayRatingCount={displayRatingCount}
          />
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        storyTitle={story.title}
        ratingSubmitted={ratingSubmitted}
        initialScore={myScore}
        initialReview={myReview}
        onSubmit={handleSubmitRating}
        onDelete={() => {
          setMyScore(0);
          setMyReview("");
          setRatingSubmitted(false);
        }}
      />

      {/* Purchase Chapter Modal */}
      <PurchaseChapterModal
        confirmPurchase={confirmPurchase}
        onClose={() => setConfirmPurchase(null)}
      />
    </>
  );
}

// ── Page export ───────────────────────────────────────────────────────────
export function StoryDetailPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            fontSize: 14,
            color: "#9e8e82",
          }}
        >
          <div>⏳ Đang tải thông tin truyện...</div>
        </div>
      }
    >
      <StoryDetailContent />
    </Suspense>
  );
}

export default StoryDetailPage;