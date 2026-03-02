import React, { useState } from "react";
import { Ico } from "../Icons";

export function AuthModal({ mode, setMode, onClose, onSuccess }) {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [err, setErr] = useState("");
    const isLogin = mode === "login";
    const handle = () => {
        if (!form.email || !form.password || (!isLogin && !form.name)) {
            setErr("Vui lòng điền đầy đủ.");
            return;
        }
        if (form.password.length < 6) {
            setErr("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }
        onSuccess({ name: isLogin ? "Độc Giả" : form.name, email: form.email, role: "reader", coins: 0, joinDate: new Date().toLocaleDateString("vi-VN"), stats: { reads: 0, stories: 0, reviews: 0, coins_earned: 0 } });
    };
    return (<div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{isLogin ? "Đăng nhập" : "Tạo tài khoản"}</div>
          <button className="modal-close" onClick={onClose}><Ico.X /></button>
        </div>
        <div className="modal-body">
          <p className="modal-desc">{isLogin ? "Chào mừng quay lại!" : "Tham gia cộng đồng — sau khi đăng ký, chọn vai trò Tác giả, Reviewer hoặc Editor."}</p>
          <div className="modal-sections">
            {!isLogin && <div className="form-group"><label className="form-label-bold">Họ và tên</label><input className="form-input" placeholder="Nguyễn Văn A" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}/></div>}
            <div className="form-group"><label className="form-label-bold">Email</label><input className="form-input" type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}/></div>
            <div className="form-group"><label className="form-label-bold">Mật khẩu</label><input className="form-input" type="password" placeholder="Ít nhất 6 ký tự" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}/></div>
            {err && <div style={{ color: "#c23d3f", fontSize: 13, background: "#fde8e8", padding: "8px 12px", borderRadius: 7 }}>{err}</div>}
            <button className="btn-full btn-red-full" onClick={handle}>{isLogin ? "Đăng nhập" : "Đăng ký"}</button>
          </div>
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#6b5a4e" }}>
            {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
            <span style={{ color: "#c23d3f", cursor: "pointer", fontWeight: 600 }} onClick={() => { setMode(isLogin ? "register" : "login"); setErr(""); }}>
              {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
            </span>
          </div>
        </div>
      </div>
    </div>);
}