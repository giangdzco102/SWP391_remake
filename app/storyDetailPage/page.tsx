"use client";
import React, { useState, useEffect } from "react";
import { Ico } from "@/components/Icons";
import { StarRating } from "@/components/ui";
import { useStoryStore } from "@/stores/storyStore";
import { useNavStore } from "@/stores/navStore";
import { useAuthStore } from "@/stores";
import { useRouter } from "next/navigation";
import { useGotoStory } from "@/hooks/useGotoStory";
import useChapterService from "@/api/useChapter.service";
import useReportService from "@/api/useReport.service";
import { useToast } from "@/hooks/use-toast";

export function StoryDetailPage() {
  const {
    stories,
    likedStories,
    toggleLike,
    unlockedChapters,
    unlockChapter,
    reviews,
    setReviews,
    chapters,
    setChapters,
  } = useStoryStore();
  const { selectedStory: story, navTo, setSelectedChapterId } = useNavStore();
  const gotoStory = useGotoStory();
  const { user } = useAuthStore();
  const router = useRouter();
  const { getChaptersByStory } = useChapterService();

  // Fetch chapters from API when story changes
  useEffect(() => {
    if (!story?.id) return;
    getChaptersByStory(story.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((res: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const list: any[] = res?.data ?? res ?? [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = list.map((ch: any) => {
          const wordCount = ch.content
            ? ch.content.trim().split(/\s+/).length
            : 0;
          const mins = Math.max(1, Math.ceil(wordCount / 200));
          return {
            id: ch.id,
            title: ch.title,
            words: wordCount,
            readTime: `${mins} phút`,
            publishedAt: ch.publishAt
              ? new Date(ch.publishAt).toLocaleDateString("vi-VN")
              : undefined,
            locked: (ch.coinPrice ?? 0) > 0 && !ch.isPurchased,
            price: ch.coinPrice ?? 0,
          };
        });
        setChapters(mapped);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);

  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [aspectRatings, setAspectRatings] = useState({
    plot: 0,
    characters: 0,
    writing: 0,
    pacing: 0,
  });
  const [helpfulSet, setHelpfulSet] = useState(new Set());
  const [showWriteReview, setShowWriteReview] = useState(false);

  // Report
  const { createReport } = useReportService();
  const toast = useToast();
  const [storyReportOpen, setStoryReportOpen] = useState(false);
  const [storyReportReason, setStoryReportReason] = useState("");
  const [storyReporting, setStoryReporting] = useState(false);

  const handleReportStory = async () => {
    if (!storyReportReason.trim() || !story) return;
    setStoryReporting(true);
    try {
      await createReport({ targetType: "STORY", targetId: story.id, reason: storyReportReason.trim() });
      toast.success("Báo cáo đã được gửi. Cảm ơn bạn!");
      setStoryReportOpen(false);
      setStoryReportReason("");
    } catch {
      toast.error("Không thể gửi báo cáo. Thử lại sau.");
    } finally {
      setStoryReporting(false);
    }
  };

  if (!story) return null;

  const requireAuth = (cb: () => void) => {
    if (!user) {
      router.push("?login");
      return;
    }
    cb();
  };

  const liked = likedStories.includes(story.id);
  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : "—";
  const ratingDist = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: reviews.filter((r) => r.rating === n).length,
    pct: reviews.length
      ? Math.round(
          (reviews.filter((r) => r.rating === n).length / reviews.length) * 100,
        )
      : 0,
  }));

  const submitReview = () => {
    if (!user) {
      router.push("?login");
      return;
    }
    if (!reviewText.trim() || !userRating) return;
    setReviews([
      {
        id: Date.now(),
        user: user.fullName,
        avatar: user.fullName.slice(0, 2).toUpperCase(),
        avatarColor: "#c23d3f",
        isReviewer: user.roles?.includes("REVIEWER"),
        rating: userRating,
        date: new Date().toLocaleDateString("vi-VN"),
        chapter: chapters.length,
        content: reviewText,
        likes: 0,
        aspects: aspectRatings,
      },
      ...reviews,
    ]);
    setReviewText("");
    setUserRating(0);
    setAspectRatings({ plot: 0, characters: 0, writing: 0, pacing: 0 });
    setShowWriteReview(false);
  };

  const relatedStories = stories
    .filter((s) => s.id !== story.id && s.genre === story.genre)
    .slice(0, 3);

  return (
    <div className="fade-in">
      <div className="detail-wrap">
        <div className="mobile-user-info">
          <button className="back-btn" onClick={() => router.push("/homePage")}>
            <Ico.Back />
            Quay lại
          </button>
          <div className="detail-cover-row">
            <div className="detail-cover">
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: story.cover,
                }}
              />
            </div>
            <div className="hero-left">
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                <span
                  className={`absolute left-[9px] top-[9px] rounded-[5px] px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.4px] ${story.status === "done" ? "badge-done" : "badge-ongoing"}`}
                  style={{ position: "static" }}
                >
                  {story.status === "done" ? "✓ Hoàn thành" : "Đang cập nhật"}
                </span>
                <span className="tag tag-genre">{story.genre}</span>
              </div>
              <h1 className="detail-title">{story.title}</h1>
              <div className="detail-author">
                bởi <span className="detail-author">{story.penName}</span>
              </div>
              <div className="detail-tags">
                {story.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
              <div className="detail-stats">
                <div className="stat">
                  <div className="stat-num">{story.reads}</div>
                  <div className="stat-label">Lượt đọc</div>
                </div>
                <div className="stat">
                  <div className="stat-num">{story.chapters}</div>
                  <div className="stat-label">Chương</div>
                </div>
                <div className="stat">
                  <div className="stat-num">{reviews.length}</div>
                  <div className="stat-label">Đánh giá</div>
                </div>
                <div className="stat">
                  <div className="stat-num">
                    {(story.favorites || 0).toLocaleString()}
                  </div>
                  <div className="stat-label">Yêu thích</div>
                </div>
              </div>
              <div className="detail-rating">
                <StarRating rating={parseFloat(avgRating) || 0} size={18} />
                <span
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#c23d3f",
                  }}
                >
                  {avgRating}
                </span>
                <span style={{ fontSize: 13, color: "#9e8e82" }}>/ 5</span>
              </div>
              <div className="detail-actions">
                <button
                  className="btn-hero btn-hero-primary"
                  style={{ fontSize: 14 }}
                  onClick={() => requireAuth(() => {
                    const firstChapter = chapters[0];
                    if (firstChapter?.id) {
                      setSelectedChapterId(firstChapter.id);
                      router.push("/readerPage");
                    }
                  })}
                >
                  <Ico.Book />
                  Đọc từ đầu
                </button>
                <button
                  className={`btn-hero ${liked ? "btn-hero-primary" : "btn-hero-outline"}`}
                  style={{
                    fontSize: 14,
                    background: liked ? "#fde8e8" : undefined,
                    color: liked ? "#c23d3f" : undefined,
                    borderColor: "#c23d3f",
                  }}
                  onClick={() => requireAuth(() => toggleLike(story.id))}
                >
                  <Ico.Heart f={liked} />
                  {liked ? "Đã lưu" : "Yêu thích"}
                </button>
                <button
                  className="btn-hero btn-hero-outline"
                  style={{ fontSize: 13, color: "#9ca3af", borderColor: "#e8e0d6" }}
                  onClick={() => requireAuth(() => setStoryReportOpen(true))}
                >
                  🚩 Báo cáo
                </button>
              </div>
            </div>
          </div>

          {/* Inline Story Report */}
          {storyReportOpen && (
            <div style={{ background: "#fdfaf7", border: "1.5px solid #e8e0d6", borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1c1512", marginBottom: 8 }}>🚩 Báo cáo truyện: <em>{story.title}</em></div>
              <textarea
                value={storyReportReason}
                onChange={(e) => setStoryReportReason(e.target.value)}
                placeholder="Mô tả lý do báo cáo..."
                rows={3}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e8e0d6", fontSize: 13, color: "#3d2f28", resize: "none", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
                <button onClick={() => { setStoryReportOpen(false); setStoryReportReason(""); }} style={{ padding: "8px 18px", borderRadius: 9, border: "1.5px solid #e8e0d6", background: "#fff", color: "#6b5a4e", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Hủy
                </button>
                <button
                  onClick={handleReportStory}
                  disabled={!storyReportReason.trim() || storyReporting}
                  style={{ padding: "8px 18px", borderRadius: 9, border: "none", background: !storyReportReason.trim() || storyReporting ? "#f3f4f6" : "#c23d3f", color: !storyReportReason.trim() || storyReporting ? "#9ca3af" : "#fff", fontSize: 13, fontWeight: 700, cursor: !storyReportReason.trim() || storyReporting ? "not-allowed" : "pointer" }}
                >
                  {storyReporting ? "Đang gửi..." : "Gửi báo cáo"}
                </button>
              </div>
            </div>
          )}

          <blockquote className="detail-desc">{story.description}</blockquote>

          {/* Chapters */}
          <div className="sec-head" style={{ marginBottom: 12 }}>
            <div className="sec-title" style={{ fontSize: 18 }}>
              Danh sách chương ({chapters.length})
            </div>
          </div>
          <div className="chapters-list">
            {chapters.map((ch, i) => {
              const isLocked = ch.locked && !unlockedChapters?.includes(ch.id);
              return (
                <div
                  key={ch.id}
                  className={`chapter-item${isLocked ? " chapter-locked" : ""}`}
                  onClick={() => requireAuth(() => {
                    if (!isLocked && ch.id) {
                      setSelectedChapterId(ch.id);
                      router.push("/readerPage");
                    }
                  })}
                  style={
                    isLocked
                      ? {
                          cursor: "default",
                          background: "#fdf7f0",
                          borderColor: "#f0dfc8",
                        }
                      : {}
                  }
                >
                  <div className="hero-left" style={{ flex: 1 }}>
                    <div
                      className="ch-title"
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      {isLocked && (
                        <span
                          style={{
                            fontSize: 12,
                            background: "#fef3c7",
                            color: "#b45309",
                            border: "1px solid #fcd34d",
                            padding: "1px 7px",
                            borderRadius: 10,
                            fontWeight: 700,
                          }}
                        >
                          🔒 VIP
                        </span>
                      )}
                      {ch.title}
                    </div>
                    <div className="ch-meta">
                      <Ico.Book /> {ch.words.toLocaleString()} chữ · ⏱{" "}
                      {ch.readTime}
                      {ch.publishedAt && ` · ${ch.publishedAt}`}
                    </div>
                  </div>
                  {isLocked ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        requireAuth(() => unlockChapter(ch.id, ch.price || 10));
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        background: "linear-gradient(135deg,#c69526,#9a7020)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "7px 14px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                        boxShadow: "0 2px 8px rgba(194,149,38,.3)",
                      }}
                    >
                      🪙 {ch.price} xu
                    </button>
                  ) : (
                    <div className="ch-arrow">
                      <Ico.Next />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Reviews */}
          <div className="reviews-section">
            <div className="reviews-header">
              <div className="sec-title" style={{ fontSize: 18 }}>
                Đánh giá ({reviews.length})
              </div>
              <button
                className="btn-ghost btn-nav"
                onClick={() =>
                  requireAuth(() => setShowWriteReview(!showWriteReview))
                }
              >
                {showWriteReview ? "✕ Đóng" : "✎ Viết đánh giá"}
              </button>
            </div>
            <div className="overall-rating">
              <div className="big-rating">{avgRating}</div>
              <div className="hero-left">
                <StarRating rating={parseFloat(avgRating) || 0} size={20} />
                <div style={{ fontSize: 12, color: "#9e8e82", marginTop: 4 }}>
                  {reviews.length} đánh giá
                </div>
                <div className="rating-breakdown">
                  {ratingDist.map((r) => (
                    <div key={r.n} className="rating-bar-row">
                      <span>{r.n}★</span>
                      <div className="rating-bar-bg">
                        <div
                          className="rating-bar-fill"
                          style={{ width: `${r.pct}%` }}
                        />
                      </div>
                      <span style={{ width: 24, textAlign: "right" }}>
                        {r.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {showWriteReview && (
              <div className="write-review fade-in">
                <div className="write-review-title">✎ Đánh giá của bạn</div>
                <div style={{ marginBottom: 12 }}>
                  <label className="form-label">Điểm tổng thể</label>
                  <div className="star-select">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        className="star-btn"
                        onMouseEnter={() => setHoverRating(n)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setUserRating(n)}
                      >
                        {n <= (hoverRating || userRating) ? "⭐" : "☆"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="aspects-rate">
                  {(["plot", "characters", "writing", "pacing"] as const).map(
                    (a) => (
                      <div key={a} className="aspect-rate-item">
                        <span className="aspect-name">
                          {
                            {
                              plot: "Cốt truyện",
                              characters: "Nhân vật",
                              writing: "Văn phong",
                              pacing: "Nhịp độ",
                            }[a]
                          }
                        </span>
                        <div className="mini-stars">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              className="mini-star-btn"
                              onClick={() =>
                                setAspectRatings((r) => ({ ...r, [a]: n }))
                              }
                            >
                              {n <= aspectRatings[a] ? "⭐" : "☆"}
                            </button>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
                <label className="form-label">Nhận xét</label>
                <textarea
                  className="form-textarea"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn…"
                />
                <div className="char-count">{reviewText.length} ký tự</div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 12,
                    gap: 8,
                  }}
                >
                  <button
                    className="btn-nav btn-ghost"
                    onClick={() => setShowWriteReview(false)}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn-nav btn-primary"
                    onClick={submitReview}
                  >
                    Gửi đánh giá
                  </button>
                </div>
              </div>
            )}

            {reviews.map((r) => (
              <div key={r.id} className="review-card fade-in">
                <div className="coin-tx-info">
                  <div
                    className="avatar"
                    style={{
                      background: r.avatarColor,
                      width: 38,
                      height: 38,
                      fontSize: 13,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    {r.avatar}
                  </div>
                  <div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 7 }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#1c1512",
                        }}
                      >
                        {r.user}
                      </span>
                      {r.isReviewer && (
                        <span
                          className="role-chip chip-reviewer"
                          style={{ fontSize: 9, padding: "2px 7px" }}
                        >
                          <Ico.Verified />
                          Reviewer
                        </span>
                      )}
                    </div>
                    <div className="review-meta">
                      <StarRating rating={r.rating} size={12} />
                      <span>
                        · Chương {r.chapter} · {r.date}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="review-text">{r.content}</p>
                <div className="review-aspects">
                  {r.aspects &&
                    Object.entries(r.aspects).map(([k, v]) => (
                      <span key={k} className="aspect-chip">
                        {
                          {
                            plot: "Cốt truyện",
                            characters: "Nhân vật",
                            writing: "Văn phong",
                            pacing: "Nhịp độ",
                          }[k as "plot" | "characters" | "writing" | "pacing"]
                        }
                        : {v as React.ReactNode}★
                      </span>
                    ))}
                </div>
                <button
                  className={`helpful-btn${helpfulSet.has(r.id) ? " active" : ""}`}
                  onClick={() =>
                    setHelpfulSet((s) => {
                      const ns = new Set(s);
                      ns.has(r.id) ? ns.delete(r.id) : ns.add(r.id);
                      return ns;
                    })
                  }
                >
                  👍 Hữu ích · {r.likes + (helpfulSet.has(r.id) ? 1 : 0)}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="detail-sidebar">
          <div className="sidebar-card">
            <div className="sidebar-title">Cùng thể loại</div>
            {relatedStories.length > 0 ? (
              relatedStories.map((s) => (
                <div
                  key={s.id}
                  className="mini-story"
                  onClick={() => gotoStory(s)}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="mini-cover"
                    style={{ background: s.cover, height: 66, borderRadius: 6 }}
                  />
                  <div className="hero-left">
                    <div className="mini-title">{s.title}</div>
                    <div className="mini-author">{s.penName}</div>
                    <div className="mini-rating">
                      ★ {s.rating} · {s.reads} đọc
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 13, color: "#9e8e82" }}>
                Không có truyện tương tự
              </div>
            )}
          </div>
          <div className="sidebar-card">
            <div className="sidebar-title">Thông tin tác phẩm</div>
            {[
              ["Thể loại", story.genre],
              [
                "Trạng thái",
                story.status === "done" ? "Hoàn thành" : "Đang cập nhật",
              ],
              ["Số chương", story.chapters + " chương"],
              ["Đánh giá", `${avgRating}/5 (${reviews.length} reviews)`],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 10,
                  paddingBottom: 8,
                  borderBottom: "1px solid #f5ede4",
                }}
              >
                <span style={{ color: "#9e8e82" }}>{k}</span>
                <span style={{ fontWeight: 600, color: "#1c1512" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoryDetailPage;
