import { TabKey } from "@/types/profilePage";

export const ROLE_LABEL: Record<string, string> = {
  REVIEWER: "Reviewer",
  AUTHOR: "Tác giả",
  EDITOR: "Editor",
  READER: "Độc giả",
};

export const ROLE_CHIP_CLASS: Record<string, string> = {
  REVIEWER: "chip-role-reviewer",
  AUTHOR:   "chip-role-author",
  EDITOR:   "chip-role-editor",
  READER:   "chip-role-reader",
};

export const ROLE_ICON: Record<string, string> = {
  REVIEWER: "🔍",
  AUTHOR:   "✍️",
  EDITOR:   "📝",
  READER:   "👤",
};

export const COIN_PER_PAGE = 10;

export const TX_TYPE_MAP: Record<string, { label: string; type: "earn" | "spend" }> = {
  TOPUP:        { label: "Nạp coin",         type: "earn"  },
  BUY:          { label: "Mua chương VIP",   type: "spend" },
  GIFT_SENT:    { label: "Tặng quà",         type: "spend" },
  GIFT_RECEIVED:{ label: "Nhận quà",         type: "earn"  },
  REWARD:       { label: "Thưởng duyệt bài", type: "earn"  },
  EDIT_REWARD:  { label: "Thưởng biên tập",  type: "earn"  },
  WITHDRAW:     { label: "Rút tiền",         type: "spend" },
};

export const PROFILE_TABS: { key: TabKey; label: string }[] = [
  { key: "info",    label: "Thông tin" },
  { key: "stories", label: "Tác phẩm" },
  { key: "reviews", label: "Đánh giá" },
  { key: "coins",   label: "Lịch sử coin" },
  { key: "withdraw", label: "Rút tiền" },
];
