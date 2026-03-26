import React from "react";

interface SectionHeaderProps {
  title: string;
  sub?: string;
  right?: React.ReactNode;
}

export function SectionHeader({ title, sub, right }: SectionHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
        paddingBottom: 10,
        borderBottom: "2px solid #c23d3f",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 4,
            height: 22,
            background: "linear-gradient(180deg,#c23d3f,#9e2d2f)",
            borderRadius: 2,
          }}
        />
        <span
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#1c1512",
            letterSpacing: -0.3,
          }}
        >
          {title}
        </span>
        {sub && (
          <span style={{ fontSize: 12, color: "#9e8e82", fontWeight: 500 }}>
            {sub}
          </span>
        )}
      </div>
      {right}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
      className="animate-pulse"
    >
      <div
        style={{
          aspectRatio: "2/2.8",
          width: "100%",
          borderRadius: 10,
          background: "#f0e8df",
        }}
      />
      <div
        style={{
          height: 12,
          width: "80%",
          borderRadius: 4,
          background: "#f0e8df",
        }}
      />
      <div
        style={{
          height: 10,
          width: "55%",
          borderRadius: 4,
          background: "#f0e8df",
        }}
      />
    </div>
  );
}

export function SkeletonNewCard() {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "8px 10px",
        alignItems: "flex-start",
      }}
      className="animate-pulse"
    >
      <div
        style={{
          width: 56,
          height: 76,
          borderRadius: 8,
          background: "#f0e8df",
          flexShrink: 0,
        }}
      />
      <div
        style={{
          flex: 1,
          paddingTop: 4,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          style={{
            height: 13,
            background: "#f0e8df",
            borderRadius: 4,
            width: "85%",
          }}
        />
        <div
          style={{
            height: 11,
            background: "#f0e8df",
            borderRadius: 4,
            width: "50%",
          }}
        />
        <div
          style={{
            height: 10,
            background: "#f0e8df",
            borderRadius: 4,
            width: "40%",
          }}
        />
      </div>
    </div>
  );
}
