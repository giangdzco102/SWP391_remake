import type { NotificationResponse } from "@/api/useNotification.service";

export const NOTIF_BG: Record<string, string> = {
  NEW_CHAPTER:      "#dbeafe",
  STORY_APPROVED:   "#d4edda",
  STORY_REJECTED:   "#fde8e8",
  CHAPTER_APPROVED: "#d4edda",
  CHAPTER_REJECTED: "#fde8e8",
  GIFT_RECEIVED:    "#fffbeb",
  SYSTEM:           "#f0f0f0",
};

export const NOTIF_ICON: Record<string, string> = {
  NEW_CHAPTER:      "📖",
  STORY_APPROVED:   "✓",
  STORY_REJECTED:   "✕",
  CHAPTER_APPROVED: "✓",
  CHAPTER_REJECTED: "✕",
  GIFT_RECEIVED:    "🎁",
  SYSTEM:           "📢",
};

export const NOTIF_LABEL: Record<string, string> = {
  NEW_CHAPTER:      "Chương mới",
  STORY_APPROVED:   "Truyện duyệt",
  STORY_REJECTED:   "Bị từ chối",
  CHAPTER_APPROVED: "Chương duyệt",
  CHAPTER_REJECTED: "Chương bị từ chối",
  GIFT_RECEIVED:    "Nhận quà",
  SYSTEM:           "Hệ thống",
};

/** Trả về đường dẫn trang liên quan của thông báo, hoặc null nếu không có */
export function getNotificationLink(n: NotificationResponse): string | null {
  const { type, refType, refId } = n;
  if (!refId) return null;
  switch (type) {
    case "NEW_CHAPTER":
      if (refType === "STORY") return `/storyDetailPage?id=${refId}`;
      return null;
    case "STORY_APPROVED":
    case "STORY_REJECTED":
    case "CHAPTER_APPROVED":
    case "CHAPTER_REJECTED":
    case "GIFT_RECEIVED":
      return "/myStoriesPage";
    default:
      return null;
  }
}
