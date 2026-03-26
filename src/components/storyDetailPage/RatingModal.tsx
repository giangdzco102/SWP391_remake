import React, { useState } from "react";
import { createPortal } from "react-dom";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyTitle: string;
  ratingSubmitted: boolean;
  initialScore: number;
  initialReview: string;
  onSubmit: (score: number, review: string) => Promise<void>;
  onDelete?: () => void;
}

export function RatingModal({ isOpen, onClose, storyTitle, ratingSubmitted, initialScore, initialReview, onSubmit, onDelete }: RatingModalProps) {
  const [ratingHover, setRatingHover] = useState(0);
  const [myScore, setMyScore] = useState(initialScore);
  const [myReview, setMyReview] = useState(initialReview);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 18, padding: "28px 28px 24px",
          width: "100%", maxWidth: 420,
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#1c1512" }}>
            {ratingSubmitted ? "✏️ Cập nhật đánh giá" : "⭐ Đánh giá truyện"}
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#9e8e82", lineHeight: 1 }}
            aria-label="Đóng"
          >✕</button>
        </div>

        <div style={{ fontSize: 13, color: "#6b5a4e", marginBottom: 16, fontStyle: "italic" }}>{storyTitle}</div>

        <div style={{ display: "flex", gap: 8, marginBottom: 8, justifyContent: "center" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setRatingHover(star)}
              onMouseLeave={() => setRatingHover(0)}
              onClick={() => setMyScore(star)}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: 2,
                fontSize: 36, lineHeight: 1,
                color: (ratingHover || myScore) >= star ? "#f59e0b" : "#d1c9be",
                transition: "color 0.1s, transform 0.1s",
                transform: (ratingHover || myScore) >= star ? "scale(1.18)" : "scale(1)",
              }}
            >★</button>
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: 13, color: "#f59e0b", fontWeight: 700, marginBottom: 16, minHeight: 20 }}>
          {myScore > 0 ? ["","Tệ","Không hay","Tạm được","Hay","Xuất sắc"][myScore] : ""}
        </div>

        <textarea
          value={myReview}
          onChange={(e) => setMyReview(e.target.value)}
          placeholder="Nhận xét của bạn (không bắt buộc)..."
          rows={3}
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 10,
            border: "1.5px solid #e8e0d6", fontSize: 13, color: "#3d2f28",
            resize: "none", fontFamily: "inherit", outline: "none",
            boxSizing: "border-box", background: "#fdfaf7",
          }}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          {ratingSubmitted && onDelete && (
            <button
              onClick={() => {
                onDelete();
                onClose();
              }}
              style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid #e8e0d6", background: "#fff", color: "#9e8e82", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Xóa đánh giá
            </button>
          )}
          <button
            disabled={myScore === 0 || submitting}
            onClick={async () => {
              if (myScore === 0) return;
              setSubmitting(true);
              try {
                await onSubmit(myScore, myReview.trim());
                onClose();
              } finally {
                setSubmitting(false);
              }
            }}
            style={{
              flex: 2, padding: "10px 0", borderRadius: 10, border: "none",
              background: myScore === 0 || submitting ? "#e5ddd5" : "#c23d3f",
              color: myScore === 0 || submitting ? "#9e8e82" : "#fff",
              fontSize: 14, fontWeight: 700,
              cursor: myScore === 0 || submitting ? "not-allowed" : "pointer",
              transition: "background 0.15s",
            }}
          >
            {submitting ? "Đang gửi..." : ratingSubmitted ? "Cập nhật" : "Gửi đánh giá"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
