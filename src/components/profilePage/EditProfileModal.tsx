import { useState, useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { useAuthStore } from "@/stores";
import useAuthService from "@/api/useAuth.service";
import { useToast } from "@/hooks/use-toast";
import { PayloadUpdateProfile } from "@/types/auth";

export function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuthStore();
  const { updateProfile, uploadAvatar } = useAuthService();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatarUrl ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<PayloadUpdateProfile>({
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

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh (JPG, PNG, GIF, WebP...)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh quá lớn! Tối đa 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setSelectedFile(file);
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview("");
    setSelectedFile(null);
    setValue("avatarUrl", "");
  };

  const onSubmit = async (data: PayloadUpdateProfile) => {
    setSaving(true);
    try {
      let finalAvatarUrl = data.avatarUrl;
      if (selectedFile) finalAvatarUrl = await uploadAvatar!(selectedFile);
      await updateProfile!({ ...data, avatarUrl: finalAvatarUrl });
      toast.success("✅ Cập nhật hồ sơ thành công!");
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Cập nhật thất bại, vui lòng thử lại.");
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

  const avatarInitials = user?.fullName
    ? user.fullName.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase()
    : "AV";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 900,
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.25)", animation: "popIn 0.2s ease",
      }} onClick={e => e.stopPropagation()}>
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
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: "20px 24px 24px" }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Họ và tên *</label>
            <Controller name="fullName" control={control} rules={{ required: "Vui lòng nhập họ tên" }}
              render={({ field }) => <input {...field} style={inputStyle} placeholder="Nguyễn Văn A" />} />
            {errors.fullName && <div style={errorStyle}>{errors.fullName.message}</div>}
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Giới thiệu bản thân</label>
            <Controller name="bio" control={control}
              render={({ field }) => (
                <textarea {...field} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Viết vài dòng về bạn..." />
              )} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Ảnh đại diện</label>
            <Controller name="avatarUrl" control={control} render={() => <></>} />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ flexShrink: 0 }}>
                {avatarPreview ? (
                  <div style={{ position: "relative", width: 80, height: 80 }}>
                    <img src={avatarPreview} alt="Avatar preview" style={{
                      width: 80, height: 80, borderRadius: "50%", objectFit: "cover",
                      border: "3px solid #c23d3f", boxShadow: "0 4px 12px rgba(194,61,63,0.25)",
                    }} />
                    <button type="button" onClick={handleRemoveAvatar} title="Xóa ảnh" style={{
                      position: "absolute", top: -4, right: -4, width: 22, height: 22,
                      borderRadius: "50%", background: "#c23d3f", border: "2px solid #fff",
                      cursor: "pointer", fontSize: 11, color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, lineHeight: 1,
                    }}>✕</button>
                  </div>
                ) : (
                  <div style={{
                    width: 80, height: 80, borderRadius: "50%",
                    background: "linear-gradient(135deg,#c23d3f,#9e2d2f)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, fontWeight: 900, color: "#fff", border: "3px solid #f5ede4",
                  }}>{avatarInitials}</div>
                )}
              </div>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  flex: 1, border: `2px dashed ${isDragOver ? "#c23d3f" : "#ddd5c8"}`,
                  borderRadius: 12, padding: "16px 14px",
                  background: isDragOver ? "#fdf3f3" : "#fdfaf7",
                  cursor: "pointer", transition: "all 0.15s",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 4, textAlign: "center",
                }}
              >
                <span style={{ fontSize: 24 }}>📷</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1c1512" }}>
                  {avatarPreview ? "Thay ảnh khác" : "Chọn ảnh từ máy tính"}
                </div>
                <div style={{ fontSize: 11, color: "#9e8e82" }}>
                  Kéo thả hoặc click · JPG, PNG, GIF, WebP · Tối đa 5MB
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Số điện thoại</label>
              <Controller name="phone" control={control}
                render={({ field }) => <input {...field} style={inputStyle} placeholder="0912345678" />} />
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div>
              <label style={labelStyle}>Ngày sinh</label>
              <Controller name="dateOfBirth" control={control}
                render={({ field }) => <input {...field} type="date" style={inputStyle} />} />
            </div>
            <div>
              <label style={labelStyle}>Địa chỉ</label>
              <Controller name="location" control={control}
                render={({ field }) => <input {...field} style={inputStyle} placeholder="Hà Nội" />} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{
              padding: "10px 20px", borderRadius: 10, border: "1.5px solid #ddd5c8",
              background: "#fff", color: "#6b5a4e", fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}>Hủy</button>
            <button type="submit" disabled={saving} style={{
              padding: "10px 24px", borderRadius: 10, border: "none",
              background: saving ? "#d4a5a5" : "#c23d3f",
              color: "#fff", fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}>{saving ? "⏳ Đang lưu..." : "💾 Lưu thay đổi"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
