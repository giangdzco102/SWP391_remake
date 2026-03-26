"use client";
import { PaymentHistoryItem } from "@/api/usePayment.service";
import { VerifyState } from "@/types/payment";
import { formatCoin, getVerifyBorderColor } from "@/utils/payment.utils";

interface SuccessOrderInfoBoxProps {
  orderCode: string;
  verifyState: VerifyState;
  order: PaymentHistoryItem | null;
  walletBalance: number | null;
}

/**
 * Box hiển thị chi tiết đơn hàng: mã đơn, tên gói, coin nhận, số dư ví.
 */
export function SuccessOrderInfoBox({
  orderCode,
  verifyState,
  order,
  walletBalance,
}: SuccessOrderInfoBoxProps) {
  const borderColor = getVerifyBorderColor(verifyState);

  return (
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
      {/* Mã đơn hàng */}
      <div
        style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}
      >
        <span style={{ fontSize: 13, color: "#9e8e82" }}>Mã đơn hàng</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1c1512" }}>
          #{orderCode}
        </span>
      </div>

      {/* Gói */}
      {order && (
        <div
          style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}
        >
          <span style={{ fontSize: 13, color: "#9e8e82" }}>Gói</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1c1512" }}>
            {order.packageName}
          </span>
        </div>
      )}

      {/* Coin nhận được */}
      {order && verifyState === "paid" && (
        <div
          style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}
        >
          <span style={{ fontSize: 13, color: "#9e8e82" }}>Coin nhận được</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#c23d3f" }}>
            +🪙 {formatCoin(order.coinAmount)}
          </span>
        </div>
      )}

      {/* Số dư hiện tại */}
      {walletBalance !== null && verifyState === "paid" && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "#9e8e82" }}>Số dư hiện tại</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#c23d3f" }}>
            🪙 {formatCoin(walletBalance)}
          </span>
        </div>
      )}
    </div>
  );
}
