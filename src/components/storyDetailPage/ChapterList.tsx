import React from "react";
import { useRouter } from "next/navigation";
import { Ico } from "@/components/Icons";
import { useStoryDetailTheme } from "@/hooks/useStoryDetailTheme";

interface ChapterItem {
  id: number;
  title: string;
  chapterOrder: number;
  words: number;
  readTime: string;
  publishedAt?: string;
  locked: boolean;
  price: number;
  isPurchased: boolean;
  status?: string;
}

interface Props {
  chapters: ChapterItem[];
  unlockedChapters?: number[];
  onRequireAuth: () => void;
  onConfirmPurchase: (ch: { id: number; title: string; price: number }) => void;
  onSelectChapter: (id: number) => void;
}

export function ChapterList({
  chapters,
  unlockedChapters,
  onRequireAuth,
  onConfirmPurchase,
  onSelectChapter,
}: Props) {
  const { dk } = useStoryDetailTheme();

  return (
    <>
      <div className="sec-head" style={{ marginBottom: 12 }}>
        <div className="sec-title" style={{ fontSize: 18 }}>
          Danh sách chương
          <span
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 14,
              fontWeight: 400,
              color: dk.textFaint,
              marginLeft: 6,
            }}
          >
            ({chapters.length})
          </span>
        </div>
      </div>

      <div className="chapters-list">
        {chapters
          .filter((ch) => {
            // Ẩn chương HIDDEN mà người dùng chưa mua — người đã mua vẫn xem được
            if (ch.status === "HIDDEN" && !ch.isPurchased) return false;
            return true;
          })
          .map((ch, i) => {
          const isHiddenPurchased = ch.status === "HIDDEN" && ch.isPurchased;
          const isLocked = ch.locked && !unlockedChapters?.includes(ch.id) && !isHiddenPurchased;
          return (
            <div
              key={ch.id}
              className={`chapter-item${isLocked ? " chapter-locked" : ""}`}
              onClick={() => {
                if (!isLocked && ch.id) {
                  onSelectChapter(ch.id);
                } else if (isLocked) {
                  onRequireAuth();
                }
              }}
              style={
                isLocked
                  ? {
                      cursor: "pointer",
                      background: dk.lockedItem,
                      borderColor: dk.lockedBdr,
                    }
                  : isHiddenPurchased
                  ? { cursor: "pointer", opacity: 0.75 }
                  : {}
              }
            >
              <span
                className="shrink-0 text-center font-bold"
                style={{
                  width: 28,
                  fontSize: 12,
                  color: dk.chNum,
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {i + 1}
              </span>

              <div className="hero-left" style={{ flex: 1 }}>
                <div className="ch-title flex items-center" style={{ gap: 6 }}>
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
                  {isHiddenPurchased && (
                    <span
                      className="shrink-0 font-bold"
                      style={{
                        fontSize: 10,
                        background: "#f3f4f6",
                        color: "#6b7280",
                        border: "1px solid #d1d5db",
                        padding: "1px 7px",
                        borderRadius: 10,
                      }}
                    >
                      🛑 Đã bị ẩn · Đã mua
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
                    onConfirmPurchase({
                      id: ch.id,
                      title: ch.title,
                      price: ch.price || 10,
                    });
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
    </>
  );
}
