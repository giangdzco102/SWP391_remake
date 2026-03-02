import React, { useState, useEffect } from 'react';
import { Ico } from '../Icons';
import { StarRating, AvatarComp, Toast } from '../ui';
export function NotificationsPage({ notifications, setNotifications, stories, gotoStory }) {
    return (<div className="section fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><div className="page-title">🔔 Thông Báo</div></div>
        <button className="btn-nav btn-ghost" onClick={() => setNotifications((n) => n.map(x => ({ ...x, read: true })))}>Đánh dấu tất cả đã đọc</button>
      </div>
      {notifications.length === 0 ? <div className="empty-state">Không có thông báo<p>Các hoạt động sẽ hiển thị ở đây.</p></div> : (<div className="sidebar-card" style={{ padding: 0 }}>
          {notifications.map((n) => (<div key={n.id} className={`flex cursor-pointer gap-3 border-b border-[#f5ede4] p-[12px_16px] transition-colors duration-150 hover:bg-[#fdf7f0]${n.read ? "" : " unread"}`} style={{ borderRadius: 0 }} onClick={() => { setNotifications((ns) => ns.map(x => x.id === n.id ? { ...x, read: true } : x)); if (n.storyId) {
                const s = stories.find((x) => x.id === n.storyId);
                if (s)
                    gotoStory(s);
            } }}>
              <div className="notif-icon" style={{ background: { review: "#fde8e8", approve: "#d4edda", reject: "#fde8e8", task: "#dbeafe", coin: "#fffbeb", system: "#f0f0f0" }[n.type] || "#f0f0f0" }}>
                {{ review: "⭐", approve: "✓", reject: "✕", task: "✏", coin: "🪙", system: "📢" }[n.type]}
              </div>
              <div className="mobile-user-info">
                <div className="notif-title">{n.title}{!n.read && <span style={{ display: "inline-block", width: 6, height: 6, background: "#c23d3f", borderRadius: "50%", marginLeft: 6 }}/>}</div>
                <div className="notif-text">{n.body}</div>
                <div className="notif-time">{n.time}</div>
              </div>
            </div>))}
        </div>)}
    </div>);
}