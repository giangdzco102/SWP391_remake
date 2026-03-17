"use client";
import React, { useEffect, useState } from "react";
import { Ico } from "@/components/Icons";
import { StarRating } from "@/components/ui";
import { useStoryStore } from "@/stores/storyStore";
import { useNavStore } from "@/stores/navStore";
import { useAuthStore } from "@/stores";
import { useRouter, useSearchParams } from "next/navigation";
import { useGotoStory } from "@/hooks/useGotoStory";
import useChapterService from "@/api/useChapter.service";
import useReportService from "@/api/useReport.service";
import { useToast } from "@/hooks/use-toast";

export function StoryDetailPage() {
  const {
    allStories: stories,
    likedStories,
    toggleLike,
    unlockedChapters,
    unlockChapter,
    reviews,
    chapters,
    setChapters,
  } = useStoryStore();

  const { selectedStory: story, setSelectedStory, setSelectedChapterId } = useNavStore();
  const gotoStory = useGotoStory();
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getChaptersByStory } = useChapterService();

  // Khi reload trang, store bị xoá → đọc ?id từ URL rồi tìm lại trong danh sách
  useEffect(() => {
    if (!story) {
      const idParam = searchParams.get("id");
      if (idParam) {
        const found = stories.find((s) => String(s.id) === idParam);
        if (found) setSelectedStory(found);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!story?.id) return;
    getChaptersByStory(story.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((res: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const list: any[] = res?.data ?? res ?? [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = list.map((ch: any) => {
          const wordCount = ch.content ? ch.content.trim().split(/\s+/).length : 0;
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
    if (!user) { router.push("?login"); return; }
    cb();
  };

  const liked = likedStories.includes(story.id);

  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  const relatedStories = stories
    .filter((s) => s.id !== story.id && s.genre === story.genre)
    .slice(0, 3);

  return (
    <div className="fade-in">
      <div className="detail-wrap">
        {/* ── MAIN ─────────────────────────────────────────────────────────── */}
        <div className="mobile-user-info">
          <button className="back-btn" onClick={() => router.push("/homePage")}>
            <Ico.Back /> Quay lại
          </button>

          {/* ── Hero: cover + meta ───────────────────────────────────────── */}
          <div
            className="detail-cover-row"
            style={{ alignItems: "flex-start" }}
          >
            <div
              className="detail-cover shrink-0"
              style={{ width: 140, height: 200 }}
            >
              <div
                className="w-full h-full"
                style={{ background: story.cover }}
              />
            </div>

            <div className="hero-left flex flex-col" style={{ gap: 10 }}>
              {/* Status badge */}
              <div>
                <span
                  className={`story-status-badge ${story.status === "done" ? "badge-done" : "badge-ongoing"}`}
                  style={{ position: "static" }}
                >
                  {story.status === "done" ? "✓ Hoàn thành" : "Đang ra"}
                </span>
              </div>

              {/* Title */}
              <h1 className="detail-title" style={{ marginBottom: 0 }}>
                {story.title}
              </h1>

              {/* Tác giả */}
              <div
                className="flex items-center flex-wrap"
                style={{ gap: "4px 6px", fontSize: 13, color: "#9e8e82" }}
              >
                <span>Tác giả:</span>
                <span
                  style={{ color: "#c23d3f", fontWeight: 600, fontSize: 14 }}
                >
                  {story.author}
                </span>
                <span style={{ color: "#ddd" }}>·</span>
                <span style={{ color: "#b0a096", fontStyle: "italic" }}>
                  {story.penName}
                </span>
              </div>

              {/* Genre + Tags */}
              <div
                className="flex flex-wrap items-center"
                style={{ gap: "6px" }}
              >
                <span
                  className="tag"
                  style={{
                    background: "#fde8e8",
                    color: "#c23d3f",
                    border: "1.5px solid #f0b4b5",
                    fontWeight: 600,
                  }}
                >
                  {story.genre}
                </span>
                {story.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div
                className="flex items-stretch rounded-xl overflow-hidden"
                style={{
                  border: "1.5px solid #ece6dc",
                  background: "#fff",
                  alignSelf: "flex-start",
                }}
              >
                {[
                  { num: story.reads, label: "Lượt đọc" },
                  { num: chapters.length, label: "Chương" },
                  { num: reviews.length, label: "Đánh giá" },
                  {
                    num: (story.favorites || 0).toLocaleString(),
                    label: "Yêu thích",
                  },
                ].map(({ num, label }, i) => (
                  <div
                    key={label}
                    className="stat"
                    style={{
                      padding: "10px 18px",
                      borderRight: i < 3 ? "1.5px solid #ece6dc" : "none",
                      minWidth: 72,
                    }}
                  >
                    <div className="stat-num">{num}</div>
                    <div className="stat-label">{label}</div>
                  </div>
                ))}
              </div>

              {/* Rating */}
              <div className="detail-rating" style={{ marginBottom: 0 }}>
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

              {/* CTA */}
              <div className="detail-actions" style={{ marginTop: 4 }}>
                <button
                  className="btn-hero btn-hero-primary"
                  style={{ fontSize: 14 }}
                  onClick={() =>
                    requireAuth(() => {
                      const first = chapters[0];
                      if (first?.id) {
                        setSelectedChapterId(first.id);
                        router.push("/readerPage");
                      }
                    })
                  }
                >
                  <Ico.Book /> Đọc từ đầu
                </button>

                <button
                  className={`btn-hero ${liked ? "btn-hero-primary" : "btn-hero-outline"}`}
                  style={
                    liked
                      ? {
                          background: "#fde8e8",
                          color: "#c23d3f",
                          borderColor: "#c23d3f",
                          fontSize: 14,
                        }
                      : {
                          borderColor: "#c23d3f",
                          color: "#c23d3f",
                          fontSize: 14,
                        }
                  }
                  onClick={() => requireAuth(() => toggleLike(story.id))}
                >
                  <Ico.Heart f={liked} />
                  {liked ? "Đã lưu" : "Yêu thích"}
                </button>
                <button
                  className="btn-hero btn-hero-outline"
                  style={{
                    fontSize: 13,
                    color: "#9ca3af",
                    borderColor: "#e8e0d6",
                  }}
                  onClick={() => requireAuth(() => setStoryReportOpen(true))}
                >
                  🚩 Báo cáo
                </button>
              </div>
            </div>
          </div>

          {/* Inline Story Report */}
          {storyReportOpen && (
            <div
              style={{
                background: "#fdfaf7",
                border: "1.5px solid #e8e0d6",
                borderRadius: 14,
                padding: "16px 18px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#1c1512",
                  marginBottom: 8,
                }}
              >
                🚩 Báo cáo truyện: <em>{story.title}</em>
              </div>
              <textarea
                value={storyReportReason}
                onChange={(e) => setStoryReportReason(e.target.value)}
                placeholder="Mô tả lý do báo cáo..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: "1.5px solid #e8e0d6",
                  fontSize: 13,
                  color: "#3d2f28",
                  resize: "none",
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 10,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => {
                    setStoryReportOpen(false);
                    setStoryReportReason("");
                  }}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 9,
                    border: "1.5px solid #e8e0d6",
                    background: "#fff",
                    color: "#6b5a4e",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleReportStory}
                  disabled={!storyReportReason.trim() || storyReporting}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 9,
                    border: "none",
                    background:
                      !storyReportReason.trim() || storyReporting
                        ? "#f3f4f6"
                        : "#c23d3f",
                    color:
                      !storyReportReason.trim() || storyReporting
                        ? "#9ca3af"
                        : "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor:
                      !storyReportReason.trim() || storyReporting
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {storyReporting ? "Đang gửi..." : "Gửi báo cáo"}
                </button>
              </div>
            </div>
          )}


          <blockquote className="detail-desc">{story.description}</blockquote>

          {/* ── Danh sách chương ─────────────────────────────────────────── */}
          <div className="sec-head" style={{ marginBottom: 12 }}>
            <div className="sec-title" style={{ fontSize: 18 }}>
              Danh sách chương
              <span
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 14,
                  fontWeight: 400,
                  color: "#9e8e82",
                  marginLeft: 6,
                }}
              >
                ({chapters.length})
              </span>
            </div>
          </div>

          <div className="chapters-list">
            {chapters.map((ch, i) => {
              const isLocked = ch.locked && !unlockedChapters?.includes(ch.id);
              return (
                <div
                  key={ch.id}
                  className={`chapter-item${isLocked ? " chapter-locked" : ""}`}
                  onClick={() =>
                    requireAuth(() => {
                      if (!isLocked && ch.id) {
                        setSelectedChapterId(ch.id);
                        router.push("/readerPage");
                      }
                    })
                  }
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
                  <span
                    className="shrink-0 text-center font-bold"
                    style={{
                      width: 28,
                      fontSize: 12,
                      color: "#c9b89a",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    {i + 1}
                  </span>

                  <div className="hero-left" style={{ flex: 1 }}>
                    <div
                      className="ch-title flex items-center"
                      style={{ gap: 6 }}
                    >
                      {isLocked && (
                        <span
                          className="shrink-0 font-bold"
                          style={{
                            fontSize: 10,
                            background: "#fef3c7",
                            color: "#b45309",
                            border: "1px solid #fcd34d",
                            padding: "1px 7px",
                            borderRadius: 10,
                          }}
                        >
                          🔒 VIP
                        </span>
                      )}
                      {ch.title}
                    </div>
                    <div className="ch-meta flex items-center gap-1">
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
                      className="flex items-center shrink-0 whitespace-nowrap font-bold"
                      style={{
                        gap: 5,
                        background: "linear-gradient(135deg,#c69526,#9a7020)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "7px 14px",
                        fontSize: 12,
                        cursor: "pointer",
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
        </div>

        {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
        <div className="detail-sidebar">
          {/* Related stories */}
          <div className="sidebar-card" style={{ padding: "16px 14px" }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="sidebar-title" style={{ marginBottom: 0 }}>
                Cùng thể loại
              </div>
              <span
                style={{
                  padding: "2px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  background: "#fde8e8",
                  color: "#c23d3f",
                  border: "1px solid #f0b4b5",
                }}
              >
                {story.genre}
              </span>
            </div>

            {relatedStories.length > 0 ? (
              <div className="flex flex-col" style={{ gap: 8 }}>
                {relatedStories.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => gotoStory(s)}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: 10,
                      borderRadius: 12,
                      cursor: "pointer",
                      border: "1.5px solid #f0ebe3",
                      background: "#fdfaf7",
                      transition: "all .15s",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.borderColor = "#c23d3f";
                      el.style.background = "#fff";
                      el.style.boxShadow = "0 4px 16px rgba(194,61,63,.1)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.borderColor = "#f0ebe3";
                      el.style.background = "#fdfaf7";
                      el.style.boxShadow = "none";
                    }}
                  >
                    {/* Cover */}
                    <div
                      className="shrink-0 rounded-lg overflow-hidden"
                      style={{
                        width: 52,
                        height: 72,
                        background: s.cover,
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          textAlign: "center",
                          fontSize: 8,
                          fontWeight: 700,
                          color: "#fff",
                          letterSpacing: "0.3px",
                          padding: "2px 0",
                          background:
                            s.status === "done"
                              ? "rgba(28,101,58,.85)"
                              : "rgba(194,61,63,.85)",
                        }}
                      >
                        {s.status === "done" ? "HOÀN THÀNH" : "ĐANG RA"}
                      </div>
                    </div>
                    {/* Info */}
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: "#1c1512",
                            lineHeight: 1.35,
                            marginBottom: 3,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {s.title}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#9e8e82",
                            fontStyle: "italic",
                          }}
                        >
                          {s.penName}
                        </div>
                      </div>

                      {/* Stats */}
                      <div
                        className="flex items-center flex-wrap"
                        style={{ gap: "3px 8px", marginTop: 5 }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#c69526",
                          }}
                        >
                          ★ {s.rating}
                        </span>
                        <span style={{ fontSize: 10, color: "#e0d8d0" }}>
                          ·
                        </span>
                        <span style={{ fontSize: 11, color: "#9e8e82" }}>
                          {s.reads} đọc
                        </span>
                        <span style={{ fontSize: 10, color: "#e0d8d0" }}>
                          ·
                        </span>
                        <span style={{ fontSize: 11, color: "#9e8e82" }}>
                          {chapters.length} ch.
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center py-6"
                style={{ color: "#b0a096", fontSize: 13, textAlign: "center" }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>📚</div>
                Chưa có truyện cùng thể loại
              </div>
            )}
          </div>

          <div className="sidebar-card">
            <div className="sidebar-title">Thông tin tác phẩm</div>
            {(
              [
                ["Tác giả", story.author],
                [
                  "Trạng thái",
                  story.status === "done" ? "Hoàn thành" : "Đang cập nhật",
                ],
                [
                  "Số chương",
                  `${chapters.length || story.chapters || 0} chương`,
                ],
                ["Lượt đọc", story.reads],
                ["Đánh giá", `${avgRating}/5 (${reviews.length} đánh giá)`],
              ] as [string, string][]
            ).map(([k, v], i, arr) => (
              <div
                key={k}
                className="flex justify-between text-sm"
                style={{
                  padding: "9px 0",
                  borderBottom:
                    i < arr.length - 1 ? "1px solid #f5ede4" : "none",
                }}
              >
                <span style={{ color: "#9e8e82" }}>{k}</span>
                <span
                  style={{
                    fontWeight: 600,
                    color: "#1c1512",
                    marginLeft: 8,
                    textAlign: "right",
                  }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoryDetailPage;