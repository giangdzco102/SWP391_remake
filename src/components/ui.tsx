import React, { memo, useMemo } from 'react';
import { Ico } from './Icons';

export function StarRating({ rating, size = 16 }: any) {
    return <div className="stars-row">{[1, 2, 3, 4, 5].map(n => <Ico.Star key={n} f={n <= Math.round(rating)} s={size}/>)}</div>;
}
export function Toast({ toast }: any) {
    if (!toast)
        return null;
    const icon = toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : toast.type === "warning" ? "⚠" : "ℹ";
    return <div className={`toast toast-${toast.type}`}>{icon} {toast.msg}</div>;
}
export function AvatarComp({ user, size = 36, onClick }: any) {
    const cls = user.role === "reviewer" ? "avatar-gold" : user.role === "author" ? "avatar-blue" : user.role === "editor" ? "avatar-green" : "avatar-red";
    if (user.avatarUrl) {
        return (<div className={`avatar ${cls}`} style={{ width: size, height: size, padding: 0, overflow: "hidden", border: "2.5px solid transparent" }} onClick={onClick}>
        <img src={user.avatarUrl} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block" }}/>
      </div>);
    }
    return <div className={`avatar ${cls}`} style={{ width: size, height: size, fontSize: size * 0.36 }} onClick={onClick}>{user.name.slice(0, 2).toUpperCase()}</div>;
}
const NOTIF_BG: any = { review: "#fde8e8", approve: "#d4edda", reject: "#fde8e8", task: "#dbeafe", coin: "#fffbeb", system: "#f0f0f0" };
const NOTIF_COLOR: any = { review: "#c23d3f", approve: "#1d6b3a", reject: "#9e2d2f", task: "#1a6fa3", coin: "#9a7020", system: "#6b5a4e" };
const NOTIF_ICON: any = { review: "⭐", approve: "✓", reject: "✕", task: "✏", coin: "🪙", system: "📢" };
export const NotificationPanel = memo(function NotificationPanel({ notifications, unreadCount, onMarkAll, onMarkOne, onViewAll }: any) {
    const sorted = useMemo(() => [...notifications].sort((a, b) => b.id - a.id), [notifications]);
    return (<div className="notif-panel">
      <div className="notif-panel-header">
        <span>
          Thông báo
          {unreadCount > 0 && <span style={{ background: "#c23d3f", color: "#fff", borderRadius: 10, fontSize: 11, padding: "1px 7px", marginLeft: 6, fontWeight: 700 }}>{unreadCount}</span>}
        </span>
        {unreadCount > 0 && (<button style={{ fontSize: 12, color: "#c23d3f", background: "transparent", border: "none", cursor: "pointer", fontWeight: 600 }} onClick={onMarkAll}>
            Đánh dấu đã đọc
          </button>)}
      </div>
      {sorted.length === 0
            ? <div style={{ padding: 24, textAlign: "center", fontSize: 13, color: "#9e8e82" }}>Không có thông báo</div>
            : sorted.map(n => (<div key={n.id} className={`notif-item${n.read ? "" : " unread"}`} onClick={() => onMarkOne(n.id, n.storyId)}>
            <div className="notif-icon" style={{ background: NOTIF_BG[n.type] || "#f0f0f0" }}>{NOTIF_ICON[n.type] || "📢"}</div>
            <div className="mobile-user-info">
              <div className="notif-title">
                {n.title}
                {!n.read && <span style={{ display: "inline-block", width: 6, height: 6, background: "#c23d3f", borderRadius: "50%", marginLeft: 6, verticalAlign: "middle" }}/>}
              </div>
              <div className="notif-text">{n.body}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <span className="notif-time">{n.time}</span>
                <span className="notif-type-chip" style={{ background: NOTIF_BG[n.type] || "#f0f0f0", color: NOTIF_COLOR[n.type] || "#6b5a4e" }}>{n.type}</span>
              </div>
            </div>
          </div>))}
      <div className="notif-panel-footer">
        <button className="notif-view-all" onClick={onViewAll}>Xem tất cả thông báo →</button>
      </div>
    </div>);
});
