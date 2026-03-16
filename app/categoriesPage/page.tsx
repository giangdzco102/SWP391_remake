"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StoryCard } from "@/components/storyCard/page";
import { useState, useEffect, useMemo } from "react";
import { useStoryStore } from "@/stores/storyStore";
import { useGotoStory } from "@/hooks/useGotoStory";
import useStoryService from "@/api/useStory.service";
import useCategoryService, { CategoryItem } from "@/api/useCategory.service";
import { useRouter } from "next/navigation";

// ── Constants ─────────────────────────────────────────────────────────────────
const COVER_GRADIENTS = [
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  "linear-gradient(135deg,#ffecd2,#fcb69f)",
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f7971e,#ffd200)",
];
const DEFAULT_VISIBLE = 6;

// ── Helpers ───────────────────────────────────────────────────────────────────
const isRealCover = (url?: string) => !!url && !url.includes("placeholder");

const toShape = (s: any, idx: number) => ({
  id: s.id,
  title: s.title,
  author: s.authorName ?? "",
  penName: s.authorName ?? "",
  cover: isRealCover(s.coverUrl)
    ? `url("${s.coverUrl}")`
    : COVER_GRADIENTS[idx % COVER_GRADIENTS.length],
  genre: s.categories?.[0]?.name ?? s.genre ?? "",
  tags: s.tags ?? [],
  rating: s.averageRating ?? 0,
  reviewCount: s.reviewCount ?? 0,
  reads: s.viewCount >= 1000
    ? `${(s.viewCount / 1000).toFixed(1)}K`
    : String(s.viewCount ?? 0),
  views: s.viewCount ?? 0,
  favorites: s.favoriteCount ?? 0,
  chapters: s.totalChapters ?? 0,
  description: s.summary ?? "",
  status: s.status === "COMPLETED" ? "done" : "ongoing",
  featured: false,
  excerpt: s.summary ?? "",
  updatedAt: s.updatedAt ?? "",
});

// ── Component ─────────────────────────────────────────────────────────────────
export function CategoriesPage() {
  const { likedStories, toggleLike, allStories } = useStoryStore();
  const gotoStory = useGotoStory();
  const { getAllStories } = useStoryService();
  const { getCategories } = useCategoryService();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [allData, setAllData] = useState<ReturnType<typeof toShape>[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const router = useRouter();

  // Load categories
  useEffect(() => {
    getCategories()
      .then((res: any) => setCategories(res?.data ?? res ?? []))
      .catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load stories — ưu tiên store, fallback API
  useEffect(() => {
    setLoading(true);
    getAllStories({ size: 200 })
      .then((res: any) => setAllData((res?.data ?? res ?? []).map(toShape)))
      .catch(() => { })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Group stories by genre
  const storiesByGenre = useMemo(() => {
    return allData.reduce<Record<string, ReturnType<typeof toShape>[]>>((map, s) => {
      if (s.genre) (map[s.genre] ??= []).push(s);
      return map;
    }, {});
  }, [allData]);

  // Genre list — ordered by API, append data-only genres, hiện tất cả kể cả rỗng
  const genreList = useMemo(() => {
    const fromApi = categories.map((c) => c.name);
    const fromData = Object.keys(storiesByGenre);
    return fromApi.length
      ? [...fromApi, ...fromData.filter((g) => !fromApi.includes(g))]
      : fromData;
  }, [categories, storiesByGenre]);

  const toggleExpand = (genre: string) =>
    setExpanded((prev) => ({ ...prev, [genre]: !prev[genre] }));

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fade-in flex flex-col w-screen items-center !mt-[20px] !px-10">
      <div className="page-title">📚 Thể Loại</div>
      <div className="page-sub">Khám phá tất cả thể loại truyện</div>

      {loading && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#9e8e82", fontSize: 14 }}>
          Đang tải...
        </div>
      )}

      {genreList.map((genre) => {
        const cat = categories.find((c) => c.name === genre);
        const icon = (cat as any)?.icon ?? "📖";
        const stories = storiesByGenre[genre] ?? [];
        const isExpanded = expanded[genre];
        const visible = isExpanded ? stories : stories.slice(0, DEFAULT_VISIBLE);
        const hasMore = stories.length > DEFAULT_VISIBLE;

        return (
          <div
            key={genre}
            className="fade-in bg-white w-full rounded-2xl shadow-sm border border-slate-100 flex flex-col md:gap-2 py-1! px-5!"
            style={{ marginBottom: 20 }}
          >
            {/* Header */}
            <div className="sec-head">
              <div className="flex items-center gap-2">
                <div className="sec-title">{icon} {genre}</div>
                <div className="sec-sub">{stories.length} tác phẩm</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="see-all"
                  onClick={() => router.push(`/searchResultsPage?genre=${encodeURIComponent(genre)}`)}
                >
                  Xem tất cả →
                </button>
                {hasMore && (
                  <button className="see-all" onClick={() => toggleExpand(genre)}>
                    {isExpanded ? "Thu gọn ↑" : "Mở rộng ↓"}
                  </button>
                )}
              </div>
            </div>

            {/* Stories */}
            {visible.length > 0 ? (
              <div className="story-grid" style={{ zoom: 0.8, paddingBottom: 10 }}>
                {visible.map((s) => (
                  <StoryCard
                    key={s.id}
                    story={s}
                    onStory={() => gotoStory(s)}
                    liked={likedStories.includes(s.id)}
                    onLike={() => toggleLike(s.id)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ padding: "20px 0 24px", textAlign: "center", color: "#b0a096", fontSize: 13 }}>
                Chưa có tác phẩm nào trong thể loại này
              </div>
            )}
          </div>
        );
      })}

      {!loading && genreList.length === 0 && (
        <div className="empty-state">
          Chưa có dữ liệu<p>Không tìm thấy thể loại nào.</p>
        </div>
      )}
    </div>
  );
}

export default CategoriesPage;