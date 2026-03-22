import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Ico } from '../Icons';
export function RejectModal({ onClose, onConfirm, story }) {
    const [note, setNote] = useState("");
    const presets = ["Nội dung chưa đủ chất lượng", "Vi phạm quy định nội dung", "Cần bổ sung và chỉnh sửa thêm", "Cốt truyện thiếu logic", "Lỗi chính tả, ngữ pháp quá nhiều"];
    return (<div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><div className="modal-title" style={{ color: "#9e2d2f" }}>✕ Từ chối tác phẩm</div><button className="modal-close" onClick={onClose}><Ico.X /></button></div>
        <div className="modal-body">
          {story && <div style={{ background: "#fde8e8", borderRadius: 9, padding: "12px 16px", marginBottom: 16, fontSize: 14, color: "#6b5a4e" }}>Từ chối: <strong>{story.title}</strong> bởi {story.penName}</div>}
          <div className="modal-sections">
            <div className="form-group">
              <label className="form-label-bold">Lý do từ chối (sẽ gửi cho tác giả)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
                {presets.map(p => <button key={p} onClick={() => setNote(p)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 16, border: "1.5px solid #e8e0d6", background: note === p ? "#fde8e8" : "#fff", color: note === p ? "#c23d3f" : "#6b5a4e", cursor: "pointer" }}>{p}</button>)}
              </div>
              <textarea className="form-textarea" rows={4} placeholder="Hoặc nhập lý do chi tiết…" value={note} onChange={e => setNote(e.target.value)}/>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-full btn-ghost" style={{ flex: 1 }} onClick={onClose}>Hủy</button>
              <button style={{ flex: 1, padding: 13, borderRadius: 9, fontSize: 15, fontWeight: 600, background: "#9e2d2f", color: "#fff", border: "none", cursor: "pointer" }} onClick={() => onConfirm(note || "Không đáp ứng tiêu chí nội dung.")}>✕ Xác nhận từ chối</button>
            </div>
          </div>
        </div>
      </div>
    </div>);
}