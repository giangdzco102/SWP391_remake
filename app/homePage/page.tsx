"use client";
import { useEffect, useState } from "react";
import { Ico } from "@/components/Icons";
import { useStoryStore } from "@/stores/storyStore";
import { useNavStore } from "@/stores/navStore";
import { useToast } from "@/hooks/use-toast";
import { useGotoStory } from "@/hooks/useGotoStory";
import { StoryCard } from "../../src/components/storyCard/page";
import useStoryService from "@/api/useStory.service";
import useCategoryService, { CategoryItem } from "@/api/useCategory.service";

// Gradient fallbacks khi cover chưa có
const COVER_GRADIENTS = [
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  "linear-gradient(135deg,#ffecd2,#fcb69f)",
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f7971e,#ffd200)",
];

// Map API response item → shape mà StoryCard cần
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isRealCover = (url?: string) =>
  !!url &&
  !url.includes("placeholder.com") &&
  !url.includes("via.placeholder") &&
  !url.includes("placeholder");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toStoryShape = (s: any, idx: number) => ({
  id: s.id,
  title: s.title,
  author: s.authorName ?? "",
  penName: s.authorName ?? "",
  cover: isRealCover(s.coverUrl)
    ? `url("${s.coverUrl}")`
    : COVER_GRADIENTS[idx % COVER_GRADIENTS.length],
  genre: s.categories?.[0]?.name ?? s.genre ?? "",
  tags: [],
  rating: s.averageRating ?? 0,
  reviewCount: 0,
  reads:
    s.viewCount != null
      ? s.viewCount >= 1000
        ? `${(s.viewCount / 1000).toFixed(1)}K`
        : String(s.viewCount)
      : "0",
  views: s.viewCount ?? 0,
  favorites: s.favoriteCount ?? 0,
  chapters: s.totalChapters ?? 0,
  description: s.summary ?? "",
  status: s.status === "APPROVED" ? "ongoing" : "pending",
  featured: false,
  excerpt: s.summary ?? "",
});

export function HomePage() {
  const {
    stories,
    allStories,
    activeGenre,
    setActiveGenre,
    setStories,
    setAllStories,
    likedStories,
    toggleLike,
  } = useStoryStore();
  const { navTo } = useNavStore();
  const gotoStory = useGotoStory();
  const toast = useToast();
  const { getStories } = useStoryService();
  const { getCategories } = useCategoryService();
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    getStories({ size: 20 })
      .then((res: any) => {
        const list: any[] = res?.data ?? res ?? [];
        const mapped = list.map(toStoryShape);
        setStories(mapped);
        setAllStories(mapped);
      })
      .catch(() => {
        // giữ mock data nếu API lỗi
      });

    getCategories()
      .then((res: any) => {
        const list: CategoryItem[] = res?.data ?? res ?? [];
        setCategories(list);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredStories =
    activeGenre === "all"
      ? stories
      : stories.filter((s) => s.genre === activeGenre);

  return (
    <div className="fade-in">
      {/* Genre filter */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="genre-filters">
          {[{ id: 0, name: "all" }, ...categories].map((cat) => (
            <button
              key={cat.id}
              className={`tab-btn${activeGenre === cat.name ? " active" : ""}`}
              onClick={() => setActiveGenre(cat.name)}
            >
              {cat.name === "all" ? "Tất cả" : cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Story grid */}
      <div className="section" style={{ paddingTop: 20 }}>
        <div className="sec-head">
          <div>
            <div className="sec-title">
              {activeGenre === "all" ? "Tác phẩm nổi bật" : activeGenre}
            </div>
            <div className="sec-sub">{stories.length} tác phẩm</div>
          </div>
          <button className="see-all" onClick={() => navTo("categories")}>
            Xem tất cả →
          </button>
        </div>
        {filteredStories.length === 0 ? (
          <div className="empty-state">
            Không có tác phẩm nào<p>Thể loại này chưa có tác phẩm.</p>
          </div>
        ) : (
          <div className="story-grid">
            {filteredStories.map((s) => (
              <StoryCard
                key={s.id}
                story={s}
                onStory={() => gotoStory(s)}
                liked={likedStories.includes(s.id)}
                onLike={() => {
                  toggleLike(s.id);
                  toast.success(
                    likedStories.includes(s.id)
                      ? "Đã bỏ yêu thích"
                      : "Đã thêm vào yêu thích ❤",
                  );
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Newly Updated Section */}
      <div className="section" style={{ paddingTop: 20 }}>
        <div className="sec-head">
          <div>
            <div className="sec-title">Tác phẩm mới cập nhật</div>
            <div className="sec-sub">
              Đừng bỏ lỡ những chương truyện mới nhất vừa ra lò
            </div>
          </div>
          <button className="see-all" onClick={() => navTo("categories")}>
            Xem tất cả →
          </button>
        </div>
        {allStories.length === 0 ? (
          <div className="empty-state">Chưa có tác phẩm nào</div>
        ) : (
          <div className="story-grid">
            {allStories.slice(0, 8).map((s) => (
              <StoryCard
                key={s.id}
                story={s}
                onStory={() => gotoStory(s)}
                liked={likedStories.includes(s.id)}
                onLike={() => toggleLike(s.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick ranks teaser */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="sec-head">
          <div>
            <div className="sec-title">🏆 Top bảng xếp hạng</div>
          </div>
          <button className="see-all" onClick={() => navTo("rankings")}>
            Xem đầy đủ →
          </button>
        </div>
        <div className="rank-table">
          {[...allStories]
            .sort((a, b) => parseFloat(b.reads) - parseFloat(a.reads))
            .slice(0, 5)
            .map((s, i) => (
              <div key={s.id} className="rank-row" onClick={() => gotoStory(s)}>
                <span
                  className={`rank-num ${i === 0 ? "rank-1" : i === 1 ? "rank-2" : i === 2 ? "rank-3" : "rank-num-other"}`}
                >
                  {i + 1}
                </span>
                <div className="rank-cover" style={{ background: s.cover }} />
                <div className="rank-info">
                  <div className="rank-title">{s.title}</div>
                  <div className="rank-author">
                    {s.penName} · {s.genre}
                  </div>
                  <div className="rank-stats">
                    <span>⭐ {s.rating}</span>
                    <span>
                      <Ico.Eye /> {s.reads}
                    </span>
                    <span>❤ {(s.favorites || 0).toLocaleString()}</span>
                  </div>
                </div>
                <span
                  className={`story-status-badge ${s.status === "done" ? "badge-done" : "badge-ongoing"}`}
                  style={{ position: "static" }}
                >
                  {s.status === "done" ? "Hoàn thành" : "Đang ra"}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
