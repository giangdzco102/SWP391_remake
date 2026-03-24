"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import usePaymentService, { PaymentHistoryItem } from "@/api/usePayment.service";
import { formatCoin, formatDate, formatVnd } from "@/utils/coinShop.utils";
import { STATUS_MAP } from "@/utils/coinShop.constants";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores";

export function TopupHistoryTab({ onRecoverSuccess }: { onRecoverSuccess: () => void }) {
  const [payHistory, setPayHistory] = useState<PaymentHistoryItem[]>([]);
  const [payHistoryLoading, setPayHistoryLoading] = useState(false);
  const [recovering, setRecovering] = useState(false);

  const { getPaymentHistory, recoverPayments } = usePaymentService();
  const { user } = useAuthStore();
  const toast = useToast();

  useEffect(() => {
    if (!user) return;
    setPayHistoryLoading(true);
    getPaymentHistory()
      .then((res: any) => {
        const list: PaymentHistoryItem[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setPayHistory(list);
      })
      .catch(() => {})
      .finally(() => setPayHistoryLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleRecover = async () => {
    if (!user) return;
    setRecovering(true);
    try {
      const res: any = await recoverPayments();
      // Assume the successful response returns the full updated list
      const list: PaymentHistoryItem[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      // Usually, recovery gives the list of affected ones or the new state
      // We will re-fetch history or just check the result
      const recovered = list.filter((i) => i.status === "PAID").length;
      if (recovered > 0) {
        toast.success(`Đã cộng coin cho ${recovered} đơn thành công!`);
        onRecoverSuccess();
        setPayHistory(list);
      } else {
        toast.error("Không tìm thấy đơn nào cần xử lý.");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "";
      toast.error(msg || "Không thể recover. Thử lại sau.");
    } finally {
      setRecovering(false);
    }
  };

  return (
    <div className="fade-in">
      {/* Recover banner */}
      <div className="info-box warning" style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <span>💡 Coin chưa vào sau khi thanh toán? Nhấn <strong>Recover</strong> để kiểm tra lại.</span>
        <button
          className="btn-full btn-red-full"
          style={{ padding: "7px 18px", fontSize: 13, maxWidth: 140, opacity: recovering ? 0.7 : 1 }}
          disabled={recovering}
          onClick={handleRecover}
        >
          {recovering ? "⏳ Đang xử lý..." : "🔄 Recover coin"}
        </button>
      </div>

      {payHistoryLoading ? (
        <div className="empty-state">⏳ Đang tải lịch sử...</div>
      ) : payHistory.length === 0 ? (
        <div className="empty-state">Chưa có đơn nạp coin nào</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {payHistory.map((item) => {
            const st = STATUS_MAP[item.status] ?? STATUS_MAP.PENDING;
            return (
              <div
                key={item.id}
                style={{ background: "#fdfaf7", border: "1.5px solid #ece6dc", borderRadius: 14, padding: "14px 18px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}
              >
                {/* Date + order */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#1c1512" }}>{item.packageName}</div>
                  <div style={{ fontSize: 12, color: "#9e8e82", marginTop: 2 }}>
                    #{item.orderCode} · {formatDate(item.createdAt)}
                  </div>
                  {item.status === "PAID" && item.paidAt && (
                    <div style={{ fontSize: 12, color: "#16a34a", marginTop: 1 }}>✓ Hoàn thành: {formatDate(item.paidAt)}</div>
                  )}
                </div>

                {/* Amount */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#c23d3f" }}>+🪙 {formatCoin(item.coinAmount)}</div>
                  <div style={{ fontSize: 12, color: "#9e8e82" }}>{formatVnd(item.amountVnd)}</div>
                </div>

                {/* Status badge */}
                <div style={{ fontSize: 12, fontWeight: 700, color: st.color, background: st.bg, border: `1px solid ${st.border}`, borderRadius: 20, padding: "3px 10px", flexShrink: 0 }}>
                  {st.label}
                </div>

                {/* Re-open payment link for PENDING */}
                {item.status === "PENDING" && item.checkoutUrl && (
                  <a
                    href={item.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12, fontWeight: 600, color: "#c23d3f", textDecoration: "underline", flexShrink: 0 }}
                  >
                    Mở lại trang thanh toán →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
