import { StoryCard } from './StoryCard';
import React, { useState, useEffect } from 'react';
import { Ico } from '../Icons';
import { StarRating, AvatarComp, Toast } from '../ui';
export function SearchResultsPage({ query, results, onStory }) {
    return (<div className="section fade-in">
      <div className="page-title">🔍 Kết quả tìm kiếm</div>
      <div className="page-sub">"{query}" — {results.length} kết quả</div>
      {results.length === 0 ? <div className="empty-state">Không tìm thấy kết quả<p>Thử tìm với từ khóa khác.</p></div> : (<div className="story-grid">
          {results.map(s => <StoryCard key={s.id} story={s} onStory={() => onStory(s)} liked={false} onLike={() => { }}/>)}
        </div>)}
    </div>);
}