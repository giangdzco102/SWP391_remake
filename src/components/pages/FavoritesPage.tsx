import React, { useState, useEffect } from 'react';
import { Ico } from '../Icons';
import { StarRating, AvatarComp, Toast } from '../ui';
export function FavoritesPage({ stories, onStory, toggleLike, readProgress, user, openModal }) {
    if (!user)
        return (<div className="section fade-in">
      <div className="empty-state">❤ Chưa đăng nhập<p>Đăng nhập để xem danh sách yêu thích của bạn.</p>
        <button className="btn-nav btn-primary" style={{ margin: "16px auto", display: "flex", alignItems: "center" }} onClick={() => openModal("auth")}>Đăng nhập ngay</button>
      </div>
    </div>);
    return (<div className="section fade-in">
      <div className="page-title">❤ Yêu Thích</div>
      <div className="page-sub">{stories.length} tác phẩm đang theo dõi</div>
      {stories.length === 0 ? (<div className="empty-state">Chưa có tác phẩm yêu thích<p>Nhấn ❤ trên tác phẩm để thêm vào đây.</p></div>) : (<div className="fav-grid">
          {stories.map((s) => (<div key={s.id} className="fav-card" onClick={() => onStory(s)}>
              <div className="fav-cover" style={{ background: s.cover }}/>
              <div className="hero-left">
                <div className="fav-title">{s.title}</div>
                <div className="fav-author">bởi {s.penName} · {s.genre}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#9e8e82" }}>
                  <StarRating rating={s.rating} size={12}/>
                  <span>{s.rating.toFixed(1)}</span>
                  <span>·</span>
                  <span>{s.chapters} chương</span>
                </div>
                <div className="fav-progress">
                  <div className="fav-progress-fill" style={{ width: `${readProgress[s.id] || 0}%` }}/>
                </div>
                <div style={{ fontSize: 11, color: "#b0a096", marginTop: 3 }}>{readProgress[s.id] || 0}% đã đọc</div>
              </div>
              <button className="fav-remove" onClick={e => { e.stopPropagation(); toggleLike(s.id); }}>
                <Ico.Trash />
              </button>
            </div>))}
        </div>)}
    </div>);
}