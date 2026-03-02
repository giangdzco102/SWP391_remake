import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Ico } from '../Icons';
import { GENRES } from '../../utils/mockData';
export function SubmitStoryModal({ user, onClose, onSuccess }) {
    const [form, setForm] = useState({ title: "", genre: "", excerpt: "", content: "" });
    const [err, setErr] = useState("");
    const submit = () => {
        if (!form.title.trim() || !form.genre || !form.content.trim()) {
            setErr("Vui lòng điền đủ tiêu đề, thể loại và nội dung.");
            return;
        }
        if (form.content.trim().length < 200) {
            setErr("Nội dung quá ngắn — ít nhất 200 ký tự.");
            return;
        }
        onSuccess(form);
    };
    return (<div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">📝 Đăng tác phẩm mới</div>
          <button className="modal-close" onClick={onClose}><Ico.X /></button>
        </div>
        <div className="modal-body">
          <div className="info-box blue" style={{ marginBottom: 16 }}>Tác phẩm sẽ được <strong>Reviewer kiểm duyệt</strong> trong vòng 48 giờ trước khi đăng tải.</div>
          <div className="modal-sections">
            <div className="form-group"><label className="form-label-bold">Tiêu đề <span style={{ color: "#c23d3f" }}>*</span></label><input className="form-input" placeholder="Tên truyện của bạn…" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}/></div>
            <div className="form-group"><label className="form-label-bold">Thể loại <span style={{ color: "#c23d3f" }}>*</span></label>
              <select className="form-input form-select" value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}><option value="">-- Chọn --</option>{GENRES.map(g => <option key={g} value={g}>{g}</option>)}</select>
            </div>
            <div className="form-group"><label className="form-label-bold">Tóm tắt</label><textarea className="form-textarea" rows={2} placeholder="Mô tả ngắn về nội dung truyện…" value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}/></div>
            <div className="form-group">
              <label className="form-label-bold">Nội dung chương đầu <span style={{ color: "#c23d3f" }}>*</span></label>
              <textarea className="form-textarea" rows={8} placeholder="Viết nội dung chương đầu… (ít nhất 200 ký tự)" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}/>
              <div className="char-count">{form.content.length} ký tự {form.content.length < 200 && <span style={{ color: "#c23d3f" }}>(cần ít nhất 200)</span>}</div>
            </div>
            {err && <div style={{ color: "#c23d3f", fontSize: 13, background: "#fde8e8", padding: "8px 12px", borderRadius: 7 }}>{err}</div>}
            <button className="btn-full btn-red-full" onClick={submit}>📤 Nộp tác phẩm để xét duyệt</button>
          </div>
        </div>
      </div>
    </div>);
}