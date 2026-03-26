import React from "react";

interface PaginationProps {
  current: number;
  total: number;
  onChange: (p: number) => void;
}

export function Pagination({ current, total, onChange }: PaginationProps) {
  const pages: (number | "…")[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("…");
    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(total - 1, current + 1);
      i++
    ) {
      pages.push(i);
    }
    if (current < total - 2) pages.push("…");
    pages.push(total);
  }

  const base: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "1.5px solid #e8d8c8",
    background: "#fff",
    color: "#6b5a4e",
    cursor: "pointer",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        marginTop: 20,
        paddingTop: 16,
        borderTop: "1px solid #f5ede4",
      }}
    >
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        style={{
          ...base,
          opacity: current === 1 ? 0.4 : 1,
          cursor: current === 1 ? "not-allowed" : "pointer",
          fontSize: 16,
        }}
      >
        ‹
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={"e" + i}
            style={{ fontSize: 13, color: "#9e8e82", padding: "0 2px" }}
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            style={{
              ...base,
              borderColor: p === current ? "#c23d3f" : "#e8d8c8",
              background:
                p === current
                  ? "linear-gradient(135deg,#c23d3f,#9e2d2f)"
                  : "#fff",
              color: p === current ? "#fff" : "#6b5a4e",
              fontWeight: p === current ? 700 : 500,
            }}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        style={{
          ...base,
          opacity: current === total ? 0.4 : 1,
          cursor: current === total ? "not-allowed" : "pointer",
          fontSize: 16,
        }}
      >
        ›
      </button>
    </div>
  );
}
