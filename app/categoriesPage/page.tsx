"use client";
import { StoryCard } from "@/components/storyCard/page";
import { GENRES, GENRE_META } from "@/utils/mockData";
import { useState } from "react";
import { useStoryStore } from "@/stores/storyStore";
import { useNavStore } from "@/stores/navStore";
import { useRouter } from "next/navigation";
import { useGotoStory } from "@/hooks/useGotoStory";

export function CategoriesPage() {
  const { stories, setActiveGenre } = useStoryStore();
  const { navTo } = useNavStore();
  const router = useRouter();
  const gotoStory = useGotoStory();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const catStories = selectedCat
    ? stories.filter((s) => s.genre === selectedCat)
    : [];

  return (
    <div className="section fade-in">
      <div className="page-title">📚 Thể Loại</div>
      <div className="page-sub">Khám phá tất cả thể loại truyện</div>
      <div className="cat-grid">
        {GENRES.map((g) => {
          const meta = GENRE_META[g];
          return (
            <div
              key={g}
              className="cat-card"
              style={{ background: meta.bg }}
              onClick={() => setSelectedCat(selectedCat === g ? null : g)}
            >
              <div className="cat-icon">{meta.icon}</div>
              <div className="cat-title">{g}</div>
              <div className="cat-count">
                {stories.filter((s) => s.genre === g).length} tác phẩm
              </div>
              {selectedCat === g && (
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "rgba(255,255,255,.3)",
                    borderRadius: 20,
                    padding: "2px 8px",
                    fontSize: 11,
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  Đang xem
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedCat && catStories.length > 0 && (
        <div className="fade-in" style={{ marginTop: 32 }}>
          <div className="sec-head">
            <div>
              <div className="sec-title">
                {GENRE_META[selectedCat]?.icon} {selectedCat}
              </div>
              <div className="sec-sub">{catStories.length} tác phẩm</div>
            </div>
            <button
              className="see-all"
              onClick={() => {
                setActiveGenre(selectedCat);
                router.push("/homePage");
              }}
            >
              Xem trên trang chủ →
            </button>
          </div>
          <div className="story-grid">
            {catStories.map((s) => (
              <StoryCard
                key={s.id}
                story={s}
                onStory={() => gotoStory(s)}
                liked={false}
                onLike={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {selectedCat && catStories.length === 0 && (
        <div className="empty-state">
          Chưa có tác phẩm
          <p>Thể loại {selectedCat} chưa có tác phẩm nào.</p>
        </div>
      )}
    </div>
  );
}

export default CategoriesPage;
