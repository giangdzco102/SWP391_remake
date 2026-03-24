import { CoinPackage } from "@/api/usePayment.service";

export const STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PENDING:   { label: "Đang xử lý", color: "#92400e", bg: "#fffbeb", border: "#fcd34d" },
  PAID:      { label: "Thành công",  color: "#14532d", bg: "#f0fdf4", border: "#86efac" },
  CANCELLED: { label: "Đã hủy",     color: "#991b1b", bg: "#fef2f2", border: "#fca5a5" },
};

export const TX_TYPE_MAP: Record<string, { label: string; type: "earn" | "spend" }> = {
  TOPUP:                 { label: "Nạp coin",               type: "earn"  },
  BUY:                   { label: "Mua chương VIP",         type: "spend" },
  BUY_CHAPTER:           { label: "Mua chương",             type: "spend" },
  GIFT_SENT:             { label: "Tặng quà",               type: "spend" },
  GIFT_RECEIVED:         { label: "Nhận quà",               type: "earn"  },
  REWARD:                { label: "Thưởng duyệt bài",       type: "earn"  },
  EDIT_REWARD:           { label: "Thưởng biên tập",        type: "earn"  },
  LOCKED:                { label: "Tạm giữ coin",           type: "spend" },
  RELEASE:               { label: "Giải phóng coin",        type: "earn"  },
  EDIT_REWARD_PAID:      { label: "Thanh toán biên tập",    type: "spend" },
  EDIT_REWARD_RECEIVED:  { label: "Nhận thưởng biên tập",  type: "earn"  },
};

export const FALLBACK_PACKAGES: CoinPackage[] = [
  { id: "BASIC",    displayName: "Gói Cơ Bản",       amountVnd: 10000,  coinAmount: 10000,  bonusPercent: 0  },
  { id: "SAVING",   displayName: "Gói Tiết Kiệm",    amountVnd: 50000,  coinAmount: 56000,  bonusPercent: 12 },
  { id: "POPULAR",  displayName: "Gói Phổ Biến ⭐",  amountVnd: 100000, coinAmount: 118000, bonusPercent: 18 },
  { id: "ADVANCED", displayName: "Gói Nâng Cao",     amountVnd: 200000, coinAmount: 244000, bonusPercent: 22 },
  { id: "VIP",      displayName: "Gói VIP",           amountVnd: 500000, coinAmount: 650000, bonusPercent: 30 },
];
