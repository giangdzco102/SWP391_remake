import React, { useState } from "react";
import { StoryShape } from "@/types/homePage";
import { RANK_COLORS } from "@/utils/homePage.constants";

interface HotStoryCardProps {
  s: StoryShape;
  rank: number;
  onClick: () => void;
  liked: boolean;
  onLike: () => void;
}

export function HotStoryCard({ s, rank, onClick, liked, onLike }: HotStoryCardProps) {
  const [hovered, setHovered] = useState(false);
  const rankBg = rank <= 3 ? RANK_COLORS[rank - 1] : "rgba(0,0,0,0.55)";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: "pointer", display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "2/2.8",
          borderRadius: 10,
          overflow: "hidden",
          backgroundImage: s.cover,
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow: hovered
            ? "0 6px 20px rgba(0,0,0,0.22)"
            : "0 2px 8px rgba(0,0,0,0.10)",
          transform: hovered ? "translateY(-2px)" : "none",
          transition: "box-shadow 0.2s, transform 0.2s",
        }}
      >
        {/* Rank badge */}
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            width: 22,
            height: 22,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 900,
            background: rankBg,
            color: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }}
        >
          {rank}
        </div>

        {/* Like button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 26,
            height: 26,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            transition: "all 0.15s",
            background: liked ? "#c23d3f" : "rgba(255,255,255,0.85)",
            color: liked ? "#fff" : "#c23d3f",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          }}
        >
          {liked ? "♥" : "♡"}
        </button>

        {/* Status + chapter overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(transparent, rgba(0,0,0,0.72))",
            padding: "18px 7px 6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: s.status === "done" ? "#4ade80" : "#fbbf24",
              background: "rgba(0,0,0,0.35)",
              borderRadius: 3,
              padding: "1px 5px",
            }}
          >
            {s.status === "done" ? "Full" : "Đang ra"}
          </span>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>
            Ch.{s.chapters}
          </span>
        </div>
      </div>

      <div style={{ padding: "7px 2px 4px" }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            lineHeight: 1.35,
            color: hovered ? "#c23d3f" : "#1c1512",
            transition: "color 0.15s",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            marginBottom: 3,
          }}
        >
          {s.title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 4,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: "#9e8e82",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {s.penName}
          </span>
          <span
            style={{
              fontSize: 10,
              color: "#9e8e82",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            👁 {s.reads}
          </span>
        </div>
      </div>
    </div>
  );
}
