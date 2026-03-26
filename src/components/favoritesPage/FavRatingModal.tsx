import React from "react";

const SCORE_LABELS = ["", "Tệ", "Không hay", "Tạm được", "Hay", "Xuất sắc"];

export interface RatingModalState {
  storyId: number;
  title: string;
  score: number;
}

interface FavRatingModalProps {
  modal: RatingModalState;
  hover: number;
  submitting: boolean;
  hasExistingRating: boolean;
  onClose: () => void;
  onHover: (star: number) => void;
  onSelectScore: (score: number) => void;
  onSubmit: () => void;
}

export function FavRatingModal({
  modal,
  hover,
  submitting,
  hasExistingRating,
  onClose,
  onHover,
  onSelectScore,
  onSubmit,
}: FavRatingModalProps) {
  const activeScore = hover || modal.score;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: "28px 28px 24px",
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 8px 40px rgba(0,0,0,.18)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 800, color: "#1c1512" }}>
            {hasExistingRating ? "✏️ Sửa đánh giá" : "⭐ Đánh giá truyện"}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: "#9e8e82",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Story title */}
        <div
          style={{
            fontSize: 13,
            color: "#6b5a4e",
            marginBottom: 18,
            fontStyle: "italic",
            fontWeight: 600,
          }}
        >
          {modal.title}
        </div>

        {/* Stars */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            marginBottom: 8,
          }}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => onHover(star)}
              onMouseLeave={() => onHover(0)}
              onClick={() => onSelectScore(star)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 2,
                fontSize: 38,
                lineHeight: 1,
                color: activeScore >= star ? "#f59e0b" : "#d1c9be",
                transition: "color .1s, transform .1s",
                transform: activeScore >= star ? "scale(1.18)" : "scale(1)",
              }}
            >
              ★
            </button>
          ))}
        </div>

        {/* Score label */}
        <div
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "#f59e0b",
            fontWeight: 700,
            marginBottom: 18,
            minHeight: 20,
          }}
        >
          {modal.score > 0 ? SCORE_LABELS[modal.score] : ""}
        </div>

        {/* Submit button */}
        <button
          disabled={modal.score === 0 || submitting}
          onClick={onSubmit}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 10,
            border: "none",
            background:
              modal.score === 0 || submitting ? "#e5ddd5" : "#c23d3f",
            color: modal.score === 0 || submitting ? "#9e8e82" : "#fff",
            fontSize: 14,
            fontWeight: 700,
            cursor:
              modal.score === 0 || submitting ? "not-allowed" : "pointer",
            transition: "background .15s",
          }}
        >
          {submitting ? "Đang gửi..." : "Gửi đánh giá"}
        </button>
      </div>
    </div>
  );
}
