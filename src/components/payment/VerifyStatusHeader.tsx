"use client";
import { VerifyState } from "@/types/payment";
import {
  getVerifyIcon,
  getVerifyTitle,
  getVerifyTitleColor,
} from "@/utils/payment.utils";

interface VerifyStatusHeaderProps {
  verifyState: VerifyState;
  retryCount: number;
}

/**
 * Hiển thị icon, tiêu đề, và subtitle theo trạng thái xác minh thanh toán.
 */
export function VerifyStatusHeader({ verifyState, retryCount }: VerifyStatusHeaderProps) {
  const icon = getVerifyIcon(verifyState);
  const title = getVerifyTitle(verifyState, retryCount);
  const titleColor = getVerifyTitleColor(verifyState);

  return (
    <>
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
        {verifyState === "paid" && "Coin đã được cộng vào tài khoản của bạn."}
        {verifyState === "cancelled" && "Giao dịch đã bị hủy. Bạn chưa bị trừ tiền."}
        {verifyState === "pending" && retryCount < 5 && `Đang xác nhận với PayOS... (${retryCount}/5)`}
        {verifyState === "pending" && retryCount >= 5 &&
          "Thanh toán có thể mất thêm vài phút để xử lý. Vui lòng kiểm tra lịch sử nạp coin sau."}
      </p>

      {/* Loading indicator */}
      {verifyState === "loading" && (
        <div style={{ marginBottom: 24, fontSize: 13, color: "#9e8e82" }}>
          ⏳ Đang xác minh giao dịch...
        </div>
      )}
    </>
  );
}
