"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef, useCallback } from "react";
import { useStoryStore } from "@/stores/storyStore";
import { useToast } from "@/hooks/use-toast";
import { useGotoStory } from "@/hooks/useGotoStory";
import { StoryCard } from "../../src/components/storyCard/page";
import useStoryService from "@/api/useStory.service";
import useCategoryService, { CategoryItem } from "@/api/useCategory.service";
import { useRouter } from "next/navigation";
import { timeStartToNow } from "@/utils/time";

// ── Gradient fallbacks ───────────────────────────────────────────────────────
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
  author: s.authorName ?? "",
  penName: s.authorName ?? "",
  cover: isRealCover(s.coverUrl)
    ? `url("${s.coverUrl}")`
    : COVER_GRADIENTS[idx % COVER_GRADIENTS.length],
  coverUrl: s.coverUrl ?? "",
  genre: s.categories?.[0]?.name ?? s.genre ?? "",
  categoryId: s.categories?.[0]?.id ?? null,
  tags: s.tags ?? [],
  rating: s.averageRating ?? 0,
  reviewCount: s.reviewCount ?? 0,
  reads:
    s.viewCount != null
      ? s.viewCount >= 1000
        ? `${(s.viewCount / 1000).toFixed(1)}K`
        : String(s.viewCount)
      : "0",
  views: s.viewCount ?? 0,
  favorites: s.favoriteCount ?? 0,
  chapters: s.totalChapters ?? 0,
  description: s.summary ?? s.description ?? "",
  status: s.status === "COMPLETED" ? "done" : "ongoing",
  featured: s.featured ?? false,
  excerpt: s.summary ?? "",
  updatedAt: s.updatedAt ?? s.createdAt ?? "",
  categoryId2: s.categories?.[0]?.id ?? null,
});

type StoryShape = ReturnType<typeof toStoryShape>;
type HotPeriod = "day" | "week" | "month";

// ── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="aspect-[1/1.35] w-full rounded-xl bg-[#f0e8df]" />
      <div className="flex flex-col gap-2">
        <div className="h-3.5 w-4/5 rounded bg-[#f0e8df]" />
        <div className="h-3 w-1/2 rounded bg-[#f0e8df]" />
        <div className="h-3 w-1/3 rounded bg-[#f0e8df]" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex gap-3 animate-pulse py-2">
      <div className="w-12 h-16 rounded-lg bg-[#f0e8df] shrink-0" />
      <div className="flex flex-col gap-2 flex-1 justify-center">
        <div className="h-3.5 w-3/4 rounded bg-[#f0e8df]" />
        <div className="h-3 w-1/2 rounded bg-[#f0e8df]" />
        <div className="h-3 w-1/3 rounded bg-[#f0e8df]" />
      </div>
    </div>
  );
}

// ── Banner Slider ─────────────────────────────────────────────────────────────
function BannerSlider({
  stories,
  onStory,
}: {
  stories: StoryShape[];
  onStory: (s: StoryShape) => void;
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
      {/* Background blurred cover */}
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
          }}
        />

        {/* Info */}
        <div style={{ color: "#fff", flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 10,
              flexWrap: "wrap",
            }}
          >
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
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.75)",
              marginBottom: 10,
            }}
          >
            bởi{" "}
            <span style={{ color: "#fcd34d", fontWeight: 600 }}>
              {s.penName}
            </span>
          </div>
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

// ── New-update list item ──────────────────────────────────────────────────────
function NewUpdateItem({ s, onClick }: { s: StoryShape; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        gap: 10,
        padding: "10px 0",
        borderBottom: "1px solid #f5ede4",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      className="group"
    >
      <div
        style={{
          width: 48,
          height: 64,
          borderRadius: 8,
          backgroundImage: s.cover,
          backgroundSize: "cover",
          backgroundPosition: "center",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#1c1512",
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            marginBottom: 4,
          }}
          className="group-hover:text-[#c23d3f] transition-colors"
        >
          {s.title}
        </div>
        <div style={{ fontSize: 11, color: "#9e8e82" }}>
          Ch.{s.chapters} · {s.penName}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#b8921e",
            marginTop: 2,
            fontWeight: 600,
          }}
        >
          {s.updatedAt ? timeStartToNow(s.updatedAt) : "Vừa cập nhật"}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function HomePage() {
  const {
    setAllStories,
    likedStories,
    toggleLike,
    activeGenre,
    setActiveGenre,
  } = useStoryStore();

  const router = useRouter();
  const gotoStory = useGotoStory();
  const toast = useToast();
  const { getStories } = useStoryService();
  const { getCategories } = useCategoryService();

  const [categories, setCategories] = useState<CategoryItem[]>([]);

  const [loadingNew, setLoadingNew] = useState(false);
  const [loadingHot, setLoadingHot] = useState(false);

  const [newStories, setNewStories] = useState<StoryShape[]>([]);
  // allHotStories: toàn bộ hot, không filter — dùng để filter client-side
  const [allHotStories, setAllHotStories] = useState<StoryShape[]>([]);
  const [bannerStories, setBannerStories] = useState<StoryShape[]>([]);

  // Tab Ngày / Tuần / Tháng
  const [hotPeriod, setHotPeriod] = useState<HotPeriod>("day");

  // Client-side filter theo genre — giống pattern file gốc
  const hotStories =
    activeGenre === "all"
      ? allHotStories
      : allHotStories.filter((s) => s.genre === activeGenre);

  // ── Load categories ──────────────────────────────────────────────────────
  useEffect(() => {
    getCategories()
      .then((res: any) => {
        const list: CategoryItem[] = res?.data ?? res ?? [];
        setCategories(list);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load banner (top 6 view nhất, tất cả thể loại) ──────────────────────
  useEffect(() => {
    getStories({ size: 6, sort: "viewCount,desc" })
      .then((res: any) => {
        const list: any[] = res?.data ?? res ?? [];
        setBannerStories(list.map(toStoryShape));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load "mới cập nhật" (không filter genre) ────────────────────────────
  useEffect(() => {
    setLoadingNew(true);
    getStories({ size: 16, sort: "updatedAt,desc" })
      .then((res: any) => {
        const list: any[] = res?.data ?? res ?? [];
        const mapped = list.map(toStoryShape);
        setNewStories(mapped);
        setAllStories(mapped);
      })
      .catch(() => {})
      .finally(() => setLoadingNew(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load "hot" theo period — load nhiều, filter client-side theo genre ────
  useEffect(() => {
    setLoadingHot(true);
    const sortMap: Record<HotPeriod, string> = {
      day: "viewCount,desc",
      week: "weeklyViews,desc",
      month: "monthlyViews,desc",
    };
    getStories({ size: 50, sort: sortMap[hotPeriod] })
      .then((res: any) => {
        const list: any[] = res?.data ?? res ?? [];
        setAllHotStories(list.map(toStoryShape));
      })
      .catch(() => {})
      .finally(() => setLoadingHot(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotPeriod]);

  // Top 5 sidebar rank — dùng hotStories (đã sort view từ API)
  const top5 = [...hotStories].sort((a, b) => b.views - a.views).slice(0, 5);

  const PERIOD_LABEL: Record<HotPeriod, string> = {
    day: "Hôm nay",
    week: "Tuần này",
    month: "Tháng này",
  };

  return (
    <div className="fade-in">
      {/* ── Banner Slider ─────────────────────────────────────────────────── */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <BannerSlider stories={bannerStories} onStory={gotoStory} />
      </div>

      {/* ── Genre filter tabs ─────────────────────────────────────────────── */}
      <div className="section" style={{ paddingBottom: 0, paddingTop: 16 }}>
        <div className="genre-filters">
          <button
            className={`tab-btn${activeGenre === "all" ? " active" : ""}`}
            onClick={() => setActiveGenre("all")}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`tab-btn${activeGenre === cat.name ? " active" : ""}`}
              onClick={() => setActiveGenre(cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2-column layout: Main + Sidebar ───────────────────────────────── */}
      <div
        className="section"
        style={{
          paddingTop: 20,
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 28,
          alignItems: "start",
        }}
      >
        {/* ── LEFT: Hot tabs + Mới cập nhật + Nổi bật ─────────────────────── */}
        <div>
          {/* Hot tabs: Ngày / Tuần / Tháng */}
          <div style={{ marginBottom: 24 }}>
            <div className="sec-head" style={{ marginBottom: 12 }}>
              <div>
                <div className="sec-title">
                  🔥{" "}
                  {activeGenre === "all"
                    ? "Truyện hot"
                    : `Hot · ${activeGenre}`}
                </div>
                {activeGenre !== "all" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: "#c23d3f",
                        background: "#fde8e8",
                        border: "1px solid #f5c0c0",
                        borderRadius: 20,
                        padding: "2px 10px",
                        fontWeight: 600,
                      }}
                    >
                      {activeGenre}
                    </span>
                    <button
                      onClick={() => setActiveGenre("all")}
                      style={{
                        fontSize: 11,
                        color: "#9e8e82",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        textDecoration: "underline",
                      }}
                    >
                      ✕ Bỏ lọc
                    </button>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {(["day", "week", "month"] as HotPeriod[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setHotPeriod(p)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      border: "1.5px solid",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      background: hotPeriod === p ? "#c23d3f" : "transparent",
                      color: hotPeriod === p ? "#fff" : "#9e8e82",
                      borderColor: hotPeriod === p ? "#c23d3f" : "#e8d8c8",
                    }}
                  >
                    {PERIOD_LABEL[p]}
                  </button>
                ))}
              </div>
            </div>
            {loadingHot ? (
              <div className="story-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : hotStories.length === 0 ? (
              <div className="empty-state">Chưa có dữ liệu</div>
            ) : (
              <div className="story-grid">
                {hotStories.slice(0, 8).map((s) => (
                  <StoryCard
                    key={s.id}
                    story={s}
                    onStory={() => gotoStory(s)}
                    liked={likedStories.includes(s.id)}
                    onLike={() => {
                      const wasLiked = likedStories.includes(s.id);
                      toggleLike(s.id);
                      toast.success(
                        wasLiked
                          ? "Đã bỏ yêu thích"
                          : "Đã thêm vào yêu thích ❤",
                      );
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Mới cập nhật — list 2 cột */}
          <div style={{ marginBottom: 24 }}>
            <div className="sec-head" style={{ marginBottom: 12 }}>
              <div>
                <div className="sec-title">🆕 Mới cập nhật</div>
                <div className="sec-sub">Cập nhật theo thời gian thực</div>
              </div>
              <button
                className="see-all"
                onClick={() => router.push("/categoriesPage")}
              >
                Xem tất cả →
              </button>
            </div>
            {loadingNew ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0 24px",
                }}
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0 24px",
                }}
              >
                {newStories.slice(0, 16).map((s) => (
                  <NewUpdateItem
                    key={s.id}
                    s={s}
                    onClick={() => gotoStory(s)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            position: "sticky",
            top: 80,
          }}
        >
          {/* BXH top 5 */}
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
              <div style={{ fontSize: 13, color: "#9e8e82" }}>
                Chưa có dữ liệu
              </div>
            ) : (
              top5.map((s, i) => (
                <div
                  key={s.id}
                  onClick={() => gotoStory(s)}
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
                      background:
                        i === 0
                          ? "linear-gradient(135deg,#f7d000,#e59400)"
                          : i === 1
                            ? "linear-gradient(135deg,#c0c0c0,#909090)"
                            : i === 2
                              ? "linear-gradient(135deg,#cd7f32,#a0522d)"
                              : "#f5ede4",
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

          {/* Thể loại nhanh */}
          <div className="sidebar-card">
            <div className="sidebar-title">📚 Thể loại</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveGenre(cat.name);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 500,
                    border: "1.5px solid",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background:
                      activeGenre === cat.name ? "#c23d3f" : "#fdf7f0",
                    color: activeGenre === cat.name ? "#fff" : "#6b5a4e",
                    borderColor:
                      activeGenre === cat.name ? "#c23d3f" : "#e8d8c8",
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
