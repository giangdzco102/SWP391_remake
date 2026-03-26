/* eslint-disable @typescript-eslint/no-explicit-any */
import { StorySearchResult } from "@/types/searchResultsPage";
import { COVER_GRADIENTS } from "./searchResultsPage.constants";

export function toShape(s: any, idx: number): StorySearchResult {
  const hasRealCover = !!s.coverUrl && !s.coverUrl.includes("placeholder");
  return {
    id: s.id,
    title: s.title,
    author: s.authorName ?? "",
    penName: s.authorName ?? "",
    cover: hasRealCover
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
  };
}

export function relevanceScore(s: StorySearchResult, q: string) {
  const lq = q.toLowerCase();
  return (s.title.toLowerCase().includes(lq) ? 3 : 0)
    + (s.penName.toLowerCase().includes(lq) ? 1 : 0);
}
