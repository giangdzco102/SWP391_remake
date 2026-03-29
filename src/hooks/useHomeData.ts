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
      .then((res: any) => {
        const payload = res?.data ?? res ?? {};
        const raw: any[] = payload.content ?? payload ?? [];
        setStories(raw.map(toStoryShape));
      })
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
    if (filters.genres.length > 0) params.categories = filters.genres.join(",");
    if (filters.status === "done") params.status = "COMPLETED";
    if (filters.status === "ongoing") params.status = "ONGOING";
    if (filters.years.length > 0) params.year = filters.years[0];

    getStories(params)
      .then((res: any) => {
        const payload = res?.data ?? res ?? {};
        const raw: any[] = payload.content ?? payload ?? [];
        const storyShapes = raw.map(toStoryShape);

        setStories(storyShapes);
        setTotalPages(payload.totalPages ?? 1);
        setAllStories(storyShapes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  return { stories, totalPages, loading };
}
