import React from "react";
import { useStoryDetailTheme } from "@/hooks/useStoryDetailTheme";
import { useGotoStory } from "@/hooks/useGotoStory";

interface StoryItem {
  id: number;
  title: string;
  penName: string;
  cover: string;
  rating: number;
  reads: string | number;
  status: string;
}

interface StoryDetail {
  id: number;
  author: string;
  status: string;
  reads: string | number;
  favorites: number;
  chapters: number;
}

interface Props {
  story: StoryDetail;
  relatedStories: StoryItem[];
  chaptersCount: number;
  followCount: number | null;
  avgRating: string;
  displayRatingCount: number;
}

export function StorySidebar({
  story,
  relatedStories,
  chaptersCount,
  followCount,
  avgRating,
  displayRatingCount,
}: Props) {
  const { dk } = useStoryDetailTheme();
  const gotoStory = useGotoStory();

  return (
    <div className="detail-sidebar">
      {/* Related stories */}
      <div className="sidebar-card" style={{ padding: "16px 14px" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="sidebar-title" style={{ marginBottom: 0 }}>
            Cùng thể loại
          </div>
        </div>

        {relatedStories.length > 0 ? (
          <div className="flex flex-col" style={{ gap: 8 }}>
            {relatedStories.map((s) => (
              <div
                key={s.id}
                onClick={() => gotoStory(s as any)}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: 10,
                  borderRadius: 12,
                  cursor: "pointer",
                  border: `1.5px solid ${dk.borderLight}`,
                  background: dk.surfaceMid,
                  transition: "all .15s",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "#c23d3f";
                  el.style.background = dk.surface;
                  el.style.boxShadow = "0 4px 16px rgba(194,61,63,.1)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = dk.borderLight;
                  el.style.background = dk.surfaceMid;
                  el.style.boxShadow = "none";
                }}
              >
                <div
                  className="shrink-0 rounded-lg overflow-hidden"
                  style={{
                    width: 52,
                    height: 72,
                    background: s.cover,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
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
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: dk.text,
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
                        color: dk.textFaint,
                        fontStyle: "italic",
                      }}
                    >
                      {s.penName}
                    </div>
                  </div>
                  <div
                    className="flex items-center flex-wrap"
                    style={{ gap: "3px 8px", marginTop: 5 }}
                  >
                    <span
                      style={{ fontSize: 11, fontWeight: 700, color: "#c69526" }}
                    >
                      ★ {s.rating}
                    </span>
                    <span style={{ fontSize: 10, color: dk.sep2 }}>·</span>
                    <span style={{ fontSize: 11, color: dk.textFaint }}>
                      {s.reads} đọc
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-6"
            style={{
              color: dk.textMuted,
              fontSize: 13,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>📚</div>
            Chưa có truyện cùng thể loại
          </div>
        )}
      </div>

      {/* Story info */}
      <div className="sidebar-card">
        <div className="sidebar-title">Thông tin tác phẩm</div>
        {(
          [
            ["Tác giả", story.author],
            [
              "Trạng thái",
              story.status === "done" ? "Hoàn thành" : "Đã xuất bản",
            ],
            ["Số chương", `${chaptersCount} chương`],
            ["Lượt đọc", story.reads],
            [
              "Yêu thích",
              `${(followCount ?? story.favorites ?? 0).toLocaleString("vi-VN")} người`,
            ],
            [
              "Đánh giá",
              `${avgRating}/5 (${displayRatingCount} đánh giá)`,
            ],
          ] as [string, string][]
        ).map(([k, v], i, arr) => (
          <div
            key={k}
            className="flex justify-between text-sm"
            style={{
              padding: "9px 0",
              borderBottom:
                i < arr.length - 1 ? `1px solid ${dk.borderTable}` : "none",
            }}
          >
            <span style={{ color: dk.textFaint }}>{k}</span>
            <span
              style={{
                fontWeight: 600,
                color: dk.text,
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
  );
}
