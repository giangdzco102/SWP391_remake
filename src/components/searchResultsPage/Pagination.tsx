import React from "react";

export function Pagination({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  const btn = { borderRadius: 8, border: "1.5px solid #e8d8c8", background: "#fff", fontSize: 13, fontWeight: 600 } as const;

  const pages = Array.from({ length: total }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === total || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 32 }}>
      <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1}
        style={{ ...btn, padding: "7px 14px", color: page === 1 ? "#c9b8a8" : "#1c1512", cursor: page === 1 ? "default" : "pointer" }}>
        ← Trước
      </button>

      {pages.map((p, i) => p === "..."
        ? <span key={`e${i}`} style={{ padding: "7px 4px", color: "#9e8e82", fontSize: 13 }}>…</span>
        : <button key={p} onClick={() => onPage(p as number)} style={{ ...btn, width: 36, height: 36, cursor: "pointer", transition: "all .15s", background: page === p ? "#c23d3f" : "#fff", color: page === p ? "#fff" : "#1c1512", borderColor: page === p ? "#c23d3f" : "#e8d8c8" }}>{p}</button>
      )}

      <button onClick={() => onPage(Math.min(total, page + 1))} disabled={page === total}
        style={{ ...btn, padding: "7px 14px", color: page === total ? "#c9b8a8" : "#1c1512", cursor: page === total ? "default" : "pointer" }}>
        Sau →
      </button>
    </div>
  );
}
