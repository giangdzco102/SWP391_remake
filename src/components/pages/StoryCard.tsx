import React, { useState, useEffect } from 'react';
import { Ico } from '../Icons';
import { StarRating, AvatarComp, Toast } from '../ui';
export function StoryCard({ story, onStory, liked, onLike }) {
    return (<div className="story-card" onClick={onStory}>
      <div className="story-cover">
        <div className="story-cover-img" style={{ background: story.cover }}/>
        <span className={`absolute left-[9px] top-[9px] rounded-[5px] px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.4px] ${story.status === "done" ? "badge-done" : story.status === "ongoing" ? "badge-ongoing" : "badge-pending"}`}>{story.status === "done" ? "✓ Hoàn thành" : story.status === "ongoing" ? "Đang cập nhật" : "Chờ duyệt"}</span>
        <button style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,.35)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: liked ? "#c23d3f" : "white" }} onClick={e => { e.stopPropagation(); onLike(); }}>
          <Ico.Heart f={liked}/>
        </button>
      </div>
      <div className="story-info">
        <div className="story-title">{story.title}</div>
        <div className="story-author">bởi <span>{story.penName}</span></div>
        <div className="story-meta">
          <div className="story-stars"><Ico.Star f s={12}/>{story.rating > 0 ? story.rating.toFixed(1) : "Mới"}</div>
          <div className="story-reads"><Ico.Eye />{story.reads}</div>
        </div>
        <div className="story-genre-tag">{story.genre}</div>
      </div>
    </div>);
}