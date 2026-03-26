import React from "react";
import { FavStory } from "@/types/favoritesPage";
import { formatNum, getPillStyle } from "@/utils/favoritesPage.utils";

interface FavStoryCardProps {
  story: FavStory;
  myRating: number; // 0 = not rated yet
  onClick: () => void;
  onUnfollow: (e: React.MouseEvent) => void;
  onOpenRating: (e: React.MouseEvent) => void;
}

export function FavStoryCard({
  story: s,
  myRating,
  onClick,
  onUnfollow,
  onOpenRating,
}: FavStoryCardProps) {
  const displayScore = myRating > 0 ? myRating : s.rating;

  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        border: "1.5px solid #ece6dc",
        cursor: "pointer",
        transition: "all .18s",
        boxShadow: "0 2px 10px rgba(0,0,0,.05)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(-4px)";
        el.style.boxShadow = "0 10px 28px rgba(194,61,63,.16)";
        el.style.borderColor = "#c23d3f";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "";
        el.style.boxShadow = "0 2px 10px rgba(0,0,0,.05)";
        el.style.borderColor = "#ece6dc";
      }}
    >
      {/* Cover */}
      <div style={{ position: "relative", paddingTop: "140%" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: s.cover,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Unfollow button */}
        <button
          onClick={onUnfollow}
          title="Bỏ yêu thích"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "rgba(255,255,255,.92)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 15,
            color: "#c23d3f",
            boxShadow: "0 2px 8px rgba(0,0,0,.15)",
            transition: "all .15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#c23d3f";
            (e.currentTarget as HTMLButtonElement).style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(255,255,255,.92)";
            (e.currentTarget as HTMLButtonElement).style.color = "#c23d3f";
          }}
        >
          ❤
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: "13px 13px 14px" }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: "#1c1512",
            lineHeight: 1.35,
            marginBottom: 5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {s.title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#9e8e82",
            marginBottom: 7,
            fontStyle: "italic",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {s.penName}
        </div>

        {/* Genre tag */}
        {s.genre && (
          <span
            style={{
              display: "inline-block",
              padding: "2px 9px",
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 600,
              background: "#fde8e8",
              color: "#c23d3f",
              border: "1px solid #f0b4b5",
              marginBottom: 9,
            }}
          >
            {s.genre}
          </span>
        )}

        {/* Star rating — click to rate */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            marginBottom: 8,
            cursor: "pointer",
          }}
          onClick={onOpenRating}
          title={
            myRating
              ? `Bạn đã đánh giá ${myRating}★ — nhấn để sửa`
              : "Nhấn để đánh giá"
          }
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              style={{
                fontSize: 14,
                color:
                  displayScore >= star
                    ? myRating > 0
                      ? "#f59e0b"
                      : "#fbbf24"
                    : "#e5ddd5",
                transition: "color .1s",
              }}
            >
              ★
            </span>
          ))}
          <span style={{ fontSize: 11, color: "#9e8e82", marginLeft: 3 }}>
            {myRating ? (
              <span style={{ color: "#f59e0b", fontWeight: 600 }}>
                {myRating}★ của bạn
              </span>
            ) : s.rating > 0 ? (
              s.rating.toFixed(1)
            ) : (
              "Đánh giá"
            )}
          </span>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 11,
            color: "#b0a096",
            flexWrap: "wrap",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span>📖</span>
            <span style={{ color: "#3d2f28", fontWeight: 600 }}>{s.chapters}</span>
            <span>chương</span>
          </span>
          <span style={{ color: "#e0d4cc" }}>·</span>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span>👁</span>
            <span style={{ color: "#3d2f28", fontWeight: 600 }}>{formatNum(s.views)}</span>
            <span>lượt đọc</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// Re-export getPillStyle for use in filter components
export { getPillStyle };
