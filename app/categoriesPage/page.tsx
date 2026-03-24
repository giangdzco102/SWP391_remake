"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import { useStoryStore } from "@/stores/storyStore";
import { useGotoStory } from "@/hooks/useGotoStory";
import useStoryService from "@/api/useStory.service";
import useCategoryService, { CategoryItem } from "@/api/useCategory.service";
import { toShape } from "@/utils/categoriesPage.utils";
import { CategorySection } from "@/components/categoriesPage/CategorySection";

// ── Component ─────────────────────────────────────────────────────────────────
export function CategoriesPage() {
  const { likedStories, toggleLike } = useStoryStore();
  const gotoStory = useGotoStory();
  const { getAllStories } = useStoryService();
  const { getCategories } = useCategoryService();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [allData, setAllData] = useState<ReturnType<typeof toShape>[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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
    <div className="fade-in flex flex-col w-screen items-center mt-5! px-10!">
      <div className="page-title">📚 Thể Loại</div>
      <div className="page-sub">Khám phá tất cả thể loại truyện</div>

      {loading && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#9e8e82", fontSize: 14 }}>
          Đang tải...
        </div>
      )}

      {genreList.map((genre) => (
        <CategorySection
          key={genre}
          genre={genre}
          stories={storiesByGenre[genre] ?? []}
          category={categories.find((c) => c.name === genre)}
          isExpanded={expanded[genre] || false}
          onToggleExpand={() => toggleExpand(genre)}
          likedStories={likedStories}
          onToggleLike={toggleLike}
          onGotoStory={gotoStory}
        />
      ))}

      {!loading && genreList.length === 0 && (
        <div className="empty-state">
          Chưa có dữ liệu<p>Không tìm thấy thể loại nào.</p>
        </div>
      )}
    </div>
  );
}

export default CategoriesPage;