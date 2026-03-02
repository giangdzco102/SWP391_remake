import React, { useState, useEffect } from 'react';
import { Ico } from '../Icons';
import { StarRating, AvatarComp, Toast } from '../ui';
export function RankingsPage({ stories, onStory }) {
    const [tab, setTab] = useState("reads");
    const sorted = [...stories].sort((a, b) => {
        if (tab === "reads")
            return (b.views || 0) - (a.views || 0);
        if (tab === "rating")
            return b.rating - a.rating;
        return (b.favorites || 0) - (a.favorites || 0);
    });
    return (<div className="section fade-in">
      <div className="page-title">🏆 Bảng Xếp Hạng</div>
      <div className="page-sub">Top truyện được yêu thích nhất trên nền tảng</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[["reads", "👁 Lượt đọc"], ["rating", "⭐ Đánh giá"], ["favorites", "❤ Yêu thích"]].map(([k, l]) => (<button key={k} className={`cursor-pointer whitespace-nowrap rounded-full border-none bg-[#f5ede4] px-4 py-2 text-[13.5px] font-semibold text-[#8b6a54] transition-all duration-150 hover:bg-[#e8dccf] ${tab === k ? " bg-[#c23d3f] text-white hover:bg-[#a83032]" : ""}`} onClick={() => setTab(k)}>{l}</button>))}
      </div>
      <div className="coin-history">
        {sorted.map((s, i) => (<div key={s.id} className="rank-row" onClick={() => onStory(s)}>
            <span className={`w-9 shrink-0 text-center font-[\'Playfair_Display\',serif] text-[20px] font-black ${i === 0 ? "rank-1" : i === 1 ? "rank-2" : i === 2 ? "rank-3" : "rank-num-other"}`}>{i + 1}</span>
            <div className="rank-cover" style={{ background: s.cover, width: 48, height: 66, borderRadius: 7, flexShrink: 0 }}/>
            <div className="hero-left">
              <div className="rank-title">{s.title}</div>
              <div className="ch-meta">{s.penName} · {s.genre}</div>
              <div className="rank-stats">
                <span>⭐ {s.rating}</span>
                <span><Ico.Eye /> {s.reads}</span>
                <span>📖 {s.chapters} chương</span>
                {tab === "favorites" && <span>❤ {(s.favorites || 0).toLocaleString()}</span>}
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: 13, color: "#9e8e82" }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: "#c23d3f" }}>{tab === "reads" ? s.reads : tab === "rating" ? s.rating.toFixed(1) : (s.favorites || 0).toLocaleString()}</div>
              <div>{tab === "reads" ? "lượt đọc" : tab === "rating" ? "/ 5 sao" : "yêu thích"}</div>
            </div>
          </div>))}
      </div>
    </div>);
}