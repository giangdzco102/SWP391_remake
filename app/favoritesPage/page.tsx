/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/stores";
import { useRouter } from "next/navigation";
import { useGotoStory } from "@/hooks/useGotoStory";
import useFollowService from "@/api/useFollow.service";
import useRatingService from "@/api/useRating.service";
import useStoryService from "@/api/useStory.service";
import { useToast } from "@/hooks/use-toast";

// Types
import { FavStory } from "@/types/favoritesPage";

// Constants
import { COVER_GRADIENTS, SortOption } from "@/utils/favoritesPage.constants";

// Utils
import { isRealCover } from "@/utils/favoritesPage.utils";

// Components
import { FavStoryCard } from "@/components/favoritesPage/FavStoryCard";
import { FavFilters } from "@/components/favoritesPage/FavFilters";
import { FavRatingModal, RatingModalState } from "@/components/favoritesPage/FavRatingModal";

/* ================================================================
   MAIN PAGE
   ================================================================ */
export function FavoritesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const gotoStory = useGotoStory();
  const { getFollowedStories, toggleFollow } = useFollowService();
  const { rateStory, getMyRating } = useRatingService();
  const { getStoryDetail } = useStoryService();

  const toastObj = useToast() as any;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [stories, setStories] = useState<FavStory[]>([]);
  const [loading, setLoading] = useState(false);
  const [myRatings, setMyRatings] = useState<Record<number, number>>({});
  const [search, setSearch] = useState("");
  const [filterGenre, setFilterGenre] = useState("all");
  const [filterYear, setFilterYear] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Rating modal state
  const [ratingModal, setRatingModal] = useState<RatingModalState | null>(null);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  /* ── Toast helpers ── */
  const showSuccess = (msg: string) => {
    if (typeof toastObj.toast === "function")
      toastObj.toast({ title: "Thành công", description: msg });
    else if (toastObj.success) toastObj.success(msg);
  };

  const showError = (msg: string) => {
    if (typeof toastObj.toast === "function")
      toastObj.toast({ variant: "destructive", title: "Lỗi", description: msg });
    else if (toastObj.error) toastObj.error(msg);
  };

  /* ── Data loading ── */
  const load = async () => {
    setLoading(true);
    try {
      const res: any = await getFollowedStories();
      const list: any[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      // Phase 1: render immediately with basic data
      const baseStories: FavStory[] = list.map((s: any, idx: number) => ({
        id: s.id,
        title: s.title ?? "",
        author: s.authorName ?? "",
        penName: s.authorName ?? "",
        cover: isRealCover(s.coverUrl)
          ? `url("${s.coverUrl}")`
          : COVER_GRADIENTS[idx % COVER_GRADIENTS.length],
        genre: s.categories?.[0]?.name ?? "",
        tags: [],
        rating: Number(s.avgRating ?? s.averageRating ?? 0),
        chapters: Number(s.publishedChapterCount ?? s.totalChapterCount ?? 0),
        status: s.isCompleted ? "done" : "ongoing",
        reads: String(s.viewCount ?? 0),
        favorites: 0,
        description: s.summary ?? "",
        categoryId: s.categories?.[0]?.id ?? null,
        excerpt: s.summary ?? "",
        featured: false,
        views: Number(s.viewCount ?? 0),
        updatedAt: s.updatedAt ?? new Date().toISOString(),
      }));
      setStories(baseStories);
      setLoading(false);

      // Phase 2: enrich with detail + user ratings in parallel
      const [detailResults, ratingResults] = await Promise.all([
        Promise.allSettled(list.map((s: any) => getStoryDetail(s.id))),
        Promise.allSettled(list.map((s: any) => getMyRating(s.id))),
      ]);

      const ratingMap: Record<number, number> = {};
      ratingResults.forEach((r, i) => {
        if (r.status === "fulfilled") {
          const d: any = (r.value as any)?.data ?? r.value;
          const score = Number(d?.score ?? d?.rating ?? 0);
          if (score > 0) ratingMap[list[i].id] = score;
        }
      });
      setMyRatings(ratingMap);

      setStories((prev) =>
        prev.map((story, i) => {
          const dr = detailResults[i];
          if (dr.status !== "fulfilled") return story;
          const d: any = (dr.value as any)?.data ?? dr.value;
          if (!d) return story;
          return {
            ...story,
            chapters: Number(d.allChaptersCount ?? d.totalChapterCount ?? d.chapterCount ?? story.chapters),
            views: Number(d.viewCount ?? d.totalViews ?? d.views ?? story.views),
            reads: String(d.viewCount ?? d.totalViews ?? d.views ?? story.views),
            rating: Number(d.avgRating ?? d.averageRating ?? d.rating ?? story.rating),
            genre: d.categories?.[0]?.name ?? story.genre,
            updatedAt: d.updatedAt ?? story.updatedAt,
          };
        })
      );
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
    else setStories([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ── Handlers ── */
  const handleUnfollow = async (e: React.MouseEvent, storyId: number) => {
    e.stopPropagation();
    try {
      await toggleFollow(storyId);
      setStories((prev) => prev.filter((s) => s.id !== storyId));
      showSuccess("Đã bỏ yêu thích.");
    } catch {
      showError("Không thể thực hiện. Thử lại sau.");
    }
  };

  const handleOpenRating = (e: React.MouseEvent, s: FavStory) => {
    e.stopPropagation();
    if (!user) { router.push("?login"); return; }
    setRatingModal({ storyId: s.id, title: s.title, score: myRatings[s.id] ?? 0 });
    setRatingHover(0);
  };

  const handleSubmitRating = async () => {
    if (!ratingModal || ratingModal.score === 0 || ratingSubmitting) return;
    setRatingSubmitting(true);
    try {
      await rateStory({ storyId: ratingModal.storyId, score: ratingModal.score });
      showSuccess("Đánh giá đã được gửi! ⭐");
      setMyRatings((prev) => ({ ...prev, [ratingModal.storyId]: ratingModal.score }));
      setRatingModal(null);
    } catch {
      showError("Không thể gửi đánh giá. Thử lại sau.");
    } finally {
      setRatingSubmitting(false);
    }
  };

  /* ── Derived data ── */
  const genres = useMemo(() => {
    const set = new Set(stories.map((s) => s.genre).filter(Boolean));
    return Array.from(set).sort();
  }, [stories]);

  const filtered = useMemo(() => {
    let list = [...stories];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.author.toLowerCase().includes(q)
      );
    }
    if (filterGenre !== "all") list = list.filter((s) => s.genre === filterGenre);
    if (filterYear !== "") list = list.filter((s) => s.updatedAt.includes(filterYear));
    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (sortBy === "views_desc") {
      list.sort((a, b) => b.views - a.views);
    } else if (sortBy === "views_asc") {
      list.sort((a, b) => a.views - b.views);
    }
    return list;
  }, [stories, search, filterGenre, filterYear, sortBy]);

  /* ── Early returns ── */
  if (!mounted) return null;

  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 52 }}>💔</div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            fontFamily: "'Playfair Display',serif",
            color: "#1c1512",
          }}
        >
          Chưa đăng nhập
        </div>
        <div style={{ fontSize: 14, color: "#9e8e82" }}>
          Đăng nhập để xem danh sách yêu thích của bạn
        </div>
        <button
          onClick={() => router.push("?login")}
          style={{
            padding: "11px 30px",
            borderRadius: 10,
            border: "none",
            background: "#c23d3f",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <>
      <div className="fade-in" style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 28px" }}>

        {/* ── Header & Search ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                fontFamily: "'Playfair Display',serif",
                color: "#1c1512",
                marginBottom: 4,
              }}
            >
              ❤️ Yêu Thích
            </div>
            <div style={{ fontSize: 13, color: "#9e8e82" }}>
              {loading ? "Đang tải..." : `${stories.length} tác phẩm đang theo dõi`}
            </div>
          </div>

          <div style={{ position: "relative", width: 300 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên truyện hoặc tác giả..."
              style={{
                width: "100%",
                padding: "10px 14px 10px 38px",
                borderRadius: 10,
                border: "1.5px solid #e8e0d6",
                fontSize: 13,
                color: "#3d2f28",
                background: "#fdfaf7",
                outline: "none",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#b0a096",
                fontSize: 14,
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 16,
                  color: "#b0a096",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* ── Filters ── */}
        <FavFilters
          genres={genres}
          filterGenre={filterGenre}
          onGenreChange={setFilterGenre}
          filterYear={filterYear}
          onYearChange={setFilterYear}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* ── Content ── */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 20,
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{ borderRadius: 14, overflow: "hidden", background: "#f5ede4" }}
              >
                <div style={{ paddingTop: "140%", background: "#ece6dc" }} />
                <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ height: 13, background: "#e8e0d6", borderRadius: 6 }} />
                  <div style={{ height: 11, background: "#e8e0d6", borderRadius: 6, width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "72px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>
              {stories.length === 0 ? "📚" : "🔍"}
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#1c1512", marginBottom: 6 }}>
              {stories.length === 0 ? "Chưa có tác phẩm yêu thích" : "Không tìm thấy kết quả"}
            </div>
            <div style={{ fontSize: 13, color: "#9e8e82" }}>
              {stories.length === 0
                ? "Nhấn ❤ trên tác phẩm để thêm vào đây."
                : "Thử thay đổi điều kiện tìm kiếm."}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 22,
            }}
          >
            {filtered.map((s) => (
              <FavStoryCard
                key={s.id}
                story={s}
                myRating={myRatings[s.id] ?? 0}
                onClick={() => gotoStory(s)}
                onUnfollow={(e) => handleUnfollow(e, s.id)}
                onOpenRating={(e) => handleOpenRating(e, s)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Rating Modal ── */}
      {ratingModal && (
        <FavRatingModal
          modal={ratingModal}
          hover={ratingHover}
          submitting={ratingSubmitting}
          hasExistingRating={!!(myRatings[ratingModal.storyId])}
          onClose={() => setRatingModal(null)}
          onHover={setRatingHover}
          onSelectScore={(score) =>
            setRatingModal((m) => (m ? { ...m, score } : null))
          }
          onSubmit={handleSubmitRating}
        />
      )}
    </>
  );
}

export default FavoritesPage;