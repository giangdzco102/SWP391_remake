import { StoryCard } from "./StoryCard";
import { GENRES, GENRE_META, MOCK_CHAPTERS } from "../../utils/mockData";
import React, { useState, useEffect } from "react";
import { Ico } from "../Icons";
import { StarRating, AvatarComp, Toast } from "../ui";
export function HomePage({
  stories,
  allStories,
  activeGenre,
  setActiveGenre,
  onStory,
  user,
  openModal,
  show,
  likedStories,
  toggleLike,
  navTo,
}) {
  const featured = allStories.filter((s) => s.featured);
  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setHeroIdx((i) => (i + 1) % featured.length),
      5000,
    );
    return () => clearInterval(t);
  }, [featured.length]);
  const h = featured[heroIdx] || featured[0];
  return (
    <div className="fade-in">
      {/* Genre filter */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="genre-filters">
          {["all", ...GENRES].map((g) => (
            <button
              key={g}
              className={`tab-btn${activeGenre === g ? " active" : ""}`}
              onClick={() => setActiveGenre(g)}
            >
              {g === "all" ? "Tất cả" : g}
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
        {stories.length === 0 ? (
          <div className="empty-state">
            Không có tác phẩm nào<p>Thể loại này chưa có tác phẩm.</p>
          </div>
        ) : (
          <div className="story-grid">
            {stories.map((s) => (
              <StoryCard
                key={s.id}
                story={s}
                onStory={() => onStory(s)}
                liked={likedStories.includes(s.id)}
                onLike={() => toggleLike(s.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ⚡ Newly Updated Section (Creative) */}
      <div className="section" style={{ paddingTop: 20 }}>
        <div className="sec-head">
          <div>
            <div className="sec-title">Tác phẩm mới cập nhật</div>
            <div className="sec-sub">
              Đừng bỏ lỡ những chương truyện mới nhất vừa `&quot;`ra lò`&quot;`
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
                onStory={() => onStory(s)}
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
              <div key={s.id} className="rank-row" onClick={() => onStory(s)}>
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
