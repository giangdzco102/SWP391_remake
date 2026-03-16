/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useStoryStore } from "@/stores/storyStore";
import { useGotoStory } from "@/hooks/useGotoStory";
import { StoryCard } from "../../src/components/storyCard/page";
import { useRouter } from "next/navigation";
import useStoryService from "@/api/useStory.service";
import { useSearchParams } from "next/navigation";

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

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

const SORT_LABELS = {
  relevant: "Liên quan",
  views: "Lượt đọc",
  rating: "Đánh giá",
  chapters: "Số chương",
} as const;

const RANK_BG = [
  "linear-gradient(135deg,#f7d000,#e59400)",
  "linear-gradient(135deg,#c0c0c0,#909090)",
  "linear-gradient(135deg,#cd7f32,#a0522d)",
];

// ── Types ─────────────────────────────────────────────────────────────────────

type SortKey = keyof typeof SORT_LABELS;
type Story = ReturnType<typeof toShape>;

// ── Pure helpers ──────────────────────────────────────────────────────────────

/** Chuẩn hóa object từ API → shape dùng trong UI */
function toShape(s: any, idx: number): Story {
  const hasRealCover = !!s.coverUrl && !s.coverUrl.includes("placeholder");
  return {
    id: s.id,
    title: s.title,
    author: s.authorName ?? "",
    penName: s.authorName ?? "",
    cover: hasRealCover
      ? `url("${s.coverUrl}")`
      : COVER_GRADIENTS[idx % COVER_GRADIENTS.length],
    genre: s.categories?.[0]?.name ?? s.genre ?? "",
    tags: s.tags ?? [],
    rating: s.averageRating ?? 0,
    reviewCount: s.reviewCount ?? 0,
    reads: s.viewCount >= 1000
      ? `${(s.viewCount / 1000).toFixed(1)}K`
      : String(s.viewCount ?? 0),
    views: s.viewCount ?? 0,
    favorites: s.favoriteCount ?? 0,
    chapters: s.totalChapters ?? 0,
    description: s.summary ?? "",
    status: s.status === "COMPLETED" ? "done" : "ongoing",
    featured: false,
    excerpt: s.summary ?? "",
    updatedAt: s.updatedAt ?? "",
  };
}

/**sort "relevant" */
function relevanceScore(s: Story, q: string) {
  const lq = q.toLowerCase();
  return (s.title.toLowerCase().includes(lq) ? 3 : 0)
    + (s.penName.toLowerCase().includes(lq) ? 1 : 0);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Highlight({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword.trim()) return <>{text}</>;
  const safe = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${safe})`, "gi");
  return (
    <>
      {text.split(regex).map((part, i) =>
        regex.test(part)
          ? <mark key={i} style={{ background: "#fef3c7", color: "#92400e", borderRadius: 3, padding: "0 2px", fontWeight: 700 }}>{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="story-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 animate-pulse">
          <div className="aspect-[1/1.35] w-full rounded-xl bg-[#f0e8df]" />
          <div className="h-3.5 w-4/5 rounded bg-[#f0e8df]" />
          <div className="h-3 w-1/2 rounded bg-[#f0e8df]" />
        </div>
      ))}
    </div>
  );
}

function Pagination({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
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

// ── Main component ────────────────────────────────────────────────────────────

export function SearchResultsPage() {
  const { searchQ, likedStories, toggleLike, allStories, stories } = useStoryStore();
  const gotoStory = useGotoStory();
  const router = useRouter();
  const { searchStories, getAllStories } = useStoryService();
  const searchParams = useSearchParams();
  const genreParam = searchParams.get("genre") ?? "all";

  // ── Fetch state ───────────────────────────────────────────────────────────
  const [apiResults, setApiResults] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cachedAllRef = useRef<Story[] | null>(null); // tránh refetch khi quay lại trang

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchQ.trim().length === 0) {
      // ── Không có query → hiện toàn bộ ─────────────────────────────
      // 1. Cache đầy đủ từ lần fetch trước → dùng ngay, không fetch lại
      if (cachedAllRef.current) { setApiResults(cachedAllRef.current); return; }
      // 2. Show store data
      const pool = allStories?.length ? allStories : stories;
      if (pool?.length) setApiResults(pool as Story[]);
      else setLoading(true);
      // 3. Luôn fetch API để đảm bảo có đầy đủ danh sách (store chỉ load 1 phần)
      getAllStories({ size: 200 })
        .then((res: any) => {
          const shaped = (res?.data ?? res ?? []).map(toShape);
          cachedAllRef.current = shaped;
          setApiResults(shaped);
        })
        .catch(() => { }) // giữ nguyên store data nếu API lỗi
        .finally(() => setLoading(false));
      return;
    }

    // ── Có query (≥ 1 ký tự) → debounce → search ───────────────────
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      searchStories({ keyword: searchQ, size: 100 })
        .then((res: any) => setApiResults((res?.data ?? res ?? []).map(toShape)))
        .catch(() => setApiResults([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQ]);

  useEffect(() => {
    if (genreParam !== "all") {
      setFilterGenre(genreParam);
      if (!searchQ.trim()) setSortBy("views");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genreParam]);

  // ── Filter / sort / pagination state ─────────────────────────────────────
  const [sortBy, setSortBy] = useState<SortKey>("relevant");
  const [filterGenre, setFilterGenre] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);

  const resetPage = (fn: () => void) => { fn(); setPage(1); };
  const clearFilters = () => { setFilterGenre("all"); setFilterStatus("all"); setPage(1); };

  // ── Derived values ────────────────────────────────────────────────────────
  const isSearching = searchQ.trim().length > 0;
  const hasResults = apiResults.length > 0;
  const isFiltered = filterGenre !== "all" || filterStatus !== "all";

  const allGenres = useMemo(
    () => Array.from(new Set(apiResults.map((s) => s.genre).filter(Boolean))) as string[],
    [apiResults],
  );

  const results = useMemo(() => {
    let list = [...apiResults];
    if (filterGenre !== "all") list = list.filter((s) => s.genre === filterGenre);
    if (filterStatus !== "all") list = list.filter((s) => s.status === filterStatus);
    switch (sortBy) {
      case "views": list.sort((a, b) => b.views - a.views); break;
      case "rating": list.sort((a, b) => Number(b.rating) - Number(a.rating)); break;
      case "chapters": list.sort((a, b) => b.chapters - a.chapters); break;
      default:
        if (isSearching)
          list.sort((a, b) => relevanceScore(b, searchQ) - relevanceScore(a, searchQ));
    }
    return list;
  }, [apiResults, filterGenre, filterStatus, sortBy, isSearching, searchQ]);

  const totalPages = Math.ceil(results.length / PAGE_SIZE);
  const paged = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const top5 = [...apiResults].sort((a, b) => b.views - a.views).slice(0, 5);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fade-in">

      {/* ── Header + Filter bar ─────────────────────────────────────────── */}
      <div className="section" style={{ paddingBottom: 0 }}>

        <div style={{ marginBottom: 20 }}>
          <div className="page-title" style={{ marginBottom: 4 }}>
            {isSearching
              ? "🔍 Kết quả tìm kiếm"
              : filterGenre !== "all"
                ? `📂 ${filterGenre}`
                : "📚 Tất cả truyện"
            }
          </div>
          <div className="page-sub">
            {loading ? "Đang tải..."
              : isSearching
                ? <> "{searchQ}" — <strong style={{ color: "#c23d3f" }}>{results.length}</strong> kết quả </>
                : filterGenre !== "all"
                  ? <> <strong style={{ color: "#c23d3f" }}>{results.length}</strong> tác phẩm trong thể loại này </>
                  : <> <strong style={{ color: "#c23d3f" }}>{apiResults.length}</strong> tác phẩm </>
            }
          </div>
        </div>

        {/* Filter + sort — chỉ hiện khi có data */}
        {hasResults && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", padding: "12px 16px", background: "#fdf7f0", borderRadius: 12, border: "1.5px solid #ece6dc", marginBottom: 24 }}>

            <select value={filterGenre} onChange={(e) => resetPage(() => setFilterGenre(e.target.value))}
              style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e8d8c8", fontSize: 13, background: "#fff", color: "#1c1512", cursor: "pointer" }}>
              <option value="all">📚 Tất cả thể loại</option>
              {allGenres.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>

            <select value={filterStatus} onChange={(e) => resetPage(() => setFilterStatus(e.target.value))}
              style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e8d8c8", fontSize: 13, background: "#fff", color: "#1c1512", cursor: "pointer" }}>
              <option value="all">📌 Tất cả trạng thái</option>
              <option value="ongoing">🟡 Đang cập nhật</option>
              <option value="done">✅ Hoàn thành</option>
            </select>

            <div style={{ width: 1, height: 20, background: "#e8d8c8", margin: "0 4px" }} />

            {/* Ẩn "Liên quan" khi không đang search */}
            {(Object.keys(SORT_LABELS) as SortKey[])
              .filter((k) => isSearching || k !== "relevant")
              .map((k) => (
                <button key={k} onClick={() => resetPage(() => setSortBy(k))} style={{
                  padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  border: "1.5px solid", cursor: "pointer", transition: "all 0.15s",
                  background: sortBy === k ? "#c23d3f" : "transparent",
                  color: sortBy === k ? "#fff" : "#9e8e82",
                  borderColor: sortBy === k ? "#c23d3f" : "#e8d8c8",
                }}>
                  {SORT_LABELS[k]}
                </button>
              ))}
          </div>
        )}
      </div>

      {/* ── 2-col layout ────────────────────────────────────────────────── */}
      <div className="section" style={{ paddingTop: 0, display: "grid", gridTemplateColumns: hasResults ? "1fr 280px" : "1fr", gap: 28, alignItems: "start" }}>

        {/* ── LEFT: Story list ──────────────────────────────────────── */}
        <div>
          {loading && <LoadingSkeleton />}

          {!loading && isSearching && apiResults.length === 0 && (
            <div className="empty-state">
              Không tìm thấy kết quả cho "{searchQ}"
              <p>Thử từ khóa khác hoặc{" "}
                <span style={{ color: "#c23d3f", cursor: "pointer", fontWeight: 600 }} onClick={() => router.push("/categoriesPage")}>
                  duyệt theo thể loại
                </span>
              </p>
            </div>
          )}

          {!loading && results.length === 0 && hasResults && (
            <div className="empty-state">
              Không có kết quả khớp bộ lọc
              <p><span style={{ color: "#c23d3f", cursor: "pointer", fontWeight: 600 }} onClick={clearFilters}>Xóa bộ lọc</span>{" "}
                để xem tất cả {apiResults.length} kết quả
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              {/* Đếm kết quả + nút xóa filter */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: "#9e8e82" }}>
                  Hiển thị  {Math.min(page * PAGE_SIZE, results.length)}/{results.length} kết quả
                </div>
                {isFiltered && (
                  <button onClick={clearFilters} style={{ fontSize: 12, color: "#c23d3f", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                    ✕ Xóa bộ lọc
                  </button>
                )}
              </div>

              <div className="story-grid">
                {paged.map((s) => (
                  <StoryCard key={s.id} story={s} onStory={() => gotoStory(s)} liked={likedStories.includes(s.id)} onLike={() => toggleLike(s.id)} />
                ))}
              </div>

              {totalPages > 1 && <Pagination page={page} total={totalPages} onPage={setPage} />}
            </>
          )}
        </div>

        {/* ── RIGHT: Sidebar ────────────────────────────────────────── */}
        {hasResults && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: 80 }}>

            {/* Top 5 */}
            <div className="sidebar-card">
              <div className="sidebar-title">🏆 {isSearching ? "Top kết quả" : "Top lượt đọc"}</div>
              {top5.map((s, i) => (
                <div key={s.id} onClick={() => gotoStory(s)}
                  style={{ display: "flex", gap: 10, padding: "8px 0", cursor: "pointer", borderBottom: i < top5.length - 1 ? "1px solid #f5ede4" : "none", alignItems: "center" }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, flexShrink: 0, background: RANK_BG[i] ?? "#f0e8df", color: i < 3 ? "#fff" : "#9e8e82" }}>
                    {i + 1}
                  </span>
                  <div style={{ width: 38, height: 50, borderRadius: 6, background: s.cover, backgroundSize: "cover", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#1c1512", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 2 }}>
                      <Highlight text={s.title} keyword={searchQ} />
                    </div>
                    <div style={{ fontSize: 11, color: "#9e8e82" }}>
                      <Highlight text={s.penName} keyword={searchQ} /> · {s.genre}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="sidebar-card">
              <div className="sidebar-title">📊 Thống kê</div>
              {([
                ["Tổng truyện", apiResults.length],
                ["Đang cập nhật", apiResults.filter((s) => s.status !== "done").length],
                ["Hoàn thành", apiResults.filter((s) => s.status === "done").length],
                ["Thể loại", allGenres.length],
              ] as [string, number][]).map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid #f5ede4" }}>
                  <span style={{ color: "#9e8e82" }}>{label}</span>
                  <span style={{ fontWeight: 700, color: "#c23d3f" }}>{val}</span>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResultsPage;