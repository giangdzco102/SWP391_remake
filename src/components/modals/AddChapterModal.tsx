import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Ico } from '../Icons';
import { GENRES } from '../../utils/mockData';
export function AddChapterModal({ storyId, onClose, onSuccess }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    return (<div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#1c1512]/55 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[520px] max-h-[92vh] overflow-y-auto rounded-[16px] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.25)] animate-[popIn_0.25s_ease] modal-wide" onClick={e => e.stopPropagation()}>
        <div className="w-full max-w-[520px] max-h-[92vh] overflow-y-auto rounded-[16px] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.25)] animate-[popIn_0.25s_ease]-header"><div className="w-full max-w-[520px] max-h-[92vh] overflow-y-auto rounded-[16px] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.25)] animate-[popIn_0.25s_ease]-title">📝 Thêm chương mới</div><button className="w-full max-w-[520px] max-h-[92vh] overflow-y-auto rounded-[16px] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.25)] animate-[popIn_0.25s_ease]-close" onClick={onClose}><Ico.X /></button></div>
        <div className="w-full max-w-[520px] max-h-[92vh] overflow-y-auto rounded-[16px] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.25)] animate-[popIn_0.25s_ease]-body">
          <div className="w-full max-w-[520px] max-h-[92vh] overflow-y-auto rounded-[16px] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.25)] animate-[popIn_0.25s_ease]-sections">
            <div className="form-group"><label className="form-label-bold">Tiêu đề chương <span style={{ color: "#c23d3f" }}>*</span></label><input className="form-input" placeholder="vd. Chương 6: Buổi Chiều Cuối Cùng" value={title} onChange={e => setTitle(e.target.value)}/></div>
            <div className="form-group">
              <label className="form-label-bold">Nội dung chương <span style={{ color: "#c23d3f" }}>*</span></label>
              <textarea className="form-textarea" rows={12} placeholder="Viết nội dung chương ở đây…" value={content} style={{ minHeight: 200 }} onChange={e => setContent(e.target.value)}/>
              <div className="char-count">{content.split(/\s+/).filter(Boolean).length} từ · {content.length} ký tự</div>
            </div>
            <button className="w-full rounded-[9px] border-none bg-[#c23d3f] text-white p-3 text-center text-[15px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#a83032]" onClick={() => { if (title.trim() && content.trim())
        onSuccess({ title, content }); }} disabled={!title.trim() || !content.trim()} style={{ opacity: (!title.trim() || !content.trim()) ? 0.6 : 1 }}>📤 Đăng chương</button>
          </div>
        </div>
      </div>
    </div>);
}