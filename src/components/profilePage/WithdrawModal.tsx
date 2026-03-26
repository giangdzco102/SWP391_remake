import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useAuthStore } from "@/stores";
import useWithdrawService from "@/api/useWithdraw.service";
import { useToast } from "@/hooks/use-toast";
import { WithdrawRequest } from "@/types/auth";

export function WithdrawModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user, updateBalance } = useAuthStore();
  const { createWithdrawRequest } = useWithdrawService();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<WithdrawRequest>({
    defaultValues: { amount: 1000, bankName: "", bankAccount: "", bankOwner: "", note: "" },
  });

  const onSubmit = async (data: WithdrawRequest) => {
    if ((user?.walletBalance ?? 0) < data.amount) {
      toast.error("Số dư không đủ để rút!");
      return;
    }
    setSaving(true);
    try {
      await createWithdrawRequest(data);
      updateBalance(data.amount);
      toast.success("Gửi yêu cầu rút tiền thành công! Vui lòng chờ Admin duyệt.");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gửi yêu cầu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1.5px solid #ddd5c8", fontSize: 14, outline: "none",
    fontFamily: "inherit", background: "#fdfaf7", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 12, fontWeight: 600, color: "#6b5a4e",
    marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 900,
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480,
        boxShadow: "0 24px 64px rgba(0,0,0,0.25)", animation: "popIn 0.2s ease",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "20px 24px", borderBottom: "1.5px solid #f5ede4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700 }}>💸 Rút tiền về ngân hàng</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Số coin muốn rút (1 coin = 1 VND)</label>
            <Controller name="amount" control={control} rules={{ required: true, min: 1000 }}
              render={({ field }) => <input {...field} type="number" style={inputStyle} />} />
            {errors.amount && <div style={{ color: "#c23d3f", fontSize: 11, marginTop: 4 }}>Rút tối thiểu 1,000 coin</div>}
            <div style={{ fontSize: 12, color: "#9e8e82", marginTop: 4 }}>Số dư hiện tại: 🪙 {user?.walletBalance}</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Tên ngân hàng</label>
            <Controller name="bankName" control={control} rules={{ required: "Bắt buộc" }}
              render={({ field }) => <input {...field} placeholder="Ví dụ: Vietcombank, MB, Momo..." style={inputStyle} />} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Số tài khoản</label>
            <Controller name="bankAccount" control={control} rules={{ required: "Bắt buộc" }}
              render={({ field }) => <input {...field} style={inputStyle} />} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Tên chủ tài khoản</label>
            <Controller name="bankOwner" control={control} rules={{ required: "Bắt buộc" }}
              render={({ field }) => <input {...field} placeholder="VIET HOA KHONG DAU" style={inputStyle} />} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: 10, border: "1.5px solid #ddd5c8", background: "#fff" }}>Hủy</button>
            <button type="submit" disabled={saving} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#c23d3f", color: "#fff", fontWeight: 700 }}>
              {saving ? "⏳ Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
