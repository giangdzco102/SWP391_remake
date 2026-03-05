"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useAuthStore } from "@/stores";
import useAuthService from "@/api/useAuth.service";
import { PayloadUpdateProfile } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";

const ROLE_LABEL: Record<string, string> = {
  REVIEWER: "Reviewer",
  AUTHOR: "Tác giả",
  EDITOR: "Editor",
  READER: "Độc giả",
};

const ROLE_CHIP_CLASS: Record<string, string> = {
  REVIEWER: "chip-role-reviewer",
  AUTHOR:   "chip-role-author",
  EDITOR:   "chip-role-editor",
  READER:   "chip-role-reader",
};

const ROLE_ICON: Record<string, string> = {
  REVIEWER: "🔍",
  AUTHOR:   "✍️",
  EDITOR:   "📝",
  READER:   "👤",
};

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 0",
      borderBottom: "1px solid #f5ede4",
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: "#fdf7f0",
        border: "1.5px solid #ece6dc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "#9e8e82", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 14, color: "#1c1512", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value}
        </div>
      </div>
    </div>
  );
}

// ── Change Password Modal ──────────────────────────────────────
interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { changePassword } = useAuthService();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

  const { control, handleSubmit, watch, formState: { errors } } = useForm<ChangePasswordForm>({
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });
  const newPw = watch("newPassword");

  const onSubmit = async (data: ChangePasswordForm) => {
    setSaving(true);
    try {
      await changePassword!(data);
      toast.success("Đổi mật khẩu thành công!");
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    flex: 1, padding: "10px 14px", borderRadius: 10,
    border: "1.5px solid #ddd5c8", fontSize: 14, outline: "none",
    fontFamily: "inherit", background: "#fdfaf7", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 12, fontWeight: 600, color: "#6b5a4e",
    marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px",
  };
  const eyeBtn: React.CSSProperties = {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9e8e82",
    padding: 0, lineHeight: 1,
  };

  const PwField = ({
    name, label, show, toggle,
  }: { name: keyof ChangePasswordForm; label: string; show: boolean; toggle: () => void }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <Controller name={name} control={control}
          rules={{
            required: "Bắt buộc",
            ...(name === "newPassword" ? {
              minLength: { value: 6, message: "Ít nhất 6 ký tự" },
              pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: "Cần có chữ hoa, chữ thường và số" },
            } : {}),
            ...(name === "confirmNewPassword" ? {
              validate: (v: string) => v === newPw || "Mật khẩu không khớp",
            } : {}),
          }}
          render={({ field }) => (
            <input {...field} type={show ? "text" : "password"}
              style={{ ...inputStyle, paddingRight: 40, width: "100%" }}
              placeholder={name === "currentPassword" ? "Mật khẩu hiện tại" : name === "newPassword" ? "Mật khẩu mới" : "Nhập lại mật khẩu mới"} />
          )} />
        <button type="button" style={eyeBtn} onClick={toggle}>{show ? "🙈" : "👁️"}</button>
      </div>
      {errors[name] && <div style={{ fontSize: 11, color: "#c23d3f", marginTop: 4 }}>{errors[name]?.message}</div>}
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 900,
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 20, width: "100%", maxWidth: 440,
        boxShadow: "0 24px 64px rgba(0,0,0,0.25)", animation: "popIn 0.2s ease",
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px 16px", borderBottom: "1.5px solid #f5ede4",
        }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: "#1c1512" }}>
              🔐 Đổi mật khẩu
            </div>
            <div style={{ fontSize: 12, color: "#9e8e82", marginTop: 2 }}>Mật khẩu tối thiểu 6 ký tự, có chữ hoa, chữ thường và số</div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: "none",
            background: "#f5ede4", cursor: "pointer", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: "20px 24px 24px" }}>
          <PwField name="currentPassword"    label="Mật khẩu hiện tại"
            show={showPw.current} toggle={() => setShowPw(s => ({ ...s, current: !s.current }))} />

          <div style={{ height: 1, background: "#f5ede4", margin: "4px 0 16px" }} />

          <PwField name="newPassword"         label="Mật khẩu mới"
            show={showPw.next}    toggle={() => setShowPw(s => ({ ...s, next: !s.next }))} />
          <PwField name="confirmNewPassword"  label="Xác nhận mật khẩu mới"
            show={showPw.confirm} toggle={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))} />

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{
              padding: "10px 20px", borderRadius: 10, border: "1.5px solid #ddd5c8",
              background: "#fff", color: "#6b5a4e", fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}>Hủy</button>
            <button type="submit" disabled={saving} style={{
              padding: "10px 24px", borderRadius: 10, border: "none",
              background: saving ? "#d4a5a5" : "#c23d3f",
              color: "#fff", fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
            }}>{saving ? "⏳ Đang lưu..." : "🔐 Đổi mật khẩu"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
// ───────────────────────────────────────────────────────────────

type TabKey = "info" | "stories" | "reviews" | "coins";

// ── Edit Profile Modal ──────────────────────────────────────────
function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuthStore();
  const { updateProfile } = useAuthService();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<PayloadUpdateProfile>({
    defaultValues: {
      fullName:    user?.fullName    ?? "",
      bio:         user?.bio         ?? "",
      phone:       user?.phone       ?? "",
      dateOfBirth: user?.dateOfBirth?.slice(0, 10) ?? "",
      gender:      (user?.gender as "MALE" | "FEMALE" | "OTHER") ?? "MALE",
      location:    user?.location    ?? "",
      avatarUrl:   user?.avatarUrl   ?? "",
    },
  });

  const onSubmit = async (data: PayloadUpdateProfile) => {
    setSaving(true);
    try {
      await updateProfile!(data);
      toast.success("Cập nhật hồ sơ thành công!");
      onClose();
    } catch {
      toast.error("Cập nhật thất bại, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1.5px solid #ddd5c8", fontSize: 14, outline: "none",
    fontFamily: "inherit", background: "#fdfaf7", boxSizing: "border-box",
    transition: "border-color 0.15s",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 12, fontWeight: 600,
    color: "#6b5a4e", marginBottom: 6,
    textTransform: "uppercase", letterSpacing: "0.4px",
  };
  const fieldStyle: React.CSSProperties = { marginBottom: 16 };
  const errorStyle: React.CSSProperties = { fontSize: 11, color: "#c23d3f", marginTop: 4 };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 900,
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
        animation: "popIn 0.2s ease",
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px 16px", borderBottom: "1.5px solid #f5ede4",
        }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: "#1c1512" }}>
              ✏️ Sửa hồ sơ
            </div>
            <div style={{ fontSize: 12, color: "#9e8e82", marginTop: 2 }}>Cập nhật thông tin cá nhân của bạn</div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: "none",
            background: "#f5ede4", cursor: "pointer", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: "20px 24px 24px" }}>
          {/* Họ tên */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Họ và tên *</label>
            <Controller name="fullName" control={control}
              rules={{ required: "Vui lòng nhập họ tên" }}
              render={({ field }) => (
                <input {...field} style={inputStyle} placeholder="Nguyễn Văn A" />
              )} />
            {errors.fullName && <div style={errorStyle}>{errors.fullName.message}</div>}
          </div>

          {/* Bio */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Giới thiệu bản thân</label>
            <Controller name="bio" control={control}
              render={({ field }) => (
                <textarea {...field} rows={3} style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="Viết vài dòng về bạn..." />
              )} />
          </div>

          {/* Avatar URL */}
          <div style={fieldStyle}>
            <label style={labelStyle}>URL ảnh đại diện</label>
            <Controller name="avatarUrl" control={control}
              render={({ field }) => (
                <input {...field} style={inputStyle} placeholder="https://..." />
              )} />
          </div>

          {/* 2 cols: phone + gender */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Số điện thoại</label>
              <Controller name="phone" control={control}
                render={({ field }) => (
                  <input {...field} style={inputStyle} placeholder="0912345678" />
                )} />
            </div>
            <div>
              <label style={labelStyle}>Giới tính</label>
              <Controller name="gender" control={control}
                render={({ field }) => (
                  <select {...field} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                )} />
            </div>
          </div>

          {/* 2 cols: dob + location */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div>
              <label style={labelStyle}>Ngày sinh</label>
              <Controller name="dateOfBirth" control={control}
                render={({ field }) => (
                  <input {...field} type="date" style={inputStyle} />
                )} />
            </div>
            <div>
              <label style={labelStyle}>Địa chỉ</label>
              <Controller name="location" control={control}
                render={({ field }) => (
                  <input {...field} style={inputStyle} placeholder="Hà Nội" />
                )} />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{
              padding: "10px 20px", borderRadius: 10, border: "1.5px solid #ddd5c8",
              background: "#fff", color: "#6b5a4e", fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}>
              Hủy
            </button>
            <button type="submit" disabled={saving} style={{
              padding: "10px 24px", borderRadius: 10, border: "none",
              background: saving ? "#d4a5a5" : "#c23d3f",
              color: "#fff", fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {saving ? "⏳ Đang lưu..." : "💾 Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// ───────────────────────────────────────────────────────────────

export function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const [showEdit, setShowEdit] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);

  const primaryRole   = user?.roles?.[0] ?? "READER";
  const roleLabel     = ROLE_LABEL[primaryRole]     ?? "Độc giả";
  const roleChipClass = ROLE_CHIP_CLASS[primaryRole] ?? "chip-role-reader";
  const roleIcon      = ROLE_ICON[primaryRole]      ?? "👤";

  const avatarInitials = user?.fullName
    ? user.fullName.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase()
    : "AV";

  const tabs: { key: TabKey; label: string }[] = [
    { key: "info",    label: "Thông tin" },
    { key: "stories", label: "Tác phẩm" },
    { key: "reviews", label: "Đánh giá" },
    { key: "coins",   label: "Lịch sử coin" },
  ];

  return (
    <div className="profile-wrap fade-in">
      {showEdit && <EditProfileModal onClose={() => setShowEdit(false)} />}
      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}

      {/* ── Header card ── */}
      <div className="profile-header">
        <div className="avatar-upload-wrap" title="Đổi ảnh đại diện">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="avatar"
              className="profile-avatar-big"
              style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "50%" }}
            />
          ) : (
            <div className="profile-avatar-big" style={{ width: 80, height: 80 }}>
              <span style={{ fontSize: 28, fontWeight: 900 }}>{avatarInitials}</span>
            </div>
          )}
          <div className="avatar-upload-overlay">
            <span style={{ fontSize: 20 }}>📷</span>
            <span>Đổi ảnh</span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, marginBottom: 4 }}>
            {user?.fullName || "Người dùng"}
          </div>
          <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 12 }}>
            {user?.email && <>{user.email} · </>}
            Tham gia {formatDate(user?.createdAt)}
          </div>
          <div style={{ fontSize: 14, opacity: 0.75, maxWidth: 500, lineHeight: 1.6, marginBottom: 14 }}>
            {user?.bio || "Giới thiệu bản thân..."}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span className={`role-chip ${roleChipClass}`}>{roleIcon} {roleLabel}</span>
            <button className="tab-btn" onClick={() => setShowEdit(true)}>Sửa hồ sơ</button>
            <button className="tab-btn" onClick={() => setShowChangePw(true)}>🔑 Đổi mật khẩu</button>
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div className="coin-badge">🪙 {user?.walletBalance ?? 0}</div>
          <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>coin tích lũy</div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="profile-stats-grid">
        {[
          { num: user?.totalFollowedStories ?? 0, label: "Lượt đọc",   icon: "📖" },
          { num: 0,                               label: "Tác phẩm",   icon: "✍️"  },
          { num: 0,                               label: "Đánh giá",   icon: "⭐"  },
          { num: user?.walletBalance ?? 0,        label: "Coin đã kiếm", icon: "🪙" },
        ].map(({ num, label, icon }) => (
          <div className="profile-stat-card" key={label}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
            <div className="profile-stat-num">{num}</div>
            <div className="profile-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="profile-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`profile-tab${activeTab === t.key ? " active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Thông tin ── */}
      {activeTab === "info" && (
        <div className="fade-in" style={{
          background: "#fff",
          borderRadius: 14,
          border: "1.5px solid #ece6dc",
          padding: "8px 24px 4px",
        }}>
          {/* Section header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "16px 0 12px",
            borderBottom: "2px solid #f5ede4",
            marginBottom: 4,
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "linear-gradient(135deg,#c23d3f,#9e2d2f)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}>👤</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: "#1c1512" }}>
                {user?.fullName || "—"}
              </div>
              <div style={{ fontSize: 12, color: "#9e8e82" }}>Thông tin cá nhân</div>
            </div>
            <span className={`role-chip ${roleChipClass}`} style={{ marginLeft: "auto", fontSize: 12 }}>
              {roleIcon} {roleLabel}
            </span>
          </div>

          <InfoRow icon="📧" label="Email"         value={user?.email                 || "—"} />
          <InfoRow icon="📱" label="Số điện thoại" value={user?.phone                 || "—"} />
          <InfoRow icon="⚧"  label="Giới tính"     value={user?.gender === "MALE" ? "Nam" : user?.gender === "FEMALE" ? "Nữ" : "—"} />
          <InfoRow icon="🎂" label="Ngày sinh"      value={formatDate(user?.dateOfBirth)}       />
          <InfoRow icon="📍" label="Địa chỉ"        value={user?.location              || "—"} />
          <InfoRow icon="📅" label="Tham gia"       value={formatDate(user?.createdAt)}         />

          {/* Coin highlight */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "12px 0",
            padding: "14px 16px",
            background: "linear-gradient(135deg,#fffbeb,#fef3c7)",
            borderRadius: 12,
            border: "1.5px solid #fcd34d",
          }}>
            <span style={{ fontSize: 24 }}>🪙</span>
            <div>
              <div style={{ fontSize: 11, color: "#92400e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Coin hiện tại
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#92400e", fontFamily: "'Playfair Display',serif" }}>
                {user?.walletBalance ?? 0} <span style={{ fontSize: 13, fontWeight: 500 }}>coin</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "stories" && (
        <div className="fade-in">
          <div className="empty-state">Chưa có tác phẩm nào</div>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="fade-in">
          <div className="empty-state">Chưa có đánh giá nào</div>
        </div>
      )}

      {activeTab === "coins" && (
        <div className="fade-in">
          <div className="empty-state">Chưa có lịch sử coin</div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
