"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StoryCard } from "@/components/storyCard/page";
import { useRouter } from "next/navigation";
import { CategoryItem } from "@/api/useCategory.service";

export interface CategorySectionProps {
  genre: string;
  stories: any[];
  category?: CategoryItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  likedStories: number[];
  onToggleLike: (id: number) => void;
  onGotoStory: (story: any) => void;
}

const DEFAULT_VISIBLE = 6;

export function CategorySection({
  genre,
  stories,
  category,
  isExpanded,
  onToggleExpand,
  likedStories,
  onToggleLike,
  onGotoStory,
}: CategorySectionProps) {
  const router = useRouter();
  const icon = (category as any)?.icon ?? "📖";
  const visible = isExpanded ? stories : stories.slice(0, DEFAULT_VISIBLE);
  const hasMore = stories.length > DEFAULT_VISIBLE;

  return (
    <div
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
            <button className="see-all" onClick={onToggleExpand}>
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
              onStory={() => onGotoStory(s)}
              liked={likedStories.includes(s.id)}
              onLike={() => onToggleLike(s.id)}
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
}
