import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import useAuthService from "@/api/useAuth.service";
import { useToast } from "@/hooks/use-toast";
import { ChangePasswordForm } from "@/types/profilePage";

export function ChangePasswordModal({ onClose }: { onClose: () => void }) {
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
