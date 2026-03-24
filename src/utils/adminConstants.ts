import { AdminIcon } from "../components/icons/AdminIcons";

export const TABS = [
  { id: "overview", label: "Tổng quan", icon: AdminIcon.Dashboard },
  { id: "users", label: "Người dùng", icon: AdminIcon.Users },
  { id: "stories", label: "Truyện chờ", icon: AdminIcon.Book },
  { id: "reports", label: "Báo cáo", icon: AdminIcon.Flag },
  { id: "roles", label: "Yêu cầu role", icon: AdminIcon.Shield },
  { id: "withdraws", label: "Rút tiền", icon: AdminIcon.Wallet },
  { id: "missions", label: "Nhiệm vụ", icon: AdminIcon.Target },
  { id: "system-ops", label: "Vận hành", icon: AdminIcon.Settings },
  { id: "coins", label: "Hệ thống Coin", icon: AdminIcon.Coin },
];

export const MISSION_TYPES: Record<string, string> = {
  DAILY: "Hàng ngày",
  READ: "Đọc truyện",
  READ_CHAPTER: "Đọc chapter",
  COMMENT: "Bình luận",
  FOLLOW_STORY: "Theo dõi truyện",
  PURCHASE_CHAPTER: "Mua chapter",
  WRITE_CHAPTER: "Viết chapter",
};

export const TYPE_COLOR: Record<string, string> = {
  STORY: "#ff500a",
  CHAPTER: "#2563eb",
  COMMENT: "#d97706",
};

export const TYPE_LABEL: Record<string, string> = {
  STORY: "Truyện",
  CHAPTER: "Chương",
  COMMENT: "Bình luận",
};

export const STATUS_MAP: Record<string, { bg: string; color: string; label: string }> = {
  PENDING: { bg: "#fef3c7", color: "#92400e", label: "Chờ duyệt" },
  APPROVED: { bg: "#d1fae5", color: "#065f46", label: "Đã duyệt" },
  REJECTED: { bg: "#fee2e2", color: "#991b1b", label: "Từ chối" },
  RESOLVED: { bg: "#dbeafe", color: "#1e40af", label: "Đã xử lý" },
  PUBLISHED: { bg: "#d1fae5", color: "#065f46", label: "Đã xuất bản" },
  DRAFT: { bg: "#f3f4f6", color: "#374151", label: "Bản nháp" },
  true: { bg: "#d1fae5", color: "#065f46", label: "Hoạt động" },
  false: { bg: "#fee2e2", color: "#991b1b", label: "Bị khóa" },
};

export const ALL_RESOLVE_ACTIONS = [
  {
    value: "WARN_ONLY",
    label: "⚠️ Cảnh báo",
    desc: "Đánh dấu đã xử lý, gửi cảnh báo đến người vi phạm",
    targets: ["STORY", "CHAPTER", "COMMENT"],
  },
  {
    value: "HIDE_CONTENT",
    label: "🙈 Ẩn nội dung",
    desc: "Ẩn nội dung vi phạm khỏi người dùng",
    targets: ["STORY", "CHAPTER", "COMMENT"],
  },
  {
    value: "DELETE_CONTENT",
    label: "🗑 Xóa nội dung",
    desc: "Xóa vĩnh viễn nội dung vi phạm",
    targets: ["STORY", "CHAPTER", "COMMENT"],
  },
  {
    value: "BAN_USER",
    label: "🔒 Khóa tài khoản",
    desc: "Khóa tài khoản tác giả, không ẩn nội dung",
    targets: ["STORY", "CHAPTER", "COMMENT"],
  },
  {
    value: "HIDE_AND_BAN",
    label: "🙈🔒 Ẩn + Khóa TK",
    desc: "Ẩn nội dung vi phạm và khóa tài khoản tác giả",
    targets: ["STORY", "CHAPTER"],
  },
  {
    value: "DELETE_AND_BAN",
    label: "🗑🔒 Xóa + Khóa TK",
    desc: "Xóa nội dung vi phạm và khóa tài khoản tác giả",
    targets: ["STORY", "CHAPTER", "COMMENT"],
  },
];

export const BAN_OPTIONS = [
  { v: 1, l: "1 ngày" },
  { v: 3, l: "3 ngày" },
  { v: 7, l: "7 ngày" },
  { v: 30, l: "30 ngày" },
  { v: -1, l: "Vĩnh viễn" },
];

export const ALL_ROLES = ["READER", "AUTHOR", "REVIEWER", "EDITOR", "ADMIN"];
