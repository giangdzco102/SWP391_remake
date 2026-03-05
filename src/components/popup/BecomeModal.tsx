/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Modal } from "antd";
import { Ico } from "../Icons";
import { GENRES } from "@/utils/mockData";
import { useToast } from "@/hooks/use-toast";

// ── BECOME AUTHOR ──
export function SettingsModal({ onClose }: any) {
  const [tab, setTab] = useState("account");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [darkPref, setDarkPref] = useState(false);
  const [fontSize, setFontSize] = useState("medium");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifNewChapter, setNotifNewChapter] = useState(true);
  const [notifReview, setNotifReview] = useState(true);
  const [notifCoin, setNotifCoin] = useState(true);
  const [language, setLanguage] = useState("vi");
  const toast = useToast();

  const handleChangePassword = () => {
    setPwError("");
    if (!currentPw) {
      setPwError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }
    if (newPw.length < 6) {
      setPwError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    toast.success("✅ Đổi mật khẩu thành công!");
  };
  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Bạn có chắc muốn xóa tài khoản? Hành động này không thể hoàn tác.",
      )
    ) {
      toast.success("✅ Tài khoản đã được xóa.");
      onClose();
    }
  };
  const tabs = [
    ["account", "👤", "Tài khoản"],
    ["display", "🎨", "Hiển thị"],
    ["notifications", "🔔", "Thông báo"],
  ];
  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="modal modal-wide"
        style={{ maxWidth: 540 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">
            <Ico.Settings />
            Cài đặt
          </div>
          <button className="modal-close" onClick={onClose}>
            <Ico.X />
          </button>
        </div>
        <div className="modal-body" style={{ padding: 0 }}>
          {/* Tab strip */}
          <div
            style={{
              display: "flex",
              borderBottom: "1.5px solid #f0ebe3",
              padding: "0 20px",
              gap: 4,
            }}
          >
            {tabs.map(([k, icon, label]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                style={{
                  padding: "12px 16px",
                  fontSize: 13,
                  fontWeight: tab === k ? 700 : 500,
                  color: tab === k ? "#c23d3f" : "#6b5a4e",
                  cursor: "pointer",
                  border: "none",
                  background: "transparent",
                  borderBottom: `2.5px solid ${tab === k ? "#c23d3f" : "transparent"}`,
                  transition: "all .15s",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          <div style={{ padding: "20px 24px" }}>
            {/* ── ACCOUNT TAB ── */}
            {tab === "account" && (
              <div className="fade-in">
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#1c1512",
                      marginBottom: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    🔐 Đổi mật khẩu
                  </div>
                  {pwError && (
                    <div
                      style={{
                        background: "#fde8e8",
                        border: "1px solid #f4a0a0",
                        borderRadius: 8,
                        padding: "10px 14px",
                        fontSize: 13,
                        color: "#c23d3f",
                        marginBottom: 12,
                      }}
                    >
                      {pwError}
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      className="form-input"
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mật khẩu mới</label>
                    <input
                      type="password"
                      className="form-input"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="Ít nhất 6 ký tự"
                    />
                    {newPw.length > 0 && (
                      <div
                        style={{
                          marginTop: 6,
                          height: 4,
                          borderRadius: 2,
                          background: "#f0ebe3",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            borderRadius: 2,
                            transition: "all .3s",
                            width:
                              newPw.length < 6
                                ? "30%"
                                : newPw.length < 10
                                  ? "60%"
                                  : "100%",
                            background:
                              newPw.length < 6
                                ? "#f87171"
                                : newPw.length < 10
                                  ? "#fbbf24"
                                  : "#34d399",
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      className="form-input"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      style={{
                        borderColor:
                          confirmPw && confirmPw !== newPw
                            ? "#f87171"
                            : undefined,
                      }}
                    />
                    {confirmPw && (
                      <div
                        style={{
                          fontSize: 12,
                          marginTop: 4,
                          color: confirmPw === newPw ? "#34d399" : "#f87171",
                        }}
                      >
                        {confirmPw === newPw ? "✓ Khớp" : "✗ Không khớp"}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleChangePassword}
                    style={{
                      padding: "9px 24px",
                      borderRadius: 9,
                      background: "#c23d3f",
                      color: "#fff",
                      border: "none",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Đổi mật khẩu
                  </button>
                </div>

                <div
                  style={{ borderTop: "1.5px solid #f0ebe3", paddingTop: 20 }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#1c1512",
                      marginBottom: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    🌐 Ngôn ngữ
                  </div>
                  <select
                    className="form-input form-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{ maxWidth: 200 }}
                  >
                    <option value="vi">🇻🇳 Tiếng Việt</option>
                    <option value="en">🇬🇧 English</option>
                  </select>
                </div>

                <div
                  style={{
                    borderTop: "1.5px solid #f0ebe3",
                    paddingTop: 20,
                    marginTop: 20,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#c23d3f",
                      marginBottom: 8,
                    }}
                  >
                    ⚠️ Vùng nguy hiểm
                  </div>
                  <p
                    style={{ fontSize: 13, color: "#9e8e82", marginBottom: 12 }}
                  >
                    Xóa tài khoản là hành động vĩnh viễn. Toàn bộ dữ liệu sẽ bị
                    mất.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 9,
                      border: "1.5px solid #f87171",
                      background: "#fff",
                      color: "#c23d3f",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Xóa tài khoản
                  </button>
                </div>
              </div>
            )}

            {/* ── DISPLAY TAB ── */}
            {tab === "display" && (
              <div className="fade-in">
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#1c1512",
                      marginBottom: 14,
                    }}
                  >
                    🌙 Giao diện
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    {[
                      ["light", "☀️ Sáng"],
                      ["dark", "🌙 Tối"],
                    ].map(([k, label]) => (
                      <div
                        key={k}
                        onClick={() => {
                          setDarkPref(k === "dark");
                          toast.info(
                            `Đã chuyển sang giao diện ${k === "dark" ? "tối" : "sáng"}.`,
                          );
                        }}
                        style={{
                          flex: 1,
                          padding: "14px",
                          borderRadius: 12,
                          border: `2px solid ${(k === "dark") === darkPref ? "#c23d3f" : "#e8e0d6"}`,
                          background:
                            (k === "dark") === darkPref ? "#fde8e8" : "#fff",
                          cursor: "pointer",
                          textAlign: "center",
                          transition: "all .15s",
                        }}
                      >
                        <div style={{ fontSize: 24, marginBottom: 4 }}>
                          {label.split(" ")[0]}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color:
                              (k === "dark") === darkPref
                                ? "#c23d3f"
                                : "#6b5a4e",
                          }}
                        >
                          {label.split(" ")[1]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{ borderTop: "1.5px solid #f0ebe3", paddingTop: 20 }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#1c1512",
                      marginBottom: 14,
                    }}
                  >
                    📖 Cỡ chữ đọc truyện
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[
                      ["small", "A", "Nhỏ", "14px"],
                      ["medium", "A", "Vừa", "18px"],
                      ["large", "A", "Lớn", "22px"],
                    ].map(([k, letter, label, size]) => (
                      <div
                        key={k}
                        onClick={() => {
                          setFontSize(k);
                          toast.info(`Cỡ chữ: ${label}`);
                        }}
                        style={{
                          flex: 1,
                          padding: "12px 8px",
                          borderRadius: 12,
                          border: `2px solid ${fontSize === k ? "#c23d3f" : "#e8e0d6"}`,
                          background: fontSize === k ? "#fde8e8" : "#fff",
                          cursor: "pointer",
                          textAlign: "center",
                          transition: "all .15s",
                        }}
                      >
                        <div
                          style={{
                            fontSize: size,
                            fontWeight: 700,
                            color: fontSize === k ? "#c23d3f" : "#6b5a4e",
                            fontFamily: "'Playfair Display',serif",
                          }}
                        >
                          {letter}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#9e8e82",
                            marginTop: 2,
                          }}
                        >
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS TAB ── */}
            {tab === "notifications" && (
              <div className="fade-in">
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#1c1512",
                    marginBottom: 16,
                  }}
                >
                  Tùy chỉnh thông báo nhận được
                </div>
                {[
                  {
                    val: notifEmail,
                    setter: setNotifEmail,
                    title: "📧 Email thông báo",
                    desc: "Nhận email tóm tắt hoạt động hàng tuần",
                  },
                  {
                    val: notifNewChapter,
                    setter: setNotifNewChapter,
                    title: "📖 Chương mới",
                    desc: "Khi truyện bạn theo dõi có chương mới",
                  },
                  {
                    val: notifReview,
                    setter: setNotifReview,
                    title: "⭐ Đánh giá tác phẩm",
                    desc: "Khi độc giả đánh giá tác phẩm của bạn",
                  },
                  {
                    val: notifCoin,
                    setter: setNotifCoin,
                    title: "🪙 Giao dịch coin",
                    desc: "Khi nhận hoặc tiêu xu",
                  },
                ].map(({ val, setter, title, desc }) => (
                  <div
                    key={title}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 0",
                      borderBottom: "1px solid #f5ede4",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#1c1512",
                        }}
                      >
                        {title}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#9e8e82", marginTop: 2 }}
                      >
                        {desc}
                      </div>
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        const nextVal = !val;
                        setter(nextVal);
                        const msgTitle = title.replace(/^.\s?/, ""); // Remove emoji + possible space
                        toast.info(
                          `${nextVal ? "Bật" : "Tắt"} thông báo: ${msgTitle}`,
                        );
                      }}
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        background: val ? "#c23d3f" : "#d1d5db",
                        cursor: "pointer",
                        position: "relative",
                        transition: "all .25s",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 2,
                          left: val ? 22 : 2,
                          width: 20,
                          height: 20,
                          background: "#fff",
                          borderRadius: "50%",
                          transition: "left .25s",
                          boxShadow: "0 1px 4px rgba(0,0,0,.2)",
                        }}
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    toast.success("Đã lưu cài đặt thông báo!");
                    onClose();
                  }}
                  style={{
                    marginTop: 20,
                    padding: "9px 24px",
                    borderRadius: 9,
                    background: "#c23d3f",
                    color: "#fff",
                    border: "none",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Lưu cài đặt
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export function BecomeAuthorModal({ onClose, onSuccess }) {
  const [penName, setPenName] = useState("");
  const [genre, setGenre] = useState("");
  const [bio, setBio] = useState("");
  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Ico.Pen />
            Đăng ký Tác giả
          </div>
          <button className="modal-close" onClick={onClose}>
            <Ico.X />
          </button>
        </div>
        <div className="modal-body">
          <div className="info-box blue" style={{ marginBottom: 16 }}>
            Sau khi đăng ký bút danh, bạn có thể nộp tác phẩm. Mỗi tác phẩm sẽ
            được <strong>Reviewer kiểm duyệt</strong> trước khi đăng.
          </div>
          <div className="modal-sections">
            <div className="form-group">
              <label className="form-label-bold">
                ✒ Bút danh <span style={{ color: "#c23d3f" }}>*</span>
              </label>
              <input
                className="form-input"
                placeholder="vd. LinhnhưGió…"
                value={penName}
                onChange={(e) => setPenName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label-bold">
                Thể loại chính <span style={{ color: "#c23d3f" }}>*</span>
              </label>
              <select
                className="form-input form-select"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              >
                <option value="">-- Chọn --</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label-bold">Giới thiệu (tùy chọn)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Kể về bạn và phong cách viết…"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <button
              className="btn-full btn-red-full"
              onClick={() => {
                if (penName.trim() && genre) onSuccess(penName.trim());
              }}
              disabled={!penName.trim() || !genre}
              style={{ opacity: !penName.trim() || !genre ? 0.6 : 1 }}
            >
              ✒ Xác nhận đăng ký Tác giả
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export function BecomeReviewerModal({ onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const [experience, setExperience] = useState("");
  const [agreed, setAgreed] = useState(false);
  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Ico.Shield />
            Đăng ký Reviewer
          </div>
          <button className="modal-close" onClick={onClose}>
            <Ico.X />
          </button>
        </div>
        <div className="modal-body">
          <div className="info-box" style={{ marginBottom: 16 }}>
            <strong>🛡 Reviewer là gì?</strong>
            <br />
            Kiểm duyệt tác phẩm trước khi đăng tải. Mỗi tác phẩm duyệt{" "}
            <strong>+20🪙</strong>, từ chối <strong>+10🪙</strong>.
          </div>
          <div className="modal-sections">
            <div className="form-group">
              <label className="form-label-bold">Kinh nghiệm đọc/viết</label>
              <select
                className="form-input form-select"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                <option value="">-- Chọn --</option>
                {[
                  "Đọc nhiều, yêu văn học",
                  "Đã từng viết sáng tác",
                  "Học văn, ngữ văn",
                  "Giáo viên/nhà nghiên cứu",
                ].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label-bold">
                Lý do muốn trở thành Reviewer
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Chia sẻ động lực…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                cursor: "pointer",
                fontSize: 13,
                color: "#3d2e26",
              }}
            >
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{
                  marginTop: 2,
                  accentColor: "#c23d3f",
                  width: 16,
                  height: 16,
                }}
              />
              Tôi cam kết kiểm duyệt công tâm và có trách nhiệm.
            </label>
            <button
              className="btn-full btn-gold-full"
              onClick={onSuccess}
              disabled={!agreed || !experience}
              style={{ opacity: !agreed || !experience ? 0.5 : 1 }}
            >
              🛡 Đăng ký Reviewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export function BecomeEditorModal({ onClose, onSuccess }) {
  const [skills, setSkills] = useState([]);
  const [portfolio, setPortfolio] = useState("");
  const [agreed, setAgreed] = useState(false);
  const skillOpts = [
    "Sửa lỗi chính tả / ngữ pháp",
    "Chỉnh văn phong, cách hành văn",
    "Viết thêm chapter theo brief",
    "Phát triển nhân vật",
    "Kiểm tra tính nhất quán cốt truyện",
  ];
  const toggle = (s) =>
    setSkills((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Ico.Edit />
            Đăng ký Editor
          </div>
          <button className="modal-close" onClick={onClose}>
            <Ico.X />
          </button>
        </div>
        <div className="modal-body">
          <div className="info-box green" style={{ marginBottom: 16 }}>
            <strong>✏ Editor là gì?</strong>
            <br />
            Hỗ trợ tác giả <strong>sửa bản thảo</strong> hoặc{" "}
            <strong>viết thêm chapter</strong>. Hoàn thành nhiệm vụ nhận coin
            thưởng.
          </div>
          <div className="modal-sections">
            <div className="form-group">
              <label className="form-label-bold">Kỹ năng của bạn</label>
              {skillOpts.map((s) => (
                <label
                  key={s}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#3d2e26",
                    marginBottom: 8,
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: `1.5px solid ${skills.includes(s) ? "#86efac" : "#e8e0d6"}`,
                    background: skills.includes(s) ? "#f0fdf4" : "#fff",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={skills.includes(s)}
                    onChange={() => toggle(s)}
                    style={{ accentColor: "#1d6b3a", width: 15, height: 15 }}
                  />
                  {s}
                </label>
              ))}
            </div>
            <div className="form-group">
              <label className="form-label-bold">
                Portfolio / kinh nghiệm (tùy chọn)
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Link tác phẩm đã edit…"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
              />
            </div>
            <div className="info-box green">
              🪙 <strong>Cách nhận coin:</strong> Nhận nhiệm vụ → Hoàn thành →
              Tác giả duyệt → Nhận coin ngay
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                cursor: "pointer",
                fontSize: 13,
                color: "#3d2e26",
              }}
            >
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{
                  marginTop: 2,
                  accentColor: "#1d6b3a",
                  width: 16,
                  height: 16,
                }}
              />
              Tôi cam kết hoàn thành đúng hẹn và giữ bí mật nội dung bản thảo
              chưa phát hành.
            </label>
            <button
              className="btn-full btn-green-full"
              onClick={onSuccess}
              disabled={!agreed || skills.length === 0}
              style={{ opacity: !agreed || skills.length === 0 ? 0.5 : 1 }}
            >
              ✏ Đăng ký trở thành Editor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
