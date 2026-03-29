"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

// ─────────────────────────────────────────────────────────────────────────────
// BannerHomepage.tsx
// Self-contained banner slider — tự fetch data, tự navigate
// Đặt tại: src/components/ui/Bannerhomepage.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useCallback, useState } from "react";
import useStoryService from "@/api/useStory.service";
import { useGotoStory } from "@/hooks/useGotoStory";

// ── Helpers ───────────────────────────────────────────────────────────────────
const COVER_GRADIENTS = [
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  "linear-gradient(135deg,#667eea,#764ba2)",
];

const isRealCover = (url?: string) =>
  !!url &&
  !url.includes("placeholder.com") &&
  !url.includes("via.placeholder") &&
  !url.includes("placeholder");

const formatViews = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

// ── toBannerShape — đồng nhất với toStoryShape của homePage ──────────────────
function toBannerShape(s: any, idx: number) {
  const chapterCount =
    s.publishedChapterCount ??
    s.allChaptersCount ??
    s.totalChapters ??
    s.chapterCount ??
    (Array.isArray(s.chapters) ? s.chapters.length : 0);
  const viewCount = s.viewCount ?? s.viewsCount ?? 0;
  const avgRating = s.avgRating ?? s.averageRating ?? s.rating ?? 0;
  return {
    id: String(s.id),
    title: s.title ?? "",
    penName: s.authorName ?? "",
    author: s.authorName ?? "",
    cover: isRealCover(s.coverUrl)
      ? `url("${s.coverUrl}")`
      : COVER_GRADIENTS[idx % COVER_GRADIENTS.length],
    coverUrl: s.coverUrl ?? "",
    genre: s.categories?.[0]?.name ?? s.genre ?? "",
    categoryId: s.categories?.[0]?.id ?? null,
    tags: s.tags ?? [],
    rating: avgRating,
    reviewCount: s.ratingCount ?? s.reviewCount ?? 0,
    reads: formatViews(viewCount),
    views: viewCount,
    favorites: s.followCount ?? s.favoriteCount ?? 0,
    chapters: chapterCount,
    description: s.summary ?? s.description ?? "",
    status: s.status === "COMPLETED" || s.isCompleted ? "done" : ("ongoing" as "done" | "ongoing"),
    featured: s.featured ?? false,
    excerpt: s.summary ?? "",
    updatedAt: s.updatedAt ?? s.createdAt ?? "",
  };
}

type BannerStory = ReturnType<typeof toBannerShape>;

// ── Skeleton ──────────────────────────────────────────────────────────────────
function BannerSkeleton() {
  return (
    <div
      className="animate-pulse"
      style={{
        width: "100%",
        height: 320,
        borderRadius: 16,
        background: "linear-gradient(135deg, #f0e8df, #e8d8c8)",
        marginBottom: 8,
        display: "flex",
        alignItems: "center",
        gap: 28,
        padding: "28px 32px",
      }}
    >
      {/* cover placeholder */}
      <div style={{ width: 160, height: 220, borderRadius: 12, background: "rgba(0,0,0,0.1)", flexShrink: 0 }} />
      {/* text placeholders */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ height: 16, width: 120, borderRadius: 20, background: "rgba(0,0,0,0.1)" }} />
        <div style={{ height: 28, width: "70%", borderRadius: 8, background: "rgba(0,0,0,0.12)" }} />
        <div style={{ height: 13, width: "40%", borderRadius: 6, background: "rgba(0,0,0,0.08)" }} />
        <div style={{ height: 13, width: "85%", borderRadius: 6, background: "rgba(0,0,0,0.08)" }} />
        <div style={{ height: 13, width: "75%", borderRadius: 6, background: "rgba(0,0,0,0.08)" }} />
        <div style={{ height: 40, width: 120, borderRadius: 10, background: "rgba(0,0,0,0.1)", marginTop: 6 }} />
      </div>
    </div>
  );
}

// ── BannerSlide ───────────────────────────────────────────────────────────────
function BannerSlide({
  s,
  onClick,
}: {
  s: BannerStory;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        gap: 28,
        padding: "28px 32px",
        cursor: "pointer",
      }}
    >
      {/* Cover thumbnail */}
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
          transition: "transform 0.3s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.transform = "scale(1.03)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.transform = "scale(1)")
        }
      />

      {/* Info */}
      <div style={{ color: "#fff", flex: 1, minWidth: 0 }}>
        {/* Genre + status badges */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          {s.genre && (
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
              {s.genre}
            </span>
          )}
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
        <div
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.75)",
            marginBottom: 10,
          }}
        >
          bởi{" "}
          <span style={{ color: "#fcd34d", fontWeight: 600 }}>{s.penName}</span>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.82)",
            lineHeight: 1.6,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          {s.description || s.excerpt || "Chưa có mô tả."}
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
            ⭐{" "}
            {Number(s.rating) > 0 ? Number(s.rating).toFixed(1) : "Mới"}
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // tránh bubble lên div wrapper
            onClick();
          }}
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
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(194,61,63,0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "none";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(194,61,63,0.4)";
          }}
        >
          Đọc ngay →
        </button>
      </div>
    </div>
  );
}

// ── BannerHomepage — component chính ─────────────────────────────────────────
export function BannerHomepage() {
  const { getStories } = useStoryService();
  const gotoStory = useGotoStory();         // ← setSelectedStory + router.push

  const [stories, setStories] = useState<BannerStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch banner stories once on mount ──────────────────────────────────
  useEffect(() => {
    setLoading(true);
    getStories({ size: 6, sort: "viewCount,desc" })
      .then((res: any) => {
        const raw: any = res?.data ?? res;
        const list: any[] = Array.isArray(raw?.content) ? raw.content
          : Array.isArray(raw) ? raw
            : [];
        if (list.length > 0) setStories(list.map(toBannerShape));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-slide timer ────────────────────────────────────────────────────
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setCurrent((i) => (i + 1) % Math.max(stories.length, 1)),
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

  // ── Handle click — đây là nơi fix lỗi chính ─────────────────────────────
  // gotoStory() = setSelectedStory(story) + router.push("/storyDetailPage")
  const handleStoryClick = (s: BannerStory) => {
    gotoStory(s);
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) return <BannerSkeleton />;

  // ── No data ──────────────────────────────────────────────────────────────
  if (stories.length === 0) return null;

  const s = stories[current];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        borderRadius: 16,
        overflow: "hidden",
        height: 320,
        marginBottom: 8,
        userSelect: "none",
      }}
    >
      {/* Blurred background */}
      <div
        key={s.id + "-bg"}                    // key → trigger transition khi đổi slide
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: s.cover,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(6px) brightness(0.42)",
          transform: "scale(1.08)",
          transition: "background-image 0.5s ease",
        }}
      />

      {/* Slide content */}
      <BannerSlide s={s} onClick={() => handleStoryClick(s)} />

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
              setCurrent(i);
              resetTimer();
            }}
            style={{
              width: i === current ? 20 : 8,
              height: 8,
              borderRadius: 4,
              background:
                i === current ? "#c23d3f" : "rgba(255,255,255,0.5)",
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>

      {/* Prev / Next arrows */}
      {stories.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((i) => (i - 1 + stories.length) % stories.length);
              resetTimer();
            }}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "rgba(0,0,0,0.35)",
              color: "#fff",
              fontSize: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background =
              "rgba(0,0,0,0.6)")
            }
            onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background =
              "rgba(0,0,0,0.35)")
            }
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((i) => (i + 1) % stories.length);
              resetTimer();
            }}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "rgba(0,0,0,0.35)",
              color: "#fff",
              fontSize: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background =
              "rgba(0,0,0,0.6)")
            }
            onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background =
              "rgba(0,0,0,0.35)")
            }
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}

export default BannerHomepage;