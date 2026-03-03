/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from "react";
import { Ico } from "../Icons";
import { StarRating, AvatarComp, Toast } from "../ui";
export function ReviewerDashboard({
  user,
  pending,
  approved,
  rejected,
  dashTab,
  setDashTab,
  reviewNotes,
  setReviewNotes,
  onApprove,
  onReject,
}) {
  const [preview, setPreview] = useState(null);
  const total = pending.length + approved.length + rejected.length;
  return (
    <div className="reviewer-dash fade-in">
      <div className="dash-header">
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div className="dash-title">🛡 Bảng Kiểm Duyệt</div>
            <div className="dash-sub">
              Xin chào, {user.name} — mỗi tác phẩm duyệt bạn nhận coin thưởng
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            <div
              className="role-chip chip-reviewer"
              style={{ fontSize: 12, padding: "5px 14px" }}
            >
              <Ico.Shield />
              Reviewer
            </div>
            <div className="coin-badge">🪙 {user.coins} coin</div>
          </div>
        </div>
        <div className="dash-stats" style={{ marginTop: 20 }}>
          {[
            ["Chờ duyệt", pending.length],
            [`Đã duyệt`, approved.length],
            [`Từ chối`, rejected.length],
            ["Tổng", total],
          ].map(([l, v]) => (
            <div key={l} className="dash-stat">
              <div className="dash-stat-num">{v}</div>
              <div className="dash-stat-label">{l}</div>
            </div>
          ))}
          <div className="dash-stat">
            <div className="dash-stat-num" style={{ color: "#fcd34d" }}>
              {user.coins}
            </div>
            <div className="dash-stat-label">Coin kiếm được</div>
          </div>
        </div>
      </div>

      <div className="dash-tabs">
        {[
          { id: "pending", label: `⏳ Chờ duyệt (${pending.length})` },
          { id: "approved", label: `✓ Đã duyệt (${approved.length})` },
          { id: "rejected", label: `✕ Từ chối (${rejected.length})` },
          { id: "guide", label: "📋 Tiêu chí" },
        ].map((t) => (
          <button
            key={t.id}
            className={`cursor-pointer whitespace-nowrap rounded-[7px] border-none bg-transparent p-[9px] text-center text-[13px] font-semibold text-[#6b5a4e] transition-all duration-150 flex-1 ${dashTab === t.id ? " bg-[#c23d3f] text-white" : ""}`}
            onClick={() => setDashTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {dashTab === "pending" &&
        (pending.length === 0 ? (
          <div className="empty-state">
            🎉 Không còn tác phẩm chờ duyệt<p>Hãy quay lại sau!</p>
          </div>
        ) : (
          pending.map((item) => (
            <div key={item.id} className="pending-card fade-in">
              {preview?.id === item.id ? (
                <div style={{ padding: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: 18,
                        fontWeight: 700,
                      }}
                    >
                      {item.title}
                    </div>
                    <button
                      className="nav-ch-btn"
                      onClick={() => setPreview(null)}
                    >
                      ✕ Đóng
                    </button>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 15,
                      lineHeight: 1.9,
                      color: "#2a1e18",
                      padding: 16,
                      background: "#fdfaf6",
                      borderRadius: 9,
                      border: "1.5px solid #e8e0d6",
                    }}
                  >
                    {item.content.split("\n").map((p, i) => (
                      <p key={i} style={{ marginBottom: "1em" }}>
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pending-card-header">
                  <div
                    className="pending-cover"
                    style={{ background: item.cover }}
                  />
                  <div className="hero-left">
                    <div className="pending-title">
                      {item.title}
                      <span className="ml-2 inline-flex items-center gap-1 rounded-xl px-2.5 py-[3px] text-[11px] font-bold chip-wait">
                        Chờ duyệt
                      </span>
                    </div>
                    <div className="pending-author">
                      bởi <strong>{item.penName}</strong> ({item.author}) ·{" "}
                      {item.genre} · {item.chapters} chương · ~
                      {item.words.toLocaleString()} chữ · Gửi {item.submitted}
                    </div>
                    <div className="pending-excerpt">"{item.excerpt}"</div>
                  </div>
                </div>
              )}
              <div className="pending-actions">
                <button
                  className="btn-preview"
                  onClick={() =>
                    setPreview(preview?.id === item.id ? null : item)
                  }
                >
                  {preview?.id === item.id ? "Ẩn" : "👁 Xem nội dung"}
                </button>
                <input
                  className="review-note-input"
                  placeholder="Ghi chú cho tác giả…"
                  value={reviewNotes[item.id] || ""}
                  onChange={(e) =>
                    setReviewNotes((n) => ({ ...n, [item.id]: e.target.value }))
                  }
                />
                <button
                  className="btn-approve"
                  onClick={() => onApprove(item.id)}
                >
                  <Ico.Check />
                  Duyệt (+20🪙)
                </button>
                <button
                  className="btn-reject"
                  onClick={() => onReject(item.id)}
                >
                  <Ico.X />
                  Từ chối (+10🪙)
                </button>
              </div>
            </div>
          ))
        ))}

      {dashTab === "approved" &&
        (approved.length === 0 ? (
          <div className="empty-state">Chưa có tác phẩm được duyệt</div>
        ) : (
          approved.map((item) => (
            <div key={item.id} className="pending-card">
              <div className="pending-card-header">
                <div
                  className="pending-cover"
                  style={{ background: item.cover }}
                />
                <div className="hero-left">
                  <div className="pending-title">
                    {item.title}
                    <span className="ml-2 inline-flex items-center gap-1 rounded-xl px-2.5 py-[3px] text-[11px] font-bold chip-ok">
                      ✓ {item.approvedAt}
                    </span>
                  </div>
                  <div className="pending-author">
                    bởi <strong>{item.penName}</strong> · {item.genre}
                  </div>
                  <div className="pending-excerpt">"{item.excerpt}"</div>
                </div>
              </div>
            </div>
          ))
        ))}

      {dashTab === "rejected" &&
        (rejected.length === 0 ? (
          <div className="empty-state">Chưa có tác phẩm bị từ chối</div>
        ) : (
          rejected.map((item) => (
            <div key={item.id} className="pending-card">
              <div className="pending-card-header">
                <div
                  className="pending-cover"
                  style={{ background: item.cover }}
                />
                <div className="hero-left">
                  <div className="pending-title">
                    {item.title}
                    <span className="ml-2 inline-flex items-center gap-1 rounded-xl px-2.5 py-[3px] text-[11px] font-bold chip-rej">
                      ✕ {item.rejectedAt}
                    </span>
                  </div>
                  <div className="pending-author">
                    bởi <strong>{item.penName}</strong> · {item.genre}
                  </div>
                  {item.note && (
                    <div
                      style={{
                        background: "#fde8e8",
                        borderRadius: 7,
                        padding: "8px 12px",
                        fontSize: 13,
                        color: "#6b5a4e",
                        marginTop: 8,
                        fontStyle: "italic",
                      }}
                    >
                      💬 {item.note}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ))}

      {dashTab === "guide" && (
        <div className="sidebar-card" style={{ maxWidth: 720 }}>
          <div
            className="sidebar-title"
            style={{ fontSize: 18, marginBottom: 20 }}
          >
            📋 Tiêu chí kiểm duyệt
          </div>
          {[
            {
              icon: "✓",
              color: "#1d6b3a",
              title: "Nội dung được phép",
              items: [
                "Truyện có cốt truyện rõ ràng",
                "Ngôn từ phù hợp độc giả",
                "Không vi phạm bản quyền",
                "Nội dung tích cực, nhân văn",
                "Chính tả đạt chuẩn tối thiểu",
              ],
            },
            {
              icon: "✕",
              color: "#9e2d2f",
              title: "Nội dung cần từ chối",
              items: [
                "Nội dung khiêu dâm, bạo lực",
                "Vi phạm pháp luật Việt Nam",
                "Sao chép, đạo văn",
                "Kích động, phân biệt đối xử",
              ],
            },
          ].map((s) => (
            <div
              key={s.title}
              style={{
                marginBottom: 20,
                padding: 16,
                background: "#fdf9f6",
                borderRadius: 10,
                border: `1.5px solid ${s.color}30`,
              }}
            >
              <div
                style={{ fontWeight: 700, color: s.color, marginBottom: 10 }}
              >
                {s.icon} {s.title}
              </div>
              {s.items.map((it) => (
                <div
                  key={it}
                  style={{
                    fontSize: 13,
                    color: "#3d2e26",
                    marginBottom: 6,
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <span style={{ color: s.color }}>•</span>
                  {it}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
