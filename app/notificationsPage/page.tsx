"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { useNotificationStore } from "@/stores/notificationStore";
import useNotificationService from "@/api/useNotification.service";
import type { NotificationResponse } from "@/api/useNotification.service";

// Utils / constants
import { getNotificationLink } from "@/utils/notificationsPage.constants";

// Components
import { NotificationItem } from "@/components/notificationsPage/NotificationItem";

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const { notifications, setNotifications, markAllRead, markOneRead, removeNotification } =
    useNotificationStore();
  const {
    getNotifications,
    markAllRead: apiMarkAll,
    markOneRead: apiMarkOne,
    deleteNotification,
  } = useNotificationService();

  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.push("/"); return; }
    setLoading(true);
    getNotifications()
      .then((res: any) => {
        const list =
          res?.data?.content ?? res?.content ?? res?.data ??
          (Array.isArray(res) ? res : null) ?? [];
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

  const visible =
    filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filterBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 16px",
    borderRadius: 20,
    border: "1.5px solid #e8e0d6",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    background: active ? "#c23d3f" : "#fff",
    color: active ? "#fff" : "#3d2c1e",
    transition: "all 0.15s",
  });

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#2d1810", margin: 0 }}>
          🔔 Thông Báo
          {unreadCount > 0 && (
            <span
              style={{
                background: "#c23d3f",
                color: "#fff",
                borderRadius: 12,
                fontSize: 12,
                padding: "2px 8px",
                marginLeft: 10,
                fontWeight: 700,
              }}
            >
              {unreadCount}
            </span>
          )}
        </h1>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setFilter("all")} style={filterBtnStyle(filter === "all")}>
            Tất cả
          </button>
          <button
            onClick={() => setFilter("unread")}
            style={filterBtnStyle(filter === "unread")}
          >
            Chưa đọc{unreadCount > 0 ? ` (${unreadCount})` : ""}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                border: "1.5px solid #e8e0d6",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: "#fff",
                color: "#c23d3f",
              }}
            >
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "#9e8e82", fontSize: 14 }}>
          Đang tải thông báo...
        </div>
      ) : visible.length === 0 ? (
        <div style={{ textAlign: "center", padding: 64 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔕</div>
          <div style={{ fontSize: 16, color: "#9e8e82", fontWeight: 600 }}>
            {filter === "unread" ? "Không có thông báo chưa đọc" : "Chưa có thông báo"}
          </div>
          <div style={{ fontSize: 13, color: "#bfad9e", marginTop: 6 }}>
            Các hoạt động sẽ hiển thị ở đây.
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1.5px solid #f0ebe3",
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          {visible.map((n, idx) => (
            <NotificationItem
              key={n.id}
              n={n}
              isLast={idx === visible.length - 1}
              onClick={handleMarkOne}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
