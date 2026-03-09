"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStoryStore } from "@/stores/storyStore";
import { useToast } from "@/hooks/use-toast";
import { useGotoStory } from "@/hooks/useGotoStory";
import useStoryService from "@/api/useStory.service";
import useCategoryService, { CategoryItem } from "@/api/useCategory.service";
import { timeStartToNow } from "@/utils/time";
import { BannerHomepage } from "@/components/ui/Bannerhomepage";


const PAGE_SIZE = 20;
const HOT_FETCH_SIZE = 50;
const HOT_DISPLAY_LIMIT = 12;
const TOP5_LIMIT = 5;
const CURRENT_YEAR = new Date().getFullYear();

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

const RANK_COLORS = [
  "linear-gradient(135deg,#f7d000,#e59400)",
  "linear-gradient(135deg,#c0c0c0,#909090)",
  "linear-gradient(135deg,#cd7f32,#a0522d)",
];

const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "updated_desc", label: "Mới cập nhật" },
  { value: "views_desc", label: "Lượt đọc ↓" },
  { value: "views_asc", label: "Lượt đọc ↑" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "ongoing", label: "Đang ra" },
  { value: "done", label: "Hoàn thành" },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
type SortOrder = "views_desc" | "views_asc" | "updated_desc";

interface FilterState {
  genres: string[];
  years: number[];
  status: "all" | "done" | "ongoing";
  sort: SortOrder;
}

const DEFAULT_FILTERS: FilterState = { genres: [], years: [], status: "all", sort: "updated_desc" };

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const isRealCover = (url?: string) =>
  !!url && !url.includes("placeholder.com") && !url.includes("placeholder");

const formatViews = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

const toStoryShape = (s: any, idx: number) => ({
  id: s.id,
  title: s.title,
  author: s.authorName ?? "",
  penName: s.authorName ?? "",
  cover: isRealCover(s.coverUrl) ? `url("${s.coverUrl}")` : COVER_GRADIENTS[idx % COVER_GRADIENTS.length],
  coverUrl: s.coverUrl ?? "",
  genre: s.categories?.[0]?.name ?? s.genre ?? "",
  categoryId: s.categories?.[0]?.id ?? null,
  tags: s.tags ?? [],
  rating: s.averageRating ?? 0,
  reviewCount: s.reviewCount ?? 0,
  reads: s.viewCount != null ? formatViews(s.viewCount) : "0",
  views: s.viewCount ?? 0,
  favorites: s.favoriteCount ?? 0,
  chapters: s.totalChapters ?? 0,
  description: s.summary ?? s.description ?? "",
  status: s.status === "COMPLETED" ? "done" : "ongoing",
  featured: s.featured ?? false,
  excerpt: s.summary ?? "",
  updatedAt: s.updatedAt ?? s.createdAt ?? "",
});

type StoryShape = ReturnType<typeof toStoryShape>;

const sortToApiParam = (s: SortOrder) =>
  s === "views_desc" ? "viewCount,desc" : s === "views_asc" ? "viewCount,asc" : "updatedAt,desc";

const toggleItem = <T,>(arr: T[], val: T): T[] =>
  arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

const countActiveFilters = (f: FilterState) =>
  f.genres.length + f.years.length + (f.status !== "all" ? 1 : 0) + (f.sort !== "updated_desc" ? 1 : 0);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SHARED UI PRIMITIVES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SectionHeader({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, paddingBottom: 10, borderBottom: "2px solid #c23d3f" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 4, height: 22, background: "linear-gradient(180deg,#c23d3f,#9e2d2f)", borderRadius: 2 }} />
        <span style={{ fontSize: 16, fontWeight: 800, color: "#1c1512", letterSpacing: -0.3 }}>{title}</span>
        {sub && <span style={{ fontSize: 12, color: "#9e8e82", fontWeight: 500 }}>{sub}</span>}
      </div>
      {right}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }} className="animate-pulse">
      <div style={{ aspectRatio: "2/2.8", width: "100%", borderRadius: 10, background: "#f0e8df" }} />
      <div style={{ height: 12, width: "80%", borderRadius: 4, background: "#f0e8df" }} />
      <div style={{ height: 10, width: "55%", borderRadius: 4, background: "#f0e8df" }} />
    </div>
  );
}

function SkeletonNewCard() {
  return (
    <div style={{ display: "flex", gap: 10, padding: "8px 10px", alignItems: "flex-start" }} className="animate-pulse">
      <div style={{ width: 56, height: 76, borderRadius: 8, background: "#f0e8df", flexShrink: 0 }} />
      <div style={{ flex: 1, paddingTop: 4, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ height: 13, background: "#f0e8df", borderRadius: 4, width: "85%" }} />
        <div style={{ height: 11, background: "#f0e8df", borderRadius: 4, width: "50%" }} />
        <div style={{ height: 10, background: "#f0e8df", borderRadius: 4, width: "40%" }} />
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STORY CARDS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function HotStoryCard({ s, rank, onClick, liked, onLike }: {
  s: StoryShape; rank: number; onClick: () => void; liked: boolean; onLike: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const rankBg = rank <= 3 ? RANK_COLORS[rank - 1] : "rgba(0,0,0,0.55)";

  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ cursor: "pointer", display: "flex", flexDirection: "column" }}>

      <div style={{
        position: "relative", aspectRatio: "2/2.8", borderRadius: 10, overflow: "hidden",
        backgroundImage: s.cover, backgroundSize: "cover", backgroundPosition: "center",
        boxShadow: hovered ? "0 6px 20px rgba(0,0,0,0.22)" : "0 2px 8px rgba(0,0,0,0.10)",
        transform: hovered ? "translateY(-2px)" : "none", transition: "box-shadow 0.2s, transform 0.2s",
      }}>
        {/* Rank badge */}
        <div style={{ position: "absolute", top: 6, left: 6, width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, background: rankBg, color: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>{rank}</div>

        {/* Like button */}
        <button onClick={(e) => { e.stopPropagation(); onLike(); }}
          style={{ position: "absolute", top: 6, right: 6, width: 26, height: 26, borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, transition: "all 0.15s", background: liked ? "#c23d3f" : "rgba(255,255,255,0.85)", color: liked ? "#fff" : "#c23d3f", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>
          {liked ? "♥" : "♡"}
        </button>

        {/* Status + chapter overlay */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.72))", padding: "18px 7px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: s.status === "done" ? "#4ade80" : "#fbbf24", background: "rgba(0,0,0,0.35)", borderRadius: 3, padding: "1px 5px" }}>
            {s.status === "done" ? "Full" : "Đang ra"}
          </span>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>Ch.{s.chapters}</span>
        </div>
      </div>

      <div style={{ padding: "7px 2px 4px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.35, color: hovered ? "#c23d3f" : "#1c1512", transition: "color 0.15s", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 3 }}>{s.title}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
          <span style={{ fontSize: 10, color: "#9e8e82", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.penName}</span>
          <span style={{ fontSize: 10, color: "#9e8e82", whiteSpace: "nowrap", flexShrink: 0 }}>👁 {s.reads}</span>
        </div>
      </div>
    </div>
  );
}

function NewUpdateCard({ s, onClick }: { s: StoryShape; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: "flex", gap: 10, padding: "8px 10px", borderRadius: 10, cursor: "pointer", alignItems: "flex-start", background: hovered ? "#fdf3ee" : "transparent", transition: "background 0.15s" }}>

      <div style={{ position: "relative", width: 56, height: 76, borderRadius: 8, flexShrink: 0, backgroundImage: s.cover, backgroundSize: "cover", backgroundPosition: "center", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.78))", padding: "12px 4px 3px", textAlign: "center" }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>Ch.{s.chapters}</span>
        </div>
        {s.status === "ongoing" && (
          <div style={{ position: "absolute", top: 3, right: 3, background: "#c23d3f", borderRadius: 3, padding: "1px 4px", fontSize: 8, fontWeight: 700, color: "#fff" }}>MỚI</div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35, marginBottom: 5, color: hovered ? "#c23d3f" : "#1c1512", transition: "color 0.15s", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.title}</div>
        {s.genre && (
          <span style={{ fontSize: 10, fontWeight: 600, color: "#c23d3f", background: "#fde8e8", border: "1px solid #f5c0c0", borderRadius: 4, padding: "1px 6px", display: "inline-block", marginBottom: 5 }}>{s.genre}</span>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
          <span style={{ fontSize: 11, color: "#9e8e82", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.penName}</span>
          <span style={{ fontSize: 10, color: "#b8921e", fontWeight: 600, whiteSpace: "nowrap" }}>{s.updatedAt ? timeStartToNow(s.updatedAt) : "Vừa xong"}</span>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PAGINATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  const pages: (number | "…")[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("…");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push("…");
    pages.push(total);
  }

  const base: React.CSSProperties = { width: 34, height: 34, borderRadius: 8, border: "1.5px solid #e8d8c8", background: "#fff", color: "#6b5a4e", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 20, paddingTop: 16, borderTop: "1px solid #f5ede4" }}>
      <button onClick={() => onChange(current - 1)} disabled={current === 1} style={{ ...base, opacity: current === 1 ? 0.4 : 1, cursor: current === 1 ? "not-allowed" : "pointer", fontSize: 16 }}>‹</button>
      {pages.map((p, i) =>
        p === "…"
          ? <span key={"e" + i} style={{ fontSize: 13, color: "#9e8e82", padding: "0 2px" }}>…</span>
          : <button key={p} onClick={() => onChange(p as number)} style={{ ...base, borderColor: p === current ? "#c23d3f" : "#e8d8c8", background: p === current ? "linear-gradient(135deg,#c23d3f,#9e2d2f)" : "#fff", color: p === current ? "#fff" : "#6b5a4e", fontWeight: p === current ? 700 : 500 }}>{p}</button>
      )}
      <button onClick={() => onChange(current + 1)} disabled={current === total} style={{ ...base, opacity: current === total ? 0.4 : 1, cursor: current === total ? "not-allowed" : "pointer", fontSize: 16 }}>›</button>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FILTER BAR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function FilterBar({ categories, filters, onChange, onReset }: {
  categories: CategoryItem[]; filters: FilterState;
  onChange: (f: FilterState) => void; onReset: () => void;
}) {
  const pill = (active: boolean, color = "#c23d3f"): React.CSSProperties => ({
    padding: "4px 12px", borderRadius: 20, fontSize: 12, border: "1.5px solid", cursor: "pointer", transition: "all 0.15s",
    fontWeight: active ? 700 : 500,
    background: active ? color : "#fdf7f0",
    color: active ? "#fff" : "#6b5a4e",
    borderColor: active ? color : "#e8d8c8",
  });

  return (
    <div style={{ background: "#fff", border: "1px solid #f0e4d8", borderRadius: 14, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>

      {/* Genre */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#6b5a4e", minWidth: 80, paddingTop: 4, flexShrink: 0 }}>📚 Thể loại</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <button onClick={() => onChange({ ...filters, genres: [] })} style={pill(filters.genres.length === 0)}>Tất cả</button>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => onChange({ ...filters, genres: toggleItem(filters.genres, cat.name) })} style={pill(filters.genres.includes(cat.name))}>{cat.name}</button>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: "#f5ede4" }} />

      {/* Year + Status + Sort */}
      <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#6b5a4e", whiteSpace: "nowrap" }}>📅 Năm</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {YEAR_OPTIONS.map((yr) => (
              <button key={yr} onClick={() => onChange({ ...filters, years: toggleItem(filters.years, yr) })} style={{ ...pill(filters.years.includes(yr), "#1c1512"), padding: "3px 10px", borderRadius: 6 }}>{yr}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#6b5a4e", whiteSpace: "nowrap" }}>🔖 Tình trạng</span>
          <div style={{ display: "flex", gap: 5 }}>
            {STATUS_OPTIONS.map((opt) => {
              const c = opt.value === "done" ? "#16a34a" : opt.value === "ongoing" ? "#d97706" : "#6b5a4e";
              return <button key={opt.value} onClick={() => onChange({ ...filters, status: opt.value as FilterState["status"] })} style={{ ...pill(filters.status === opt.value, c), padding: "3px 12px", borderRadius: 6 }}>{opt.label}</button>;
            })}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#6b5a4e", whiteSpace: "nowrap" }}>↕ Sắp xếp</span>
          <div style={{ display: "flex", gap: 5 }}>
            {SORT_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => onChange({ ...filters, sort: opt.value })} style={{ ...pill(filters.sort === opt.value, "#3b82f6"), padding: "3px 12px", borderRadius: 6 }}>{opt.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Active filter summary */}
      {countActiveFilters(filters) > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "#9e8e82" }}>Đang lọc:</span>
          {filters.genres.map((g) => (
            <span key={g} style={{ fontSize: 11, background: "#fde8e8", color: "#c23d3f", border: "1px solid #f5c0c0", borderRadius: 20, padding: "1px 8px", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              {g} <button onClick={() => onChange({ ...filters, genres: filters.genres.filter((x) => x !== g) })} style={{ background: "none", border: "none", cursor: "pointer", color: "#c23d3f", fontSize: 11, padding: 0 }}>✕</button>
            </span>
          ))}
          {filters.years.map((y) => (
            <span key={y} style={{ fontSize: 11, background: "#f0f0f0", color: "#1c1512", border: "1px solid #ddd", borderRadius: 20, padding: "1px 8px", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              {y} <button onClick={() => onChange({ ...filters, years: filters.years.filter((x) => x !== y) })} style={{ background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 11, padding: 0 }}>✕</button>
            </span>
          ))}
          {filters.status !== "all" && (
            <span style={{ fontSize: 11, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 20, padding: "1px 8px", fontWeight: 600 }}>
              {STATUS_OPTIONS.find((o) => o.value === filters.status)?.label}
            </span>
          )}
          <button onClick={onReset} style={{ fontSize: 11, color: "#9e8e82", background: "none", border: "1px solid #e8d8c8", borderRadius: 20, padding: "1px 10px", cursor: "pointer" }}>Xoá tất cả</button>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUSTOM HOOKS  (data fetching logic — separated from UI)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Fetch category list once on mount */
function useCategories() {
  const { getCategories } = useCategoryService();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  useEffect(() => {
    getCategories().then((res: any) => setCategories(res?.data ?? res ?? [])).catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return categories;
}

/** Fetch hot stories once on mount */
function useHotStories() {
  const { getStories } = useStoryService();
  const [stories, setStories] = useState<StoryShape[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    getStories({ size: HOT_FETCH_SIZE, sort: "viewCount,desc" })
      .then((res: any) => setStories((res?.data ?? res ?? []).map(toStoryShape)))
      .catch(() => { })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { stories, loading };
}

/** Fetch new-update stories — re-fetches when page or filters change */
function useNewStories(page: number, filters: FilterState) {
  const { getStories } = useStoryService();
  const { setAllStories } = useStoryStore();
  const [stories, setStories] = useState<StoryShape[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, any> = {
      size: PAGE_SIZE, page: page - 1, sort: sortToApiParam(filters.sort),
    };
    if (filters.genres.length === 1) params.category = filters.genres[0];
    if (filters.genres.length > 1) params.categories = filters.genres.join(",");
    if (filters.status === "done") params.status = "COMPLETED";
    if (filters.status === "ongoing") params.status = "ONGOING";
    if (filters.years.length > 0) params.year = filters.years[0];

    getStories(params)
      .then((res: any) => {
        const raw: any[] = res?.data ?? res?.content ?? res ?? [];
        const filtered = raw.map(toStoryShape).filter((s) => {
          if (filters.genres.length > 0 && !filters.genres.includes(s.genre)) return false;
          if (filters.status !== "all" && s.status !== filters.status) return false;
          if (filters.years.length > 0 && !filters.years.includes(new Date(s.updatedAt).getFullYear())) return false;
          return true;
        });
        setStories(filtered);
        setAllStories(filtered);
        const total = res?.totalElements ?? res?.meta?.totalElements ?? res?.pagination?.totalElements ?? res?.total ?? null;
        const tp = res?.totalPages ?? res?.meta?.totalPages ?? res?.pagination?.totalPages ?? (total != null ? Math.ceil(total / PAGE_SIZE) : 1);
        setTotalPages(Math.max(1, tp));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  return { stories, totalPages, loading };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PAGE SECTIONS  (composed from cards + hooks)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function HotSection({ stories, loading, filters, onStory, likedStories, onLike }: {
  stories: StoryShape[]; loading: boolean; filters: FilterState;
  onStory: (s: StoryShape) => void; likedStories: string[]; onLike: (id: string, wasLiked: boolean) => void;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <SectionHeader title="🔥 Truyện hot" sub={filters.genres.length > 0 ? `· ${filters.genres.join(", ")}` : undefined} />
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {Array.from({ length: HOT_DISPLAY_LIMIT }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : stories.length === 0 ? (
        <div className="empty-state">Chưa có dữ liệu</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {stories.slice(0, HOT_DISPLAY_LIMIT).map((s, i) => (
            <HotStoryCard key={s.id} s={s} rank={i + 1} onClick={() => onStory(s)}
              liked={likedStories.includes(s.id)} onLike={() => onLike(s.id, likedStories.includes(s.id))} />
          ))}
        </div>
      )}
    </div>
  );
}

function NewUpdatesSection({ stories, loading, page, totalPages, onPageChange, onStory }: {
  stories: StoryShape[]; loading: boolean;
  page: number; totalPages: number; onPageChange: (p: number) => void; onStory: (s: StoryShape) => void;
}) {
  return (
    <div id="new-updates-section" style={{ scrollMarginTop: 80 }}>
      <SectionHeader title="🆕 Mới cập nhật" sub="Cập nhật theo thời gian thực"
        right={<span style={{ fontSize: 12, color: "#9e8e82" }}>Trang {page}/{totalPages}</span>} />
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonNewCard key={i} />)}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
          {stories.map((s) => <NewUpdateCard key={s.id} s={s} onClick={() => onStory(s)} />)}
        </div>
      )}
      <Pagination current={page} total={totalPages} onChange={onPageChange} />
    </div>
  );
}

function Sidebar({ top5, categories, filters, onStory, onGenreToggle }: {
  top5: StoryShape[]; categories: CategoryItem[]; filters: FilterState;
  onStory: (s: StoryShape) => void; onGenreToggle: (name: string) => void;
}) {
  const router = useRouter();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 80 }}>

      {/* 🏆 Top 5 rankings */}
      <div className="sidebar-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div className="sidebar-title" style={{ margin: 0 }}>🏆 Bảng xếp hạng</div>
          <button className="see-all" style={{ fontSize: 12 }} onClick={() => router.push("/rankingsPage")}>Xem đầy đủ →</button>
        </div>
        {top5.length === 0 ? <div style={{ fontSize: 13, color: "#9e8e82" }}>Chưa có dữ liệu</div> : top5.map((s, i) => (
          <div key={s.id} onClick={() => onStory(s)} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #f5ede4", cursor: "pointer", alignItems: "center" }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0, background: i < 3 ? RANK_COLORS[i] : "#f5ede4", color: i < 3 ? "#fff" : "#9e8e82" }}>{i + 1}</span>
            <div style={{ width: 40, height: 52, borderRadius: 6, backgroundImage: s.cover, backgroundSize: "cover", backgroundPosition: "center", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1c1512", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.35, marginBottom: 3 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: "#9e8e82" }}>👁 {s.reads} · ⭐ {Number(s.rating) > 0 ? Number(s.rating).toFixed(1) : "Mới"}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 📚 Category pills */}
      <div className="sidebar-card">
        <div className="sidebar-title">📚 Thể loại</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {categories.map((cat) => {
            const active = filters.genres.includes(cat.name);
            return (
              <button key={cat.id} onClick={() => onGenreToggle(cat.name)} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, border: "1.5px solid", cursor: "pointer", transition: "all 0.15s", background: active ? "#c23d3f" : "#fdf7f0", color: active ? "#fff" : "#6b5a4e", borderColor: active ? "#c23d3f" : "#e8d8c8" }}>
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN PAGE  (state + handlers only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function HomePage() {
  const { likedStories, toggleLike } = useStoryStore();
  const gotoStory = useGotoStory();
  const toast = useToast();

  // Filter + pagination
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [newPage, setNewPage] = useState(1);

  // Data
  const categories = useCategories();
  const { stories: rawHot, loading: loadingHot } = useHotStories();
  const { stories: newStories, totalPages, loading: loadingNew } = useNewStories(newPage, filters);

  // Apply client-side filters + sort to hot stories
  const hotStories = (() => {
    let list = rawHot;
    if (filters.genres.length > 0) list = list.filter((s) => filters.genres.includes(s.genre));
    if (filters.status !== "all") list = list.filter((s) => s.status === filters.status);
    if (filters.years.length > 0) list = list.filter((s) => filters.years.includes(new Date(s.updatedAt).getFullYear()));
    if (filters.sort === "views_asc") list = [...list].sort((a, b) => a.views - b.views);
    if (filters.sort === "views_desc") list = [...list].sort((a, b) => b.views - a.views);
    return list;
  })();

  const top5 = [...hotStories].sort((a, b) => b.views - a.views).slice(0, TOP5_LIMIT);

  // Handlers
  const handleFilterChange = (f: FilterState) => { setFilters(f); setNewPage(1); };
  const handleFilterReset = () => { setFilters(DEFAULT_FILTERS); setNewPage(1); };
  const handlePageChange = (p: number) => {
    setNewPage(p);
    document.getElementById("new-updates-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const handleLike = (id: string, wasLiked: boolean) => {
    toggleLike(id);
    toast.success(wasLiked ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích ❤");
  };
  const handleGenreToggle = (name: string) => {
    setFilters((f) => ({ ...f, genres: toggleItem(f.genres, name) }));
    setNewPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeCount = countActiveFilters(filters);

  return (
    <div className="fade-in">

      {/* 1. Banner */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <BannerHomepage />
      </div>

      {/* 2. Filter toggle */}
      <div className="section" style={{ paddingBottom: 0, paddingTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setFilterOpen((o) => !o)}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 16px", borderRadius: 20, border: "1.5px solid", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.18s", background: filterOpen ? "#c23d3f" : "#fff", color: filterOpen ? "#fff" : "#6b5a4e", borderColor: filterOpen ? "#c23d3f" : "#e8d8c8", boxShadow: filterOpen ? "0 2px 10px rgba(194,61,63,0.25)" : "none" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Bộ lọc
            {activeCount > 0 && (
              <span style={{ background: filterOpen ? "rgba(255,255,255,0.3)" : "#c23d3f", color: "#fff", borderRadius: 10, fontSize: 11, fontWeight: 700, padding: "1px 6px" }}>{activeCount}</span>
            )}
            <span style={{ fontSize: 11, opacity: 0.7 }}>{filterOpen ? "▲" : "▼"}</span>
          </button>

          {/* Active pills preview when panel is closed */}
          {!filterOpen && (filters.genres.length > 0 || filters.status !== "all") && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {filters.genres.map((g) => (
                <span key={g} style={{ fontSize: 11, background: "#fde8e8", color: "#c23d3f", border: "1px solid #f5c0c0", borderRadius: 20, padding: "2px 10px", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                  {g} <button onClick={() => handleFilterChange({ ...filters, genres: filters.genres.filter((x) => x !== g) })} style={{ background: "none", border: "none", cursor: "pointer", color: "#c23d3f", fontSize: 11, padding: 0 }}>✕</button>
                </span>
              ))}
              {filters.status !== "all" && (
                <span style={{ fontSize: 11, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 20, padding: "2px 10px", fontWeight: 600 }}>
                  {filters.status === "done" ? "Hoàn thành" : "Đang ra"}
                </span>
              )}
            </div>
          )}
        </div>

        {filterOpen && (
          <div style={{ marginTop: 10, animation: "slideDown 0.2s ease" }}>
            <FilterBar categories={categories} filters={filters} onChange={handleFilterChange} onReset={handleFilterReset} />
          </div>
        )}
      </div>

      {/* 3. Main grid: content left | sidebar right */}
      <div className="section" style={{ paddingTop: 20, display: "grid", gridTemplateColumns: "1fr 300px", gap: 28, alignItems: "start" }}>
        <div>
          <HotSection stories={hotStories} loading={loadingHot} filters={filters} onStory={gotoStory} likedStories={likedStories} onLike={handleLike} />
          <NewUpdatesSection stories={newStories} loading={loadingNew} page={newPage} totalPages={totalPages} onPageChange={handlePageChange} onStory={gotoStory} />
        </div>
        <Sidebar top5={top5} categories={categories} filters={filters} onStory={gotoStory} onGenreToggle={handleGenreToggle} />
      </div>

    </div>
  );
}

export default HomePage;