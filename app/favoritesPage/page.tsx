/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/stores";
import { useRouter } from "next/navigation";
import { useGotoStory } from "@/hooks/useGotoStory";
import useFollowService from "@/api/useFollow.service";
import useRatingService from "@/api/useRating.service";
import useStoryService from "@/api/useStory.service";
import { useToast } from "@/hooks/use-toast";

const COVER_GRADIENTS = [
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f7971e,#ffd200)",
  "linear-gradient(135deg,#c471ed,#f64f59)",
];

const isRealCover = (url?: string) =>
  !!url && !url.includes("placeholder.com") && !url.includes("placeholder");

const formatNum = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
};

type FavStory = {
  id: number;
  title: string;
  author: string;
  penName: string;
  cover: string;
  genre: string;
  tags: string[];
  rating: number;
  chapters: number;
  status: "ongoing" | "done";
  reads: string;
  favorites: number;
  description: string;
  categoryId: number | null;
  excerpt: string;
  featured: boolean;
  views: number;
  updatedAt: string;
};

const YEARS = ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017"];

export function FavoritesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const gotoStory = useGotoStory();
  const { getFollowedStories, toggleFollow } = useFollowService();
  const { rateStory, getMyRating } = useRatingService();
  const { getStoryDetail } = useStoryService();
  
  const toastObj = useToast() as any;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [stories, setStories] = useState<FavStory[]>([]);
  const [loading, setLoading] = useState(false);
  // myRatings[storyId] = score user đã đánh giá (0 = chưa)
  const [myRatings, setMyRatings] = useState<Record<number, number>>({});
  const [search, setSearch] = useState("");
  const [filterGenre, setFilterGenre] = useState("all");
  const [filterYear, setFilterYear] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Rating modal state
  const [ratingModal, setRatingModal] = useState<{ storyId: number; title: string; score: number } | null>(null);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const showSuccess = (msg: string) => {
    if (toastObj.toast) toastObj.toast({ title: "Thành công", description: msg });
    else if (toastObj.success) toastObj.success(msg);
  };

  const showError = (msg: string) => {
    if (toastObj.toast) toastObj.toast({ variant: "destructive", title: "Lỗi", description: msg });
    else if (toastObj.error) toastObj.error(msg);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res: any = await getFollowedStories();
      const list: any[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      // Phase 1: hiển thị danh sách ngay với dữ liệu cơ bản
      const baseStories: FavStory[] = list.map((s: any, idx: number) => ({
        id: s.id,
        title: s.title ?? "",
        author: s.authorName ?? "",
        penName: s.authorName ?? "",
        cover: isRealCover(s.coverUrl)
          ? `url("${s.coverUrl}")`
          : COVER_GRADIENTS[idx % COVER_GRADIENTS.length],
        genre: s.categories?.[0]?.name ?? "",
        tags: [],
        rating: Number(s.avgRating ?? s.averageRating ?? 0),
        chapters: Number(s.publishedChapterCount ?? s.totalChapterCount ?? 0),
        status: s.isCompleted ? "done" : "ongoing",
        reads: String(s.viewCount ?? 0),
        favorites: 0,
        description: s.summary ?? "",
        categoryId: s.categories?.[0]?.id ?? null,
        excerpt: s.summary ?? "",
        featured: false,
        views: Number(s.viewCount ?? 0),
        updatedAt: s.updatedAt ?? new Date().toISOString(),
      }));
      setStories(baseStories);
      setLoading(false);

      // Phase 2: song song lấy story detail + rating của user để enrich dữ liệu
      const [detailResults, ratingResults] = await Promise.all([
        Promise.allSettled(list.map((s: any) => getStoryDetail(s.id))),
        Promise.allSettled(list.map((s: any) => getMyRating(s.id))),
      ]);

      // Cập nhật myRatings map
      const ratingMap: Record<number, number> = {};
      ratingResults.forEach((r, i) => {
        if (r.status === "fulfilled") {
          const d: any = (r.value as any)?.data ?? r.value;
          const score = Number(d?.score ?? d?.rating ?? 0);
          if (score > 0) ratingMap[list[i].id] = score;
        }
      });
      setMyRatings(ratingMap);

      // Merge chapter count, view count, avgRating từ story detail
      setStories((prev) =>
        prev.map((story, i) => {
          const dr = detailResults[i];
          if (dr.status !== "fulfilled") return story;
          const d: any = (dr.value as any)?.data ?? dr.value;
          if (!d) return story;
          return {
            ...story,
            chapters: Number(
              d.allChaptersCount ?? d.totalChapterCount ?? d.chapterCount ?? story.chapters
            ),
            views: Number(d.viewCount ?? d.totalViews ?? d.views ?? story.views),
            reads: String(d.viewCount ?? d.totalViews ?? d.views ?? story.views),
            rating: Number(d.avgRating ?? d.averageRating ?? d.rating ?? story.rating),
            genre: d.categories?.[0]?.name ?? story.genre,
            updatedAt: d.updatedAt ?? story.updatedAt,
          };
        })
      );
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
    else setStories([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleUnfollow = async (e: React.MouseEvent, storyId: number) => {
    e.stopPropagation();
    try {
      await toggleFollow(storyId);
      setStories((prev) => prev.filter((s) => s.id !== storyId));
      showSuccess("Đã bỏ yêu thích.");
    } catch {
      showError("Không thể thực hiện. Thử lại sau.");
    }
  };

  const genres = useMemo(() => {
    const set = new Set(stories.map((s) => s.genre).filter(Boolean));
    return Array.from(set).sort();
  }, [stories]);

  const filtered = useMemo(() => {
    let list = [...stories];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((s) => s.title.toLowerCase().includes(q) || s.author.toLowerCase().includes(q));
    }
    if (filterGenre !== "all") list = list.filter((s) => s.genre === filterGenre);
    if (filterYear !== "") list = list.filter((s) => s.updatedAt.includes(filterYear));
    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (sortBy === "views_desc") {
      list.sort((a, b) => b.views - a.views);
    } else if (sortBy === "views_asc") {
      list.sort((a, b) => a.views - b.views);
    }
    return list;
  }, [stories, search, filterGenre, filterYear, sortBy]);

  const handleOpenRating = (e: React.MouseEvent, s: FavStory) => {
    e.stopPropagation();
    if (!user) { router.push("?login"); return; }
    // Dùng rating của user hiện tại (nếu đã đánh giá), không dùng avg rating
    const existingScore = myRatings[s.id] ?? 0;
    setRatingModal({ storyId: s.id, title: s.title, score: existingScore });
    setRatingHover(0);
  };

  const handleSubmitRating = async () => {
    if (!ratingModal || ratingModal.score === 0 || ratingSubmitting) return;
    setRatingSubmitting(true);
    try {
      await rateStory({ storyId: ratingModal.storyId, score: ratingModal.score });
      showSuccess("Đánh giá đã được gửi! ⭐");
      // Cập nhật myRatings map
      setMyRatings((prev) => ({ ...prev, [ratingModal.storyId]: ratingModal.score }));
      setRatingModal(null);
    } catch {
      showError("Không thể gửi đánh giá. Thử lại sau.");
    } finally {
      setRatingSubmitting(false);
    }
  };

  // Helper render các nút filter
  const getPillStyle = (isActive: boolean, activeBg: string, activeColor: string = "#fff") => ({
    padding: "6px 16px",
    borderRadius: 20,
    fontSize: 13,
    cursor: "pointer",
    border: isActive ? "1px solid transparent" : "1px solid #e8e0d6",
    background: isActive ? activeBg : "transparent",
    color: isActive ? activeColor : "#6b5a4e",
    fontWeight: isActive ? 600 : 400,
    transition: "all 0.15s ease",
  });

  if (!mounted) return null;

  if (!user) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
        <div style={{ fontSize: 52 }}>💔</div>
        <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Playfair Display',serif", color: "#1c1512" }}>Chưa đăng nhập</div>
        <div style={{ fontSize: 14, color: "#9e8e82" }}>Đăng nhập để xem danh sách yêu thích của bạn</div>
        <button
          onClick={() => router.push("?login")}
          style={{ padding: "11px 30px", borderRadius: 10, border: "none", background: "#c23d3f", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="fade-in" style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 28px" }}>
        
        {/* ── Header & Search ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Playfair Display',serif", color: "#1c1512", marginBottom: 4 }}>
              ❤️ Yêu Thích
            </div>
            <div style={{ fontSize: 13, color: "#9e8e82" }}>
              {loading ? "Đang tải..." : `${stories.length} tác phẩm đang theo dõi`}
            </div>
          </div>
          
          <div style={{ position: "relative", width: 300 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên truyện hoặc tác giả..."
              style={{
                width: "100%", padding: "10px 14px 10px 38px",
                borderRadius: 10, border: "1.5px solid #e8e0d6",
                fontSize: 13, color: "#3d2f28", background: "#fdfaf7", outline: "none",
              }}
            />
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#b0a096", fontSize: 14, pointerEvents: "none" }}>🔍</span>
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#b0a096", lineHeight: 1 }}>×</button>
            )}
          </div>
        </div>

        {/* ── Bộ lọc (Filters) ── */}
        <div style={{ background: "#fff", border: "1px solid #e8e0d6", borderRadius: 12, padding: "24px", marginBottom: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
          
          {/* Hàng 1: Thể loại */}
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6, minWidth: 90, paddingTop: 6, color: "#3d2f28" }}>
              📚 Thể loại
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <button style={getPillStyle(filterGenre === "all", "#c23d3f")} onClick={() => setFilterGenre("all")}>Tất cả</button>
              {/* Nếu API chưa trả về đủ genre, bạn có thể map từ 1 danh sách cứng ở đây */}
              {genres.map(g => (
                <button key={g} style={getPillStyle(filterGenre === g, "#c23d3f")} onClick={() => setFilterGenre(g)}>{g}</button>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: "#f0ebe4", marginBottom: 20 }} />

{/* Hàng 2: Năm */}
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6, minWidth: 50, paddingTop: 6, color: "#3d2f28" }}>
              📅 Năm
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {YEARS.map(y => (
                <button
                  key={y}
                  style={getPillStyle(filterYear === y, "#c23d3f")}
                  onClick={() => setFilterYear(filterYear === y ? "" : y)}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Hàng 3: Sắp xếp (Căn phải) */}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6, marginRight: 16, color: "#3d2f28" }}>
              ↕ Sắp xếp
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={getPillStyle(sortBy === "newest", "#3b82f6")} onClick={() => setSortBy("newest")}>Mới cập nhật</button>
              <button style={getPillStyle(sortBy === "views_desc", "#3b82f6")} onClick={() => setSortBy("views_desc")}>Lượt đọc ↓</button>
              <button style={getPillStyle(sortBy === "views_asc", "#3b82f6")} onClick={() => setSortBy("views_asc")}>Lượt đọc ↑</button>
            </div>
          </div>

        </div>

        {/* ── Content (Sắp xếp 4-5 truyện/hàng) ── */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 14, overflow: "hidden", background: "#f5ede4" }}>
                <div style={{ paddingTop: "140%", background: "#ece6dc" }} />
                <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ height: 13, background: "#e8e0d6", borderRadius: 6 }} />
                  <div style={{ height: 11, background: "#e8e0d6", borderRadius: 6, width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "72px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>{stories.length === 0 ? "📚" : "🔍"}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#1c1512", marginBottom: 6 }}>
              {stories.length === 0 ? "Chưa có tác phẩm yêu thích" : "Không tìm thấy kết quả"}
            </div>
            <div style={{ fontSize: 13, color: "#9e8e82" }}>
              {stories.length === 0 ? "Nhấn ❤ trên tác phẩm để thêm vào đây." : "Thử thay đổi điều kiện tìm kiếm."}
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 22 }}>
            {filtered.map((s) => (
              <div
                key={s.id}
                onClick={() => gotoStory(s)}
                style={{
                  background: "#fff", borderRadius: 16, overflow: "hidden",
                  border: "1.5px solid #ece6dc", cursor: "pointer",
                  transition: "all .18s", boxShadow: "0 2px 10px rgba(0,0,0,.05)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "translateY(-4px)";
                  el.style.boxShadow = "0 10px 28px rgba(194,61,63,.16)";
                  el.style.borderColor = "#c23d3f";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "";
                  el.style.boxShadow = "0 2px 10px rgba(0,0,0,.05)";
                  el.style.borderColor = "#ece6dc";
                }}
              >
                {/* Cover */}
                <div style={{ position: "relative", paddingTop: "140%" }}>
                  <div
                    style={{
                      position: "absolute", inset: 0,
                      background: s.cover,
                      backgroundSize: "cover", backgroundPosition: "center",
                    }}
                  />
                  {/* Unfollow */}
                  <button
                    onClick={(e) => handleUnfollow(e, s.id)}
                    title="Bỏ yêu thích"
                    style={{
                      position: "absolute", top: 8, right: 8,
                      width: 30, height: 30, borderRadius: "50%",
                      background: "rgba(255,255,255,.92)", border: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", fontSize: 15, color: "#c23d3f",
                      boxShadow: "0 2px 8px rgba(0,0,0,.15)", transition: "all .15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#c23d3f"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,.92)"; (e.currentTarget as HTMLButtonElement).style.color = "#c23d3f"; }}
                  >❤</button>
                </div>

                {/* Info */}
                <div style={{ padding: "13px 13px 14px" }}>
                  <div style={{
                    fontWeight: 700, fontSize: 13, color: "#1c1512",
                    lineHeight: 1.35, marginBottom: 5,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#9e8e82", marginBottom: 7, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.penName}
                  </div>
                  {/* Genre */}
                  {s.genre && (
                    <span style={{
                      display: "inline-block", padding: "2px 9px", borderRadius: 20,
                      fontSize: 10, fontWeight: 600,
                      background: "#fde8e8", color: "#c23d3f", border: "1px solid #f0b4b5",
                      marginBottom: 9,
                    }}>
                      {s.genre}
                    </span>
                  )}

                  {/* Star rating — click to rate */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 8, cursor: "pointer" }}
                    onClick={(e) => handleOpenRating(e, s)}
                    title={myRatings[s.id] ? `Bạn đã đánh giá ${myRatings[s.id]}★ — nhấn để sửa` : "Nhấn để đánh giá"}
                  >
                    {[1, 2, 3, 4, 5].map((star) => {
                      // Ưu tiên hiện rating cá nhân (vàng đậm), nếu chưa có thì dùng avg (vàng nhạt)
                      const userScore = myRatings[s.id] ?? 0;
                      const displayScore = userScore > 0 ? userScore : s.rating;
                      const filled = displayScore >= star;
                      return (
                        <span
                          key={star}
                          style={{
                            fontSize: 14,
                            color: filled ? (userScore > 0 ? "#f59e0b" : "#fbbf24") : "#e5ddd5",
                            transition: "color .1s",
                          }}
                        >★</span>
                      );
                    })}
                    <span style={{ fontSize: 11, color: "#9e8e82", marginLeft: 3 }}>
                      {myRatings[s.id]
                        ? <span style={{ color: "#f59e0b", fontWeight: 600 }}>{myRatings[s.id]}★ của bạn</span>
                        : s.rating > 0 ? s.rating.toFixed(1) : "Đánh giá"
                      }
                    </span>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "#b0a096", flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <span>📖</span>
                      <span style={{ color: "#3d2f28", fontWeight: 600 }}>{s.chapters}</span>
                      <span>chương</span>
                    </span>
                    <span style={{ color: "#e0d4cc" }}>·</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <span>👁</span>
                      <span style={{ color: "#3d2f28", fontWeight: 600 }}>{formatNum(s.views)}</span>
                      <span>lượt đọc</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Rating Modal ── */}
      {ratingModal && (
        <div
          onClick={() => setRatingModal(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 18, padding: "28px 28px 24px",
              width: "100%", maxWidth: 380, boxShadow: "0 8px 40px rgba(0,0,0,.18)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#1c1512" }}>
                {myRatings[ratingModal.storyId] ? "✏️ Sửa đánh giá" : "⭐ Đánh giá truyện"}
              </div>
              <button onClick={() => setRatingModal(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9e8e82", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ fontSize: 13, color: "#6b5a4e", marginBottom: 18, fontStyle: "italic", fontWeight: 600 }}>{ratingModal.title}</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setRatingHover(star)}
                  onMouseLeave={() => setRatingHover(0)}
                  onClick={() => setRatingModal((m) => m ? { ...m, score: star } : null)}
                  style={{
                    background: "none", border: "none", cursor: "pointer", padding: 2,
                    fontSize: 38, lineHeight: 1,
                    color: (ratingHover || ratingModal.score) >= star ? "#f59e0b" : "#d1c9be",
                    transition: "color .1s, transform .1s",
                    transform: (ratingHover || ratingModal.score) >= star ? "scale(1.18)" : "scale(1)",
                  }}
                >★</button>
              ))}
            </div>
            <div style={{ textAlign: "center", fontSize: 13, color: "#f59e0b", fontWeight: 700, marginBottom: 18, minHeight: 20 }}>
              {ratingModal.score > 0 ? ["", "Tệ", "Không hay", "Tạm được", "Hay", "Xuất sắc"][ratingModal.score] : ""}
            </div>
            <button
              disabled={ratingModal.score === 0 || ratingSubmitting}
              onClick={handleSubmitRating}
              style={{
                width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
                background: ratingModal.score === 0 || ratingSubmitting ? "#e5ddd5" : "#c23d3f",
                color: ratingModal.score === 0 || ratingSubmitting ? "#9e8e82" : "#fff",
                fontSize: 14, fontWeight: 700,
                cursor: ratingModal.score === 0 || ratingSubmitting ? "not-allowed" : "pointer",
                transition: "background .15s",
              }}
            >
              {ratingSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default FavoritesPage;