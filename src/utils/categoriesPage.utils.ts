/* eslint-disable @typescript-eslint/no-explicit-any */
import { COVER_GRADIENTS } from "@/utils/constants";

export const isRealCover = (url?: string) => !!url && !url.includes("placeholder");

export const toShape = (s: any, idx: number) => ({
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
