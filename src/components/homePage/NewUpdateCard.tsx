import React, { useState } from "react";
import { StoryShape } from "@/types/homePage";
import { timeStartToNow } from "@/utils/time";

interface NewUpdateCardProps {
  s: StoryShape;
  onClick: () => void;
}

export function NewUpdateCard({ s, onClick }: NewUpdateCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 10,
        cursor: "pointer",
        alignItems: "flex-start",
        background: hovered ? "#fdf3ee" : "transparent",
        transition: "background 0.15s",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 56,
          height: 76,
          borderRadius: 8,
          flexShrink: 0,
          backgroundImage: s.cover,
          backgroundSize: "cover",
          backgroundPosition: "center",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(transparent, rgba(0,0,0,0.78))",
            padding: "12px 4px 3px",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>
            Ch.{s.chapters}
          </span>
        </div>
        {s.status === "ongoing" && (
          <div
            style={{
              position: "absolute",
              top: 3,
              right: 3,
              background: "#c23d3f",
              borderRadius: 3,
              padding: "1px 4px",
              fontSize: 8,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            MỚI
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1.35,
            marginBottom: 5,
            color: hovered ? "#c23d3f" : "#1c1512",
            transition: "color 0.15s",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {s.title}
        </div>
        {s.genre && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#c23d3f",
              background: "#fde8e8",
              border: "1px solid #f5c0c0",
              borderRadius: 4,
              padding: "1px 6px",
              display: "inline-block",
              marginBottom: 5,
            }}
          >
            {s.genre}
          </span>
        )}
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
              fontSize: 11,
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
              color: "#b8921e",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {s.updatedAt ? timeStartToNow(s.updatedAt) : "Vừa xong"}
          </span>
        </div>
      </div>
    </div>
  );
}
