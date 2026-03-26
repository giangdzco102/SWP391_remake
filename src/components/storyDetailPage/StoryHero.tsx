import React from "react";
import { useRouter } from "next/navigation";
import { Ico } from "@/components/Icons";
import { StarRating } from "@/components/ui";
import { useStoryDetailTheme } from "@/hooks/useStoryDetailTheme";

interface StoryData {
  id: number;
  title: string;
  author: string;
  authorId?: number | null;
  penName: string;
  cover: string;
  genre: string;
  tags?: string[];
  rating: number;
  reads: string | number;
  favorites: number;
  status: string;
}

interface Props {
  story: StoryData;
  chapters: { id: number; locked?: boolean }[];
  unlockedChapters?: number[];
  followed: boolean;
  followLoading: boolean;
  followCount: number | null;
  displayRating: number;
  displayRatingCount: number;
  ratingSubmitted: boolean;
  myScore: number;
  giftOpen: boolean;
  onToggleFollow: () => void;
  onOpenRatingModal: () => void;
  onToggleGift: () => void;
  onToggleReport: () => void;
  onReadFirst: () => void;
}

export function StoryHero({
  story,
  chapters,
  unlockedChapters,
  followed,
  followLoading,
  followCount,
  displayRating,
  displayRatingCount,
  ratingSubmitted,
  myScore,
  giftOpen,
  onToggleFollow,
  onOpenRatingModal,
  onToggleGift,
  onToggleReport,
  onReadFirst,
}: Props) {
  const { dk } = useStoryDetailTheme();
  const avgRating =
    displayRating > 0 ? Number(displayRating).toFixed(1) : "—";

  return (
    <div
      className="detail-cover-row"
      style={{ alignItems: "flex-start" }}
    >
      {/* Cover */}
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
          style={{ gap: "4px 6px", fontSize: 13, color: dk.textFaint }}
        >
          <span>Tác giả:</span>
          <span style={{ color: "#c23d3f", fontWeight: 600, fontSize: 14 }}>
            {story.author}
          </span>
          <span style={{ color: dk.sep }}>·</span>
          <span style={{ color: dk.textMuted, fontStyle: "italic" }}>
            {story.penName}
          </span>
        </div>

        {/* Genre + Tags */}
        <div className="flex flex-wrap items-center" style={{ gap: "6px" }}>
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
          {story.tags?.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div
          className="flex items-stretch rounded-xl overflow-hidden"
          style={{
            border: `1.5px solid ${dk.borderMid}`,
            background: dk.surface,
            alignSelf: "flex-start",
          }}
        >
          {[
            { num: story.reads, label: "Lượt đọc" },
            {
              num: chapters.length || 0,
              label: "Chương",
            },
            { num: displayRatingCount, label: "Đánh giá" },
            {
              num:
                followCount != null
                  ? followCount.toLocaleString("vi-VN")
                  : (story.favorites || 0).toLocaleString("vi-VN"),
              label: "Yêu thích",
            },
          ].map(({ num, label }, i) => (
            <div
              key={label}
              className="stat"
              style={{
                padding: "10px 18px",
                borderRight: i < 3 ? `1.5px solid ${dk.borderMid}` : "none",
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
          <span style={{ fontSize: 13, color: dk.textFaint }}>/ 5</span>
        </div>

        {/* CTA buttons */}
        <div
          className="detail-actions"
          style={{ marginTop: 4, flexWrap: "nowrap", gap: 6 }}
        >
          <button
            className="btn-hero btn-hero-primary"
            style={{ fontSize: 12, padding: "8px 14px", gap: 5 }}
            onClick={onReadFirst}
          >
            <Ico.Book /> Đọc từ đầu
          </button>

          <button
            className={`btn-hero ${followed ? "btn-hero-primary" : "btn-hero-outline"}`}
            style={
              followed
                ? {
                    background: "#fde8e8",
                    color: "#c23d3f",
                    borderColor: "#c23d3f",
                    fontSize: 12,
                    padding: "8px 14px",
                    gap: 5,
                    opacity: followLoading ? 0.6 : 1,
                  }
                : {
                    borderColor: "#c23d3f",
                    color: "#c23d3f",
                    fontSize: 12,
                    padding: "8px 14px",
                    gap: 5,
                    opacity: followLoading ? 0.6 : 1,
                  }
            }
            disabled={followLoading}
            onClick={onToggleFollow}
          >
            <Ico.Heart f={followed} />
            {followed ? "Đã yêu thích" : "Yêu thích"}
          </button>

          <button
            className="btn-hero btn-hero-outline"
            style={{
              fontSize: 12,
              padding: "8px 14px",
              color: ratingSubmitted ? "#c23d3f" : dk.textSub2,
              borderColor: ratingSubmitted ? "#c23d3f" : dk.border,
            }}
            onClick={onOpenRatingModal}
          >
            ⭐ {ratingSubmitted ? `${myScore}/5` : "Đánh giá"}
          </button>

          <button
            className="btn-hero btn-hero-outline"
            style={{
              fontSize: 12,
              padding: "8px 14px",
              color: dk.textFaint,
              borderColor: dk.border,
            }}
            onClick={onToggleReport}
          >
            🚩 Báo cáo
          </button>

          <button
            className="btn-hero btn-hero-outline"
            style={{
              fontSize: 12,
              padding: "8px 14px",
              color: "#b08430",
              borderColor: "#f0daa8",
              background: giftOpen ? dk.giftBg : undefined,
            }}
            onClick={onToggleGift}
          >
            🎁 Tặng quà
          </button>
        </div>
      </div>
    </div>
  );
}
