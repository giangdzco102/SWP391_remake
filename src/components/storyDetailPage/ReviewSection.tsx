import React from "react";
import { useAuthStore } from "@/stores";

interface ReviewSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reviews: any[];
  ratingSubmitted: boolean;
  myScore: number;
  myReview: string;
  onOpenRatingModal: () => void;
}

export function ReviewSection({ reviews, ratingSubmitted, myScore, myReview, onOpenRatingModal }: ReviewSectionProps) {
  const { user } = useAuthStore();

  return (
    <div style={{ marginTop: 28 }}>
      <div className="sec-head" style={{ marginBottom: 16 }}>
        <div className="sec-title" style={{ fontSize: 18 }}>
          ⭐ Đánh giá
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 400, color: "#9e8e82", marginLeft: 6 }}>
            ({reviews.length})
          </span>
        </div>
      </div>

      {ratingSubmitted && (
        <div style={{ background: "#fdfaf7", border: "1.5px solid #f0b4b5", borderRadius: 14, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "linear-gradient(135deg,#c23d3f,#9e2d2f)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 900, color: "#fff", flexShrink: 0,
          }}>
            {(user?.fullName ?? user?.email ?? "?")[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1c1512" }}>Đánh giá của bạn</span>
              <div style={{ display: "flex", gap: 2 }}>
                {[1,2,3,4,5].map((s) => (
                  <span key={s} style={{ fontSize: 14, color: myScore >= s ? "#f59e0b" : "#e5ddd5" }}>★</span>
                ))}
              </div>
              <span style={{ fontSize: 12, color: "#c23d3f", fontWeight: 600 }}>{myScore}/5</span>
            </div>
            {myReview && <div style={{ fontSize: 13, color: "#6b5a4e", lineHeight: 1.5 }}>{myReview}</div>}
          </div>
          <button
            onClick={onOpenRatingModal}
            style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 8, border: "1.5px solid #e8e0d6", background: "#fff", color: "#6b5a4e", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            Sửa
          </button>
        </div>
      )}

      {reviews.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reviews.map((r, i) => (
            <div key={r.id ?? i} style={{ background: "#fff", border: "1.5px solid #ece6dc", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "linear-gradient(135deg,#c23d3f,#9e2d2f)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 900, color: "#fff", flexShrink: 0,
                }}>
                  {(r.userName ?? "?")[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1c1512" }}>{r.userName ?? "Người dùng"}</div>
                  <div style={{ fontSize: 11, color: "#b0a096" }}>
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString("vi-VN") : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} style={{ fontSize: 14, color: (r.rating ?? 0) >= s ? "#f59e0b" : "#e5ddd5" }}>★</span>
                  ))}
                </div>
              </div>
              {r.review && (
                <div style={{ fontSize: 13, color: "#3d2f28", lineHeight: 1.6, marginLeft: 46 }}>{r.review}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "24px 0", color: "#b0a096", fontSize: 13 }}>
          Chưa có đánh giá nào. Hãy là người đầu tiên! ⭐
        </div>
      )}
    </div>
  );
}
