import { VerifyState } from "@/types/payment";

/** Format số coin theo locale vi-VN */
export function formatCoin(n: number): string {
  return n.toLocaleString("vi-VN");
}

/** Màu border của card theo trạng thái verify */
export function getVerifyBorderColor(state: VerifyState): string {
  if (state === "paid") return "#d1fae5";
  if (state === "cancelled") return "#fca5a5";
  return "#fcd34d";
}

/** Icon emoji theo trạng thái verify */
export function getVerifyIcon(state: VerifyState): string {
  if (state === "paid") return "🎉";
  if (state === "cancelled") return "❌";
  return "⏳";
}

/** Tiêu đề theo trạng thái verify */
export function getVerifyTitle(state: VerifyState, retryCount: number): string {
  if (state === "loading") return "Đang kiểm tra thanh toán...";
  if (state === "paid") return "Thanh toán thành công!";
  if (state === "cancelled") return "Thanh toán đã bị hủy";
  return retryCount >= 5 ? "Đang xử lý chậm" : "Đang xử lý thanh toán...";
}

/** Màu chữ tiêu đề theo trạng thái verify */
export function getVerifyTitleColor(state: VerifyState): string {
  if (state === "paid") return "#14532d";
  if (state === "cancelled") return "#991b1b";
  return "#92400e";
}
