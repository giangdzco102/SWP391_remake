import React from "react";
import { useAuthStore } from "@/stores";
import { useToast } from "@/hooks/use-toast";
import useBlockService from "@/api/useBlock.service";
import { formatVNDate } from "@/utils/time";
import { useStoryDetailTheme } from "@/hooks/useStoryDetailTheme";

interface ReviewSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reviews: any[];
  ratingSubmitted: boolean;
  myScore: number;
  myReview: string;
  storyAuthorId?: number | null;
  onOpenRatingModal: () => void;
}

export function ReviewSection({
  reviews,
  ratingSubmitted,
  myScore,
  myReview,
  storyAuthorId,
  onOpenRatingModal,
}: ReviewSectionProps) {
  const { user } = useAuthStore();
  const { blockUser } = useBlockService();
  const toast = useToast();
  const { dk } = useStoryDetailTheme();

  return (
    <div style={{ marginTop: 28 }}>
      <div className="sec-head" style={{ marginBottom: 16 }}>
        <div className="sec-title" style={{ fontSize: 18 }}>
          ⭐ Đánh giá
          <span
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 14,
              fontWeight: 400,
              color: dk.textFaint,
              marginLeft: 6,
            }}
          >
            ({reviews.length})
          </span>
        </div>
      </div>

      {ratingSubmitted && (
        <div
          style={{
            background: dk.ratingCard,
            border: `1.5px solid ${dk.ratingBdr}`,
            borderRadius: 14,
            padding: "14px 18px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#c23d3f,#9e2d2f)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 900,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {(user?.fullName ?? user?.email ?? "?")[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 2,
              }}
            >
              <span
                style={{ fontSize: 13, fontWeight: 700, color: dk.text }}
              >
                Đánh giá của bạn
              </span>
              <div style={{ display: "flex", gap: 2 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: 14,
                      color: myScore >= s ? "#f59e0b" : dk.starOff,
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span
                style={{ fontSize: 12, color: "#c23d3f", fontWeight: 600 }}
              >
                {myScore}/5
              </span>
            </div>
            {myReview && (
              <div
                style={{ fontSize: 13, color: dk.textSub2, lineHeight: 1.5 }}
              >
                {myReview}
              </div>
            )}
          </div>
          <button
            onClick={onOpenRatingModal}
            style={{
              flexShrink: 0,
              padding: "6px 14px",
              borderRadius: 8,
              border: `1.5px solid ${dk.border}`,
              background: dk.surface,
              color: dk.textSub2,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Sửa
          </button>
        </div>
      )}

      {reviews.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reviews.map((r, i) => (
            <div
              key={r.id ?? i}
              style={{
                background: dk.surface,
                border: `1.5px solid ${dk.borderMid}`,
                borderRadius: 12,
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#c23d3f,#9e2d2f)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 900,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {(r.userName ?? "?")[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ fontSize: 13, fontWeight: 700, color: dk.text }}
                  >
                    {r.userName ?? "Người dùng"}
                  </div>
                  <div style={{ fontSize: 11, color: dk.textMuted }}>
                    {r.createdAt ? formatVNDate(r.createdAt) : ""}
                  </div>
                </div>
                {user?.id === storyAuthorId && r.userId !== storyAuthorId && (
                  <button
                    title="Chặn người dùng này"
                    onClick={async () => {
                      try {
                        await blockUser(r.userId, "Chặn từ trang truyện");
                        toast.success(
                          `Đã chặn ${r.userName ?? "người dùng"}`,
                        );
                      } catch {
                        toast.error("Chặn người dùng thất bại");
                      }
                    }}
                    style={{
                      border: `1.5px solid ${dk.blockBdr}`,
                      background: dk.blockBtn,
                      color: "#c23d3f",
                      borderRadius: 8,
                      padding: "4px 10px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      flexShrink: 0,
                      transition: "background 0.15s",
                    }}
                  >
                    🚫 Chặn
                  </button>
                )}
                <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: 14,
                        color:
                          (r.rating ?? 0) >= s ? "#f59e0b" : dk.starOff,
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              {r.review && (
                <div
                  style={{
                    fontSize: 13,
                    color: dk.textSub,
                    lineHeight: 1.6,
                    marginLeft: 46,
                  }}
                >
                  {r.review}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "24px 0",
            color: dk.textMuted,
            fontSize: 13,
          }}
        >
          Chưa có đánh giá nào. Hãy là người đầu tiên! ⭐
        </div>
      )}
    </div>
  );
}
