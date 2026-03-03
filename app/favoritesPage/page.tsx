"use client";
import { Ico } from "@/components/Icons";
import { StarRating } from "@/components/ui";
import { useStoryStore } from "@/stores/storyStore";
import { useAuthStore } from "@/stores";
import { useRouter } from "next/navigation";
import { useGotoStory } from "@/hooks/useGotoStory";

export function FavoritesPage() {
  const { stories, likedStories, toggleLike, readProgress } = useStoryStore();
  const gotoStory = useGotoStory();
  const { user } = useAuthStore();
  const router = useRouter();

  const favStories = stories.filter((s) => likedStories.includes(s.id));

  if (!user)
    return (
      <div className="section fade-in">
        <div className="empty-state">
          ❤ Chưa đăng nhập<p>Đăng nhập để xem danh sách yêu thích của bạn.</p>
          <button
            className="btn-nav btn-primary"
            style={{
              margin: "16px auto",
              display: "flex",
              alignItems: "center",
            }}
            onClick={() => router.push("?login")}
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );

  return (
    <div className="section fade-in min-h-screen! flex flex-col items-center">
      <div className="page-title">❤ Yêu Thích</div>
      <div className="page-sub">{favStories.length} tác phẩm đang theo dõi</div>
      {favStories.length === 0 ? (
        <div className="empty-state">
          Chưa có tác phẩm yêu thích<p>Nhấn ❤ trên tác phẩm để thêm vào đây.</p>
        </div>
      ) : (
        <div className="fav-grid">
          {favStories.map((s) => (
            <div key={s.id} className="fav-card" onClick={() => gotoStory(s)}>
              <div className="fav-cover" style={{ background: s.cover }} />
              <div className="hero-left">
                <div className="fav-title">{s.title}</div>
                <div className="fav-author">
                  bởi {s.penName} · {s.genre}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    color: "#9e8e82",
                  }}
                >
                  <StarRating rating={s.rating} size={12} />
                  <span>{s.rating.toFixed(1)}</span>
                  <span>·</span>
                  <span>{s.chapters} chương</span>
                </div>
                <div className="fav-progress">
                  <div
                    className="fav-progress-fill"
                    style={{ width: `${readProgress?.[s.id] || 0}%` }}
                  />
                </div>
                <div style={{ fontSize: 11, color: "#b0a096", marginTop: 3 }}>
                  {readProgress?.[s.id] || 0}% đã đọc
                </div>
              </div>
              <button
                className="fav-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(s.id);
                }}
              >
                <Ico.Trash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;
