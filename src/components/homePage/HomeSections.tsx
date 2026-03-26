import React from "react";
import { FilterState, StoryShape } from "@/types/homePage";
import { HOT_DISPLAY_LIMIT, PAGE_SIZE } from "@/utils/homePage.constants";
import { SectionHeader, SkeletonCard, SkeletonNewCard } from "./SectionHeader";
import { HotStoryCard } from "./HotStoryCard";
import { NewUpdateCard } from "./NewUpdateCard";
import { Pagination } from "./Pagination";

/* ── Hot Section ── */
interface HotSectionProps {
  stories: StoryShape[];
  loading: boolean;
  filters: FilterState;
  onStory: (s: StoryShape) => void;
  likedStories: number[];
  onLike: (id: number, wasLiked: boolean) => void;
}

export function HotSection({
  stories,
  loading,
  filters,
  onStory,
  likedStories,
  onLike,
}: HotSectionProps) {
  return (
    <div style={{ marginBottom: 28 }}>
      <SectionHeader
        title="🔥 Truyện hot"
        sub={
          filters.genres.length > 0
            ? `· ${filters.genres.join(", ")}`
            : undefined
        }
      />
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 12,
          }}
        >
          {Array.from({ length: HOT_DISPLAY_LIMIT }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div className="empty-state">Chưa có dữ liệu</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 12,
          }}
        >
          {stories.slice(0, HOT_DISPLAY_LIMIT).map((s, i) => (
            <HotStoryCard
              key={s.id}
              s={s}
              rank={i + 1}
              onClick={() => onStory(s)}
              liked={likedStories.includes(s.id)}
              onLike={() => onLike(s.id, likedStories.includes(s.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── New Updates Section ── */
interface NewUpdatesSectionProps {
  stories: StoryShape[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onStory: (s: StoryShape) => void;
}

export function NewUpdatesSection({
  stories,
  loading,
  page,
  totalPages,
  onPageChange,
  onStory,
}: NewUpdatesSectionProps) {
  return (
    <div id="new-updates-section" style={{ scrollMarginTop: 80 }}>
      <SectionHeader
        title="🆕 Mới cập nhật"
        sub="Cập nhật theo thời gian thực"
        right={
          <span style={{ fontSize: 12, color: "#9e8e82" }}>
            Trang {page}/{totalPages}
          </span>
        }
      />
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 4,
          }}
        >
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <SkeletonNewCard key={i} />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 4,
          }}
        >
          {stories.map((s) => (
            <NewUpdateCard key={s.id} s={s} onClick={() => onStory(s)} />
          ))}
        </div>
      )}
      <Pagination current={page} total={totalPages} onChange={onPageChange} />
    </div>
  );
}
