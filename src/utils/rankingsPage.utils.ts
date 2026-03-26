import { COVER_GRADIENTS } from "./rankingsPage.constants";
import { RankedStory } from "@/types/rankingsPage";

export const isRealCover = (url?: string) =>
  !!url && !url.includes("placeholder.com") && !url.includes("placeholder");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toStoryShape(s: any, idx: number): RankedStory {
  return {
    id: s.id,
    title: s.title ?? "",
    author: s.authorName ?? "",
    penName: s.authorName ?? "",
    cover: isRealCover(s.coverUrl)
      ? `url("${s.coverUrl}")`
      : COVER_GRADIENTS[idx % COVER_GRADIENTS.length],
    genre: s.categories?.[0]?.name ?? "",
    rating: s.avgRating ?? 0,
    reads: s.viewCount != null ? String(s.viewCount) : "0",
    views: s.viewCount ?? 0,
    favorites: s.followCount ?? s.favoriteCount ?? 0,
    chapters: s.publishedChapterCount ?? s.totalChapterCount ?? 0,
    status: s.isCompleted ? "done" : "ongoing",
  };
}

export const getRankStyle = (rank: number) => {
  if (rank === 1) return "text-yellow-500 font-black text-4xl drop-shadow-sm";
  if (rank === 2) return "text-slate-400 font-bold text-3xl drop-shadow-sm";
  if (rank === 3) return "text-amber-700 font-bold text-3xl drop-shadow-sm";
  return "text-slate-300 font-semibold text-2xl";
};
