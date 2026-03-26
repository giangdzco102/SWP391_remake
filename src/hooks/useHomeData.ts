/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import useCategoryService, { CategoryItem } from "@/api/useCategory.service";
import useStoryService from "@/api/useStory.service";
import { useStoryStore } from "@/stores/storyStore";
import { FilterState, StoryShape } from "@/types/homePage";
import { HOT_FETCH_SIZE, PAGE_SIZE } from "@/utils/homePage.constants";
import { sortToApiParam, toStoryShape } from "@/utils/homePage.utils";

/** Fetch category list once on mount */
export function useCategories(): CategoryItem[] {
  const { getCategories } = useCategoryService();
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    getCategories()
      .then((res: any) => setCategories(res?.data ?? res ?? []))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return categories;
}

/** Fetch hot stories once on mount */
export function useHotStories(): { stories: StoryShape[]; loading: boolean } {
  const { getStories } = useStoryService();
  const [stories, setStories] = useState<StoryShape[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getStories({ size: HOT_FETCH_SIZE, sort: "viewCount,desc" })
      .then((res: any) =>
        setStories((res?.data ?? res ?? []).map(toStoryShape))
      )
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { stories, loading };
}

/** Fetch new-update stories — re-fetches when page or filters change */
export function useNewStories(
  page: number,
  filters: FilterState
): { stories: StoryShape[]; totalPages: number; loading: boolean } {
  const { getStories } = useStoryService();
  const { setAllStories } = useStoryStore();
  const [stories, setStories] = useState<StoryShape[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, any> = {
      size: PAGE_SIZE,
      page: page - 1,
      sort: sortToApiParam(filters.sort),
    };
    if (filters.genres.length === 1) params.category = filters.genres[0];
    if (filters.genres.length > 1) params.categories = filters.genres.join(",");
    if (filters.status === "done") params.status = "COMPLETED";
    if (filters.status === "ongoing") params.status = "ONGOING";
    if (filters.years.length > 0) params.year = filters.years[0];

    getStories(params)
      .then((res: any) => {
        const raw: any[] = res?.data ?? res?.content ?? res ?? [];
        const filtered = raw.map(toStoryShape).filter((s) => {
          if (filters.genres.length > 0 && !filters.genres.includes(s.genre)) return false;
          if (filters.status !== "all" && s.status !== filters.status) return false;
          if (filters.years.length > 0) {
            const y = s.updatedAt ? new Date(s.updatedAt).getFullYear() : null;
            if (!y || !filters.years.includes(y)) return false;
          }
          return true;
        });

        const tp = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
        setTotalPages(tp);

        const start = (page - 1) * PAGE_SIZE;
        setStories(filtered.slice(start, start + PAGE_SIZE));
        setAllStories(filtered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  return { stories, totalPages, loading };
}
