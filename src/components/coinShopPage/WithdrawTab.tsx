"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import useHttpClient from "@/api/useHttpClient";
import APP_CONFIG from "@/config/app-config";
import { formatVnd, formatDate } from "@/utils/coinShop.utils";
import { useToast } from "@/hooks/use-toast";

export function WithdrawTab() {
  const [wdSubTab, setWdSubTab] = useState<"form" | "history">("form");
  const [wdHistory, setWdHistory] = useState<any[]>([]);
  const [wdHistoryLoading, setWdHistoryLoading] = useState(false);
  const [wdSubmitting, setWdSubmitting] = useState(false);
  const [wdForm, setWdForm] = useState({ amount: "", bankName: "", bankAccount: "", bankOwner: "", note: "" });

  const httpClient = useHttpClient();
  const toast = useToast();

  const loadWdHistory = useCallback(async () => {
    setWdHistoryLoading(true);
    try {
      const res: any = await httpClient.get(APP_CONFIG.WITHDRAW.MY);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setWdHistory(list);
    } catch {
      /* silent */
    } finally {
      setWdHistoryLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (wdSubTab === "history") loadWdHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wdSubTab]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(wdForm.amount, 10);
    if (!amount || amount <= 0) {
      toast.error("Số xu phải lớn hơn 0.");
      return;
    }
    if (!wdForm.bankName.trim()) {
      toast.error("Vui lòng nhập tên ngân hàng.");
      return;
    }
    if (!wdForm.bankAccount.trim()) {
      toast.error("Vui lòng nhập số tài khoản.");
      return;
    }
    if (!wdForm.bankOwner.trim()) {
      toast.error("Vui lòng nhập tên chủ tài khoản.");
      return;
    }
    setWdSubmitting(true);
    try {
      await httpClient.post(APP_CONFIG.WITHDRAW.CREATE, {
        amount,
        bankName: wdForm.bankName.trim(),
        bankAccount: wdForm.bankAccount.trim(),
        bankOwner: wdForm.bankOwner.trim(),
        note: wdForm.note.trim() || undefined,
      });
      toast.success("Yêu cầu rút tiền đã được gửi! Quản trị viên sẽ xử lý trong 1-3 ngày làm việc.");
      setWdForm({ amount: "", bankName: "", bankAccount: "", bankOwner: "", note: "" });
      setWdSubTab("history");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Không thể tạo yêu cầu rút tiền.");
    } finally {
      setWdSubmitting(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="info-box warning" style={{ marginBottom: 20 }}>
        💡 Yêu cầu quy đổi xu sang tiền mặt. Quản trị viên sẽ xử lý trong vòng <strong>1-3 ngày làm việc</strong>.
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {(
          [
            { k: "form", l: "Tạo yêu cầu" },
            { k: "history", l: "Lịch sử" },
          ] as const
        ).map(({ k, l }) => (
          <button
            key={k}
            className={`tab-btn${wdSubTab === k ? " active" : ""}`}
            onClick={() => setWdSubTab(k)}
          >
            {l}
          </button>
        ))}
      </div>

      {wdSubTab === "form" && (
        <form
          onSubmit={handleWithdraw}
          style={{ background: "#fdfaf7", border: "1.5px solid #ece6dc", borderRadius: 14, padding: "24px" }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#1c1512", display: "block", marginBottom: 6 }}>
                Số xu muốn rút <span style={{ color: "#c23d3f" }}>*</span>
              </label>
              <input
                type="number"
                min={1}
                value={wdForm.amount}
                onChange={(e) => setWdForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="VD: 50000"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #e8e0d6",
                  background: "#fff",
                  fontSize: 14,
                  color: "#1c1512",
                  boxSizing: "border-box",
                }}
              />
              {wdForm.amount && Number(wdForm.amount) > 0 && (
                <div style={{ fontSize: 12, color: "#9e8e82", marginTop: 4 }}>
                  ≈ {formatVnd(Number(wdForm.amount))} (tỉ giá 1 xu = 1đ)
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#1c1512", display: "block", marginBottom: 6 }}>
                Ngân hàng <span style={{ color: "#c23d3f" }}>*</span>
              </label>
              <input
                type="text"
                value={wdForm.bankName}
                onChange={(e) => setWdForm((f) => ({ ...f, bankName: e.target.value }))}
                placeholder="VD: Vietcombank"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #e8e0d6",
                  background: "#fff",
                  fontSize: 14,
                  color: "#1c1512",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#1c1512", display: "block", marginBottom: 6 }}>
                Số tài khoản <span style={{ color: "#c23d3f" }}>*</span>
              </label>
              <input
                type="text"
                value={wdForm.bankAccount}
                onChange={(e) => setWdForm((f) => ({ ...f, bankAccount: e.target.value }))}
                placeholder="VD: 1234567890"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #e8e0d6",
                  background: "#fff",
                  fontSize: 14,
                  color: "#1c1512",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#1c1512", display: "block", marginBottom: 6 }}>
                Chủ tài khoản <span style={{ color: "#c23d3f" }}>*</span>
              </label>
              <input
                type="text"
                value={wdForm.bankOwner}
                onChange={(e) => setWdForm((f) => ({ ...f, bankOwner: e.target.value }))}
                placeholder="VD: NGUYEN VAN A"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #e8e0d6",
                  background: "#fff",
                  fontSize: 14,
                  color: "#1c1512",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#1c1512", display: "block", marginBottom: 6 }}>
              Ghi chú (tuỳ chọn)
            </label>
            <input
              type="text"
              value={wdForm.note}
              onChange={(e) => setWdForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Thông tin thêm cho quản trị viên…"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: "1.5px solid #e8e0d6",
                background: "#fff",
                fontSize: 14,
                color: "#1c1512",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={wdSubmitting}
              className="btn-full btn-red-full"
              style={{ padding: "10px 32px", fontSize: 14, maxWidth: 220, opacity: wdSubmitting ? 0.7 : 1 }}
            >
              {wdSubmitting ? "⏳ Đang gửi…" : "💸 Gửi yêu cầu rút tiền"}
            </button>
          </div>
        </form>
      )}

      {wdSubTab === "history" && (
        <div>
          {wdHistoryLoading ? (
            <div className="empty-state">⏳ Đang tải lịch sử…</div>
          ) : wdHistory.length === 0 ? (
            <div className="empty-state">Chưa có yêu cầu rút tiền nào.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {wdHistory.map((wr: any) => {
                const isPending = wr.status === "PENDING";
                const isApproved = wr.status === "APPROVED";
                const st = isApproved
                  ? { label: "✅ Đã duyệt", color: "#14532d", bg: "#f0fdf4", border: "#86efac" }
                  : !isPending
                  ? { label: "❌ Từ chối", color: "#991b1b", bg: "#fef2f2", border: "#fca5a5" }
                  : { label: "⏳ Chờ duyệt", color: "#92400e", bg: "#fffbeb", border: "#fcd34d" };
                return (
                  <div
                    key={wr.id}
                    style={{
                      background: "#fdfaf7",
                      border: "1.5px solid #ece6dc",
                      borderRadius: 14,
                      padding: "14px 18px",
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#1c1512" }}>
                        🪙 {(wr.amount ?? 0).toLocaleString("vi-VN")} xu
                      </div>
                      <div style={{ fontSize: 12, color: "#9e8e82", marginTop: 2 }}>
                        {wr.bankName} · {wr.bankAccount} · {wr.bankOwner}
                      </div>
                      {wr.note && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>📝 {wr.note}</div>}
                      {wr.rejectedReason && (
                        <div style={{ fontSize: 12, color: "#c23d3f", marginTop: 2 }}>
                          Lý do từ chối: {wr.rejectedReason}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: st.color,
                          background: st.bg,
                          border: `1px solid ${st.border}`,
                          borderRadius: 20,
                          padding: "3px 12px",
                          marginBottom: 4,
                        }}
                      >
                        {st.label}
                      </div>
                      <div style={{ fontSize: 11, color: "#9e8e82" }}>{formatDate(wr.createdAt)}</div>
                      {wr.processedAt && (
                        <div style={{ fontSize: 11, color: "#9e8e82" }}>Xử lý: {formatDate(wr.processedAt)}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
