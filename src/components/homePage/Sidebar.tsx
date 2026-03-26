import React from "react";
import { useRouter } from "next/navigation";
import { CategoryItem } from "@/api/useCategory.service";
import { FilterState, StoryShape } from "@/types/homePage";
import { RANK_COLORS } from "@/utils/homePage.constants";

interface SidebarProps {
  top5: StoryShape[];
  categories: CategoryItem[];
  filters: FilterState;
  onStory: (s: StoryShape) => void;
  onGenreToggle: (name: string) => void;
}

export function Sidebar({
  top5,
  categories,
  filters,
  onStory,
  onGenreToggle,
}: SidebarProps) {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        position: "sticky",
        top: 80,
      }}
    >
      {/* 🏆 Top 5 rankings */}
      <div className="sidebar-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div className="sidebar-title" style={{ margin: 0 }}>
            🏆 Bảng xếp hạng
          </div>
          <button
            className="see-all"
            style={{ fontSize: 12 }}
            onClick={() => router.push("/rankingsPage")}
          >
            Xem đầy đủ →
          </button>
        </div>

        {top5.length === 0 ? (
          <div style={{ fontSize: 13, color: "#9e8e82" }}>Chưa có dữ liệu</div>
        ) : (
          top5.map((s, i) => (
            <div
              key={s.id}
              onClick={() => onStory(s)}
              style={{
                display: "flex",
                gap: 10,
                padding: "8px 0",
                borderBottom: "1px solid #f5ede4",
                cursor: "pointer",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 900,
                  flexShrink: 0,
                  background: i < 3 ? RANK_COLORS[i] : "#f5ede4",
                  color: i < 3 ? "#fff" : "#9e8e82",
                }}
              >
                {i + 1}
              </span>
              <div
                style={{
                  width: 40,
                  height: 52,
                  borderRadius: 6,
                  backgroundImage: s.cover,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#1c1512",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.35,
                    marginBottom: 3,
                  }}
                >
                  {s.title}
                </div>
                <div style={{ fontSize: 11, color: "#9e8e82" }}>
                  👁 {s.reads} · ⭐{" "}
                  {Number(s.rating) > 0
                    ? Number(s.rating).toFixed(1)
                    : "Mới"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 📚 Category pills */}
      <div className="sidebar-card">
        <div className="sidebar-title">📚 Thể loại</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {categories.map((cat) => {
            const active = filters.genres.includes(cat.name);
            return (
              <button
                key={cat.id}
                onClick={() => onGenreToggle(cat.name)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 500,
                  border: "1.5px solid",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: active ? "#c23d3f" : "#fdf7f0",
                  color: active ? "#fff" : "#6b5a4e",
                  borderColor: active ? "#c23d3f" : "#e8d8c8",
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
