/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useWalletService from "@/api/useWallet.service";
import usePaymentService, { PaymentHistoryItem } from "@/api/usePayment.service";
import { useAuthStore } from "@/stores";

function formatCoin(n: number) {
  return n.toLocaleString("vi-VN");
}

type VerifyState = "loading" | "paid" | "pending" | "cancelled";

function PaymentSuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, setWalletBalance: syncBalance } = useAuthStore();
  const { getWallet } = useWalletService();
  const { verifyPayment } = usePaymentService();

  const orderCode = params.get("orderCode") ?? params.get("order_code") ?? "";

  const [verifyState, setVerifyState] = useState<VerifyState>("loading");
  const [order, setOrder] = useState<PaymentHistoryItem | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const refreshWallet = useCallback(() => {
    if (!user) return;
    getWallet()
      .then((res: any) => {
        const d = res?.data ?? res;
        if (d?.balance != null) {
          setWalletBalance(d.balance);
          syncBalance(d.balance);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const verify = useCallback(() => {
    if (!orderCode || !user) {
      setVerifyState("pending");
      return;
    }
    setVerifyState("loading");
    verifyPayment(orderCode)
      .then((res: any) => {
        const d: PaymentHistoryItem = res?.data ?? res;
        setOrder(d);
        if (d.status === "PAID") {
          setVerifyState("paid");
          refreshWallet();
        } else if (d.status === "CANCELLED") {
          setVerifyState("cancelled");
        } else {
          setVerifyState("pending");
        }
      })
      .catch(() => setVerifyState("pending"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderCode, user, retryCount]);

  // First verify on mount
  useEffect(() => { verify(); }, [verify]);

  // Auto-retry every 3s while PENDING (max 5 times)
  useEffect(() => {
    if (verifyState !== "pending" || retryCount >= 5) return;
    const t = setTimeout(() => setRetryCount((c) => c + 1), 3000);
    return () => clearTimeout(t);
  }, [verifyState, retryCount]);

  const borderColor =
    verifyState === "paid" ? "#d1fae5" :
    verifyState === "cancelled" ? "#fca5a5" : "#fcd34d";

  const icon =
    verifyState === "loading" ? "⏳" :
    verifyState === "paid"    ? "🎉" :
    verifyState === "cancelled" ? "❌" : "⏳";

  const title =
    verifyState === "loading" ? "Đang kiểm tra thanh toán..." :
    verifyState === "paid"    ? "Thanh toán thành công!" :
    verifyState === "cancelled" ? "Thanh toán đã bị hủy" :
    retryCount >= 5 ? "Đang xử lý chậm" : "Đang xử lý thanh toán...";

  const titleColor =
    verifyState === "paid" ? "#14532d" :
    verifyState === "cancelled" ? "#991b1b" : "#92400e";

  return (
    <div
      className="fade-in"
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          background: "#fdfaf7",
          border: `2px solid ${borderColor}`,
          borderRadius: 20,
          padding: "40px 36px",
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        }}
      >
        {/* Icon */}
        <div style={{ fontSize: 64, marginBottom: 16, lineHeight: 1 }}>{icon}</div>

        {/* Title */}
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24,
            fontWeight: 700,
            color: titleColor,
            marginBottom: 8,
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 24 }}>
          {verifyState === "loading" && "Vui lòng chờ trong giây lát..."}
          {verifyState === "paid"    && "Coin đã được cộng vào tài khoản của bạn."}
          {verifyState === "cancelled" && "Giao dịch đã bị hủy. Bạn chưa bị trừ tiền."}
          {verifyState === "pending" && retryCount < 5 && `Đang xác nhận với PayOS... (${retryCount}/5)`}
          {verifyState === "pending" && retryCount >= 5 && "Thanh toán có thể mất thêm vài phút để xử lý. Vui lòng kiểm tra lịch sử nạp coin sau."}
        </p>

        {/* Order info box */}
        {orderCode && (
          <div
            style={{
              background: verifyState === "paid" ? "#f0fdf4" : "#fffbeb",
              border: `1.5px solid ${borderColor}`,
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#9e8e82" }}>Mã đơn hàng</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1c1512" }}>#{orderCode}</span>
            </div>
            {order && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#9e8e82" }}>Gói</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1c1512" }}>{order.packageName}</span>
              </div>
            )}
            {order && verifyState === "paid" && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#9e8e82" }}>Coin nhận được</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#c23d3f" }}>+🪙 {formatCoin(order.coinAmount)}</span>
              </div>
            )}
            {walletBalance !== null && verifyState === "paid" && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#9e8e82" }}>Số dư hiện tại</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#c23d3f" }}>🪙 {formatCoin(walletBalance)}</span>
              </div>
            )}
          </div>
        )}

        {/* Loading spinner */}
        {verifyState === "loading" && (
          <div style={{ marginBottom: 24, fontSize: 13, color: "#9e8e82" }}>⏳ Đang xác minh giao dịch...</div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            className="btn-full btn-red-full"
            style={{ flex: 1, padding: "11px 0", fontSize: 14, maxWidth: 200 }}
            onClick={() => router.push("/coinShopPage")}
          >
            🪙 Về cửa hàng coin
          </button>
          <button
            style={{
              flex: 1,
              maxWidth: 160,
              padding: "11px 0",
              fontSize: 14,
              background: "transparent",
              border: "1.5px solid #e8e0d6",
              borderRadius: 10,
              color: "#6b7280",
              cursor: "pointer",
              fontWeight: 600,
            }}
            onClick={() => router.push("/")}
          >
            Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="empty-state">⏳ Đang xử lý...</div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
