/* eslint-disable react/no-unescaped-entities */
"use client";
import { useStoryStore } from "@/stores/storyStore";
import { useGotoStory } from "@/hooks/useGotoStory";
import { StoryCard } from "../../src/components/storyCard/page";

export function SearchResultsPage() {
  const { searchQ, stories } = useStoryStore();
  const gotoStory = useGotoStory();

  const results =
    searchQ.trim().length > 1
      ? stories.filter(
          (s) =>
            s.title.toLowerCase().includes(searchQ.toLowerCase()) ||
            s.penName.toLowerCase().includes(searchQ.toLowerCase()) ||
            s.genre.toLowerCase().includes(searchQ.toLowerCase()),
        )
      : [];

  return (
    <div className="section fade-in">
      <div className="page-title">🔍 Kết quả tìm kiếm</div>
      <div className="page-sub">
        "{searchQ}" — {results.length} kết quả
      </div>
      {results.length === 0 ? (
        <div className="empty-state">
          Không tìm thấy kết quả<p>Thử tìm với từ khóa khác.</p>
        </div>
      ) : (
        <div className="story-grid">
          {results.map((s) => (
            <StoryCard
              key={s.id}
              story={s}
              onStory={() => gotoStory(s)}
              liked={false}
              onLike={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResultsPage;
