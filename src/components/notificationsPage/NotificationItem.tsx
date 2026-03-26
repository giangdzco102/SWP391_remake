import React from "react";
import type { NotificationResponse } from "@/api/useNotification.service";
import { timeStartToNow } from "@/utils/time";
import { NOTIF_BG, NOTIF_ICON, NOTIF_LABEL, getNotificationLink } from "@/utils/notificationsPage.constants";

interface NotificationItemProps {
  n: NotificationResponse;
  isLast: boolean;
  onClick: (n: NotificationResponse) => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
}

export function NotificationItem({ n, isLast, onClick, onDelete }: NotificationItemProps) {
  const link = getNotificationLink(n);
  const bgColor = n.isRead ? "#fff" : "#fffaf7";
  const hoverColor = n.isRead ? "#fdfaf7" : "#fff5ef";

  return (
    <div
      onClick={() => onClick(n)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        padding: "14px 18px",
        borderBottom: isLast ? "none" : "1px solid #f5ede4",
        background: bgColor,
        cursor: link ? "pointer" : "default",
        transition: "background 0.12s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (link) (e.currentTarget as HTMLDivElement).style.background = hoverColor;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = bgColor;
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          flexShrink: 0,
          background: NOTIF_BG[n.type] ?? "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        {NOTIF_ICON[n.type] ?? "📢"}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 3,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 14, color: "#2d1810" }}>
            {n.title}
          </span>
          {!n.isRead && (
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#c23d3f",
                flexShrink: 0,
                display: "inline-block",
              }}
            />
          )}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#6b5a4e",
            lineHeight: 1.5,
            marginBottom: 6,
          }}
        >
          {n.message}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#9e8e82" }}>
            {n.createdAt ? timeStartToNow(n.createdAt) : ""}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 10,
              background: NOTIF_BG[n.type] ?? "#f0f0f0",
              color: "#6b5a4e",
            }}
          >
            {NOTIF_LABEL[n.type] ?? n.type}
          </span>
          {link && (
            <span
              style={{
                fontSize: 11,
                color: "#c23d3f",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              Xem chi tiết →
            </span>
          )}
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => onDelete(n.id, e)}
        style={{
          flexShrink: 0,
          width: 28,
          height: 28,
          borderRadius: 8,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: "#bfad9e",
          fontSize: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.12s",
        }}
        title="Xóa thông báo"
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "#fde8e8")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "transparent")
        }
      >
        ✕
      </button>
    </div>
  );
}
