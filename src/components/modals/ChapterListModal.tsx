import React, { useEffect, useRef } from "react";

export interface ChapterListModalProps {
  chapters: {
    id: number;
    title: string;
    chapterOrder?: number;
    coinPrice?: number;
    isPurchased?: boolean;
  }[];
  currentChapterId: number | null;
  storyTitle: string;
  onSelect: (id: number) => void;
  onClose: () => void;
}

export function ChapterListModal({
  chapters,
  currentChapterId,
  storyTitle,
  onSelect,
  onClose,
}: ChapterListModalProps) {
  const currentRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Scroll the current chapter into view after modal opens
    setTimeout(
      () =>
        currentRef.current?.scrollIntoView({
          block: "center",
          behavior: "smooth",
        }),
      80
    );
  }, []);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          width: "100%",
          maxWidth: 480,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 16px 48px rgba(0,0,0,0.22)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px 14px",
            borderBottom: "1.5px solid #f0e8e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 16,
                fontWeight: 800,
                color: "#1c1512",
              }}
            >
              📋 Danh sách chương
            </div>
            <div style={{ fontSize: 12, color: "#b0a096", marginTop: 2 }}>
              {storyTitle} · {chapters.length} chương
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1.5px solid #e8e0d6",
              background: "#fdfaf7",
              cursor: "pointer",
              fontSize: 16,
              color: "#6b5a4e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Chapter list */}
        <div style={{ overflowY: "auto", padding: "10px 12px" }}>
          {chapters.map((ch, idx) => {
            const isCurrent = ch.id === currentChapterId;
            const isLocked = (ch.coinPrice ?? 0) > 0 && !ch.isPurchased;
            return (
              <button
                key={ch.id}
                ref={isCurrent ? currentRef : undefined}
                onClick={() => {
                  onSelect(ch.id);
                  onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: isCurrent
                    ? "1.5px solid #e8a0a1"
                    : "1.5px solid transparent",
                  background: isCurrent ? "#fde8e8" : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  marginBottom: 4,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#faf6f3";
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                }}
              >
                {/* Chapter number badge */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: isCurrent ? "#c23d3f" : "#f0ebe6",
                    color: isCurrent ? "#fff" : "#9e8e82",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {ch.chapterOrder ?? idx + 1}
                </div>

                {/* Title */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? "#c23d3f" : "#3d2f28",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {ch.title}
                  </div>
                </div>

                {/* Badges */}
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    flexShrink: 0,
                    alignItems: "center",
                  }}
                >
                  {isCurrent && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        background: "#c23d3f",
                        color: "#fff",
                        borderRadius: 20,
                        padding: "2px 7px",
                      }}
                    >
                      Đang đọc
                    </span>
                  )}
                  {isLocked && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        background: "#fffbeb",
                        color: "#92400e",
                        borderRadius: 20,
                        padding: "2px 7px",
                        border: "1px solid #fcd34d",
                      }}
                    >
                      🪙 {ch.coinPrice}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
