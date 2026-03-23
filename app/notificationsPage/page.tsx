"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { useNotificationStore } from "@/stores/notificationStore";
import useNotificationService from "@/api/useNotification.service";
import type { NotificationResponse } from "@/api/useNotification.service";
import { timeStartToNow } from "@/utils/time";

const NOTIF_BG: Record<string, string> = {
  NEW_CHAPTER:      "#dbeafe",
  STORY_APPROVED:   "#d4edda",
  STORY_REJECTED:   "#fde8e8",
  CHAPTER_APPROVED: "#d4edda",
  CHAPTER_REJECTED: "#fde8e8",
  GIFT_RECEIVED:    "#fffbeb",
  SYSTEM:           "#f0f0f0",
};
const NOTIF_ICON: Record<string, string> = {
  NEW_CHAPTER:      "📖",
  STORY_APPROVED:   "✓",
  STORY_REJECTED:   "✕",
  CHAPTER_APPROVED: "✓",
  CHAPTER_REJECTED: "✕",
  GIFT_RECEIVED:    "🎁",
  SYSTEM:           "📢",
};
const NOTIF_LABEL: Record<string, string> = {
  NEW_CHAPTER:      "Chương mới",
  STORY_APPROVED:   "Truyện duyệt",
  STORY_REJECTED:   "Bị từ chối",
  CHAPTER_APPROVED: "Chương duyệt",
  CHAPTER_REJECTED: "Chương bị từ chối",
  GIFT_RECEIVED:    "Nhận quà",
  SYSTEM:           "Hệ thống",
};

/** Trả về đường dẫn trang liên quan của thông báo, hoặc null nếu không có */
function getNotificationLink(n: NotificationResponse): string | null {
  const { type, refType, refId } = n;
  if (!refId) return null;
  switch (type) {
    case "NEW_CHAPTER":
      if (refType === "STORY") return `/storyDetailPage?id=${refId}`;
      // refType=CHAPTER: không có storyId, chuyển sang homepage truyện nếu sau này BE bổ sung
      return null;
    case "STORY_APPROVED":
    case "STORY_REJECTED":
      return "/myStoriesPage";
    case "CHAPTER_APPROVED":
    case "CHAPTER_REJECTED":
      return "/myStoriesPage";
    case "GIFT_RECEIVED":
      return "/myStoriesPage";
    default:
      return null;
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { notifications, setNotifications, markAllRead, markOneRead, removeNotification } = useNotificationStore();
  const { getNotifications, markAllRead: apiMarkAll, markOneRead: apiMarkOne, deleteNotification } = useNotificationService();

  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (!user) { router.push("/"); return; }
    setLoading(true);
    getNotifications()
      .then((res: any) => {
        const list = res?.data?.content ?? res?.content ?? res?.data ?? (Array.isArray(res) ? res : null) ?? [];
        setNotifications(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleMarkAll = async () => {
    markAllRead();
    try { await apiMarkAll(); } catch { /* best-effort */ }
  };

  const handleMarkOne = async (n: NotificationResponse) => {
    if (!n.isRead) {
      markOneRead(n.id);
      try { await apiMarkOne(n.id); } catch { /* best-effort */ }
    }
    const link = getNotificationLink(n);
    if (link) router.push(link);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    removeNotification(id);
    try { await deleteNotification(id); } catch { /* best-effort */ }
  };

  const visible = filter === "unread"
    ? notifications.filter((n) => !n.isRead)
    : notifications;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#2d1810", margin: 0 }}>
            🔔 Thông Báo
            {unreadCount > 0 && (
              <span style={{ background: "#c23d3f", color: "#fff", borderRadius: 12, fontSize: 12, padding: "2px 8px", marginLeft: 10, fontWeight: 700 }}>
                {unreadCount}
              </span>
            )}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setFilter("all")}
            style={{ padding: "6px 16px", borderRadius: 20, border: "1.5px solid #e8e0d6", fontSize: 13, fontWeight: 600, cursor: "pointer", background: filter === "all" ? "#c23d3f" : "#fff", color: filter === "all" ? "#fff" : "#3d2c1e", transition: "all 0.15s" }}
          >Tất cả</button>
          <button
            onClick={() => setFilter("unread")}
            style={{ padding: "6px 16px", borderRadius: 20, border: "1.5px solid #e8e0d6", fontSize: 13, fontWeight: 600, cursor: "pointer", background: filter === "unread" ? "#c23d3f" : "#fff", color: filter === "unread" ? "#fff" : "#3d2c1e", transition: "all 0.15s" }}
          >Chưa đọc{unreadCount > 0 ? ` (${unreadCount})` : ""}</button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAll} style={{ padding: "6px 16px", borderRadius: 20, border: "1.5px solid #e8e0d6", fontSize: 13, fontWeight: 600, cursor: "pointer", background: "#fff", color: "#c23d3f" }}>
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "#9e8e82", fontSize: 14 }}>Đang tải thông báo...</div>
      ) : visible.length === 0 ? (
        <div style={{ textAlign: "center", padding: 64 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔕</div>
          <div style={{ fontSize: 16, color: "#9e8e82", fontWeight: 600 }}>
            {filter === "unread" ? "Không có thông báo chưa đọc" : "Chưa có thông báo"}
          </div>
          <div style={{ fontSize: 13, color: "#bfad9e", marginTop: 6 }}>Các hoạt động sẽ hiển thị ở đây.</div>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #f0ebe3", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          {visible.map((n, idx) => {
            const link = getNotificationLink(n);
            return (
            <div
              key={n.id}
              onClick={() => handleMarkOne(n)}
              style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                padding: "14px 18px",
                borderBottom: idx < visible.length - 1 ? "1px solid #f5ede4" : "none",
                background: n.isRead ? "#fff" : "#fffaf7",
                cursor: link ? "pointer" : "default",
                transition: "background 0.12s",
                position: "relative",
              }}
              onMouseEnter={(e) => { if (link) (e.currentTarget as HTMLDivElement).style.background = n.isRead ? "#fdfaf7" : "#fff5ef"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = n.isRead ? "#fff" : "#fffaf7"; }}
            >
              {/* Icon */}
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: NOTIF_BG[n.type] ?? "#f0f0f0",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}>
                {NOTIF_ICON[n.type] ?? "📢"}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#2d1810" }}>{n.title}</span>
                  {!n.isRead && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#c23d3f", flexShrink: 0, display: "inline-block" }} />}
                </div>
                <div style={{ fontSize: 13, color: "#6b5a4e", lineHeight: 1.5, marginBottom: 6 }}>{n.message}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "#9e8e82" }}>{n.createdAt ? timeStartToNow(n.createdAt) : ""}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 10,
                    background: NOTIF_BG[n.type] ?? "#f0f0f0", color: "#6b5a4e",
                  }}>
                    {NOTIF_LABEL[n.type] ?? n.type}
                  </span>
                  {link && (
                    <span style={{ fontSize: 11, color: "#c23d3f", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                      Xem chi tiết →
                    </span>
                  )}
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => handleDelete(n.id, e)}
                style={{
                  flexShrink: 0, width: 28, height: 28, borderRadius: 8,
                  border: "none", background: "transparent", cursor: "pointer",
                  color: "#bfad9e", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.12s",
                }}
                title="Xóa thông báo"
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fde8e8")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >✕</button>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
