/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import useHttpClient from "./useHttpClient";

export interface NotificationResponse {
  id: number;
  type: "NEW_CHAPTER" | "STORY_APPROVED" | "STORY_REJECTED" | "CHAPTER_APPROVED" | "CHAPTER_REJECTED" | "GIFT_RECEIVED" | "SYSTEM";
  title: string;
  message: string;
  refId: number | null;
  refType: "CHAPTER" | "STORY" | "GIFT" | "SYSTEM" | null;
  isRead: boolean;
  createdAt: string;
}

const useNotificationService = () => {
  const httpClient = useHttpClient();

  /** GET /notifications — lấy tất cả thông báo (mới nhất trước) */
  const getNotifications = (): Promise<NotificationResponse[]> =>
    httpClient.get<NotificationResponse[]>(APP_CONFIG.NOTIFICATION.LIST);

  /** GET /notifications/unread-count — số thông báo chưa đọc */
  const getUnreadCount = (): Promise<{ count: number }> =>
    httpClient.get<{ count: number }>(APP_CONFIG.NOTIFICATION.UNREAD_COUNT);

  /** PUT /notifications/mark-all-read — đánh dấu tất cả đã đọc */
  const markAllRead = (): Promise<any> =>
    httpClient.put(APP_CONFIG.NOTIFICATION.MARK_ALL, {});

  /** PUT /notifications/{id}/read — đánh dấu 1 thông báo đã đọc */
  const markOneRead = (id: number | string): Promise<NotificationResponse> =>
    httpClient.put<NotificationResponse>(APP_CONFIG.NOTIFICATION.MARK_ONE(id), {});

  /** DELETE /notifications/{id} — xóa thông báo */
  const deleteNotification = (id: number | string): Promise<any> =>
    httpClient.delete(APP_CONFIG.NOTIFICATION.DELETE(id), {});

  return { getNotifications, getUnreadCount, markAllRead, markOneRead, deleteNotification };
};

export default useNotificationService;
