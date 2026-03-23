/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo, useMemo } from "react";
import { Ico } from "./Icons";
import { timeStartToNow } from "@/utils/time";

export function StarRating({ rating, size = 16 }: any) {
  return (
    <div className="stars-row">
      {[1, 2, 3, 4, 5].map((n) => (
        <Ico.Star key={n} f={n <= Math.round(rating)} s={size} />
      ))}
    </div>
  );
}
export function Toast({ toast }: any) {
  if (!toast) return null;
  const icon =
    toast.type === "success"
      ? "✓"
      : toast.type === "error"
        ? "✕"
        : toast.type === "warning"
          ? "⚠"
          : "ℹ";
  return (
    <div className={`toast toast-${toast.type}`}>
      {icon} {toast.msg}
    </div>
  );
}
export function AvatarComp({ user, size = 36, onClick }: any) {
  if (!user) return null;

  const roles: string[] = user.roles || [];

  const cls = roles.includes("REVIEWER")
    ? "avatar-gold"
    : roles.includes("AUTHOR")
      ? "avatar-blue"
      : roles.includes("EDITOR")
        ? "avatar-green"
        : "avatar-red";

  if (user.avatarUrl) {
    return (
      <div
        className={`avatar ${cls}`}
        style={{
          width: size,
          height: size,
          padding: 0,
          overflow: "hidden",
          border: "2.5px solid transparent",
        }}
        onClick={onClick}
      >
        <img
          src={user.avatarUrl}
          alt={user.fullName || "avatar"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
            display: "block",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`avatar ${cls}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
      }}
      onClick={onClick}
    >
      {(user.fullName || "U").slice(0, 2).toUpperCase()}
    </div>
  );
}
const NOTIF_BG: any = {
  NEW_CHAPTER:      "#dbeafe",
  STORY_APPROVED:   "#d4edda",
  STORY_REJECTED:   "#fde8e8",
  CHAPTER_APPROVED: "#d4edda",
  CHAPTER_REJECTED: "#fde8e8",
  GIFT_RECEIVED:    "#fffbeb",
  SYSTEM:           "#f0f0f0",
};
const NOTIF_COLOR: any = {
  NEW_CHAPTER:      "#1a6fa3",
  STORY_APPROVED:   "#1d6b3a",
  STORY_REJECTED:   "#9e2d2f",
  CHAPTER_APPROVED: "#1d6b3a",
  CHAPTER_REJECTED: "#9e2d2f",
  GIFT_RECEIVED:    "#9a7020",
  SYSTEM:           "#6b5a4e",
};
const NOTIF_ICON: any = {
  NEW_CHAPTER:      "📖",
  STORY_APPROVED:   "✓",
  STORY_REJECTED:   "✕",
  CHAPTER_APPROVED: "✓",
  CHAPTER_REJECTED: "✕",
  GIFT_RECEIVED:    "🎁",
  SYSTEM:           "📢",
};
export const NotificationPanel = memo(function NotificationPanel({
  notifications,
  unreadCount,
  onMarkAll,
  onMarkOne,
  onViewAll,
}: any) {
  const sorted = useMemo(
    () => (Array.isArray(notifications) ? [...notifications] : []).sort((a, b) => b.id - a.id),
    [notifications],
  );
  return (
    <div className="notif-panel">
      <div className="notif-panel-header">
        <span>
          Thông báo
          {unreadCount > 0 && (
            <span
              style={{
                background: "#c23d3f",
                color: "#fff",
                borderRadius: 10,
                fontSize: 11,
                padding: "1px 7px",
                marginLeft: 6,
                fontWeight: 700,
              }}
            >
              {unreadCount}
            </span>
          )}
        </span>
        {unreadCount > 0 && (
          <button
            style={{
              fontSize: 12,
              color: "#c23d3f",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
            onClick={onMarkAll}
          >
            Đánh dấu đã đọc
          </button>
        )}
      </div>
      {sorted.length === 0 ? (
        <div
          style={{
            padding: 24,
            textAlign: "center",
            fontSize: 13,
            color: "#9e8e82",
          }}
        >
          Không có thông báo
        </div>
      ) : (
        sorted.map((n) => (
          <div
            key={n.id}
            className={`notif-item${n.isRead ? "" : " unread"}`}
            onClick={() => onMarkOne(n.id)}
          >
            <div
              className="notif-icon"
              style={{ background: NOTIF_BG[n.type] || "#f0f0f0" }}
            >
              {NOTIF_ICON[n.type] || "📢"}
            </div>
            <div className="mobile-user-info">
              <div className="notif-title">
                {n.title}
                {!n.isRead && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      background: "#c23d3f",
                      borderRadius: "50%",
                      marginLeft: 6,
                      verticalAlign: "middle",
                    }}
                  />
                )}
              </div>
              <div className="notif-text">{n.message}</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <span className="notif-time">{n.createdAt ? timeStartToNow(n.createdAt) : ""}</span>
                <span
                  className="notif-type-chip"
                  style={{
                    background: NOTIF_BG[n.type] || "#f0f0f0",
                    color: NOTIF_COLOR[n.type] || "#6b5a4e",
                  }}
                >
                  {n.type}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
      <div className="notif-panel-footer">
        <button className="notif-view-all" onClick={onViewAll}>
          Xem tất cả thông báo →
        </button>
      </div>
    </div>
  );
});
