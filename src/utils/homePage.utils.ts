import { FilterState, SortOrder, StoryShape } from "@/types/homePage";
import { COVER_GRADIENTS } from "@/utils/homePage.constants";

export const isRealCover = (url?: string): boolean =>
  !!url && !url.includes("placeholder.com") && !url.includes("placeholder");

export const formatViews = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

export const toStoryShape = (s: any, idx: number): StoryShape => ({
  id: s.id,
  title: s.title,
  author: s.authorName ?? "",
  penName: s.authorName ?? "",
  cover: isRealCover(s.coverUrl)
    ? `url("${s.coverUrl}")`
    : COVER_GRADIENTS[idx % COVER_GRADIENTS.length],
  coverUrl: s.coverUrl ?? "",
  genre: s.categories?.[0]?.name ?? s.genre ?? "",
  categoryId: s.categories?.[0]?.id ?? null,
  tags: s.tags ?? [],
  rating: s.averageRating ?? 0,
  reviewCount: s.reviewCount ?? 0,
  reads: s.viewCount != null ? formatViews(s.viewCount) : "0",
  views: s.viewCount ?? 0,
  favorites: s.favoriteCount ?? 0,
  chapters: s.totalChapters ?? 0,
  description: s.summary ?? s.description ?? "",
  status: s.status === "COMPLETED" ? "done" : "ongoing",
  featured: s.featured ?? false,
  excerpt: s.summary ?? "",
  updatedAt: s.updatedAt ?? s.createdAt ?? "",
});

export const sortToApiParam = (s: SortOrder): string =>
  s === "views_desc"
    ? "viewCount,desc"
    : s === "views_asc"
    ? "viewCount,asc"
    : "updatedAt,desc";

export const toggleItem = <T,>(arr: T[], val: T): T[] =>
  arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

export const countActiveFilters = (f: FilterState): number =>
  f.genres.length +
  f.years.length +
  (f.status !== "all" ? 1 : 0) +
  (f.sort !== "updated_desc" ? 1 : 0);
