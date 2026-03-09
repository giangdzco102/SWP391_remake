"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef, useCallback } from "react";
import useStoryService from "@/api/useStory.service";
import { useGotoStory } from "@/hooks/useGotoStory";

// ── Gradient fallbacks ────────────────────────────────────────────────────────
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

const isRealCover = (url?: string) =>
  !!url &&
  !url.includes("placeholder.com") &&
  !url.includes("via.placeholder") &&
  !url.includes("placeholder");

const toStoryShape = (s: any, idx: number) => ({
  id: s.id,
  title: s.title,
  penName: s.authorName ?? "",
  cover: isRealCover(s.coverUrl)
    ? `url("${s.coverUrl}")`
    : COVER_GRADIENTS[idx % COVER_GRADIENTS.length],
  genre: s.categories?.[0]?.name ?? s.genre ?? "",
  rating: s.averageRating ?? 0,
  reads:
    s.viewCount != null
      ? s.viewCount >= 1000
        ? `${(s.viewCount / 1000).toFixed(1)}K`
        : String(s.viewCount)
      : "0",
  chapters: s.totalChapters ?? 0,
  description: s.summary ?? s.description ?? "",
  status: s.status === "COMPLETED" ? "done" : "ongoing",
  excerpt: s.summary ?? "",
  // passthrough fields needed by useGotoStory
  ...s,
});

type BannerStory = ReturnType<typeof toStoryShape>;

// ── Banner Skeleton ───────────────────────────────────────────────────────────
function BannerSkeleton() {
  return (
    <div
      className="animate-pulse rounded-2xl mb-2"
      style={{ height: 320, background: "#f0e8df" }}
    />
  );
}

// ── Banner Slider ─────────────────────────────────────────────────────────────
function BannerSlider({
  stories,
  onStory,
}: {
  stories: BannerStory[];
  onStory: (s: BannerStory) => void;
}) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setIdx((i) => (i + 1) % stories.length),
      4500,
    );
  }, [stories.length]);

  useEffect(() => {
    if (stories.length === 0) return;
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stories.length, resetTimer]);

  if (stories.length === 0) return null;
  const s = stories[idx];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        borderRadius: 16,
        overflow: "hidden",
        height: 320,
        cursor: "pointer",
        marginBottom: 8,
      }}
      onClick={() => onStory(s)}
    >
      {/* Blurred background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: s.cover,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(6px) brightness(0.45)",
          transform: "scale(1.08)",
          transition: "background 0.5s",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          gap: "28px",
          padding: "28px 32px",
        }}
      >
        {/* Thumbnail */}
        <div
          style={{
            width: 160,
            height: 220,
            borderRadius: 12,
            backgroundImage: s.cover,
            backgroundSize: "cover",
            backgroundPosition: "center",
            flexShrink: 0,
            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          }}
        />

        {/* Info */}
        <div style={{ color: "#fff", flex: 1, minWidth: 0 }}>
          {/* Badges */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <span
              style={{
                background: "rgba(194,61,63,0.9)",
                color: "#fff",
                borderRadius: 20,
                padding: "3px 12px",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {s.genre || "Truyện"}
            </span>
            <span
              style={{
                background:
                  s.status === "done"
                    ? "rgba(34,197,94,0.85)"
                    : "rgba(251,191,36,0.85)",
                color: "#fff",
                borderRadius: 20,
                padding: "3px 12px",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {s.status === "done" ? "✓ Hoàn thành" : "Đang cập nhật"}
            </span>
          </div>

          {/* Title */}
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 26,
              fontWeight: 900,
              lineHeight: 1.25,
              marginBottom: 8,
              textShadow: "0 2px 8px rgba(0,0,0,0.6)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {s.title}
          </h2>

          {/* Author */}
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 10 }}>
            bởi{" "}
            <span style={{ color: "#fcd34d", fontWeight: 600 }}>{s.penName}</span>
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            {s.description || s.excerpt}
          </p>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: 16,
              fontSize: 13,
              color: "rgba(255,255,255,0.7)",
              marginBottom: 18,
            }}
          >
            <span>📖 {s.chapters} chương</span>
            <span>👁 {s.reads} lượt đọc</span>
            <span>
              ⭐ {Number(s.rating) > 0 ? Number(s.rating).toFixed(1) : "Mới"}
            </span>
          </div>

          {/* CTA */}
          <button
            style={{
              background: "linear-gradient(135deg,#c23d3f,#9e2d2f)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(194,61,63,0.4)",
            }}
          >
            Đọc ngay →
          </button>
        </div>
      </div>

      {/* Dot indicators */}
      <div
        style={{
          position: "absolute",
          bottom: 14,
          right: 20,
          display: "flex",
          gap: 6,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {stories.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setIdx(i);
              resetTimer();
            }}
            style={{
              width: i === idx ? 20 : 8,
              height: 8,
              borderRadius: 4,
              background: i === idx ? "#c23d3f" : "rgba(255,255,255,0.5)",
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── BannerHomepage (exported) ─────────────────────────────────────────────────
export function BannerHomepage() {
  const { getStories } = useStoryService();
  const gotoStory = useGotoStory();
  const [stories, setStories] = useState<BannerStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStories({ size: 6, sort: "viewCount,desc" })
      .then((res: any) => {
        const list: any[] = res?.data ?? res ?? [];
        setStories(list.map(toStoryShape));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <BannerSkeleton />;

  return <BannerSlider stories={stories} onStory={gotoStory} />;
}

export default BannerHomepage;