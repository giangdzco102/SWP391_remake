// stores/notificationStore.ts
import { create } from "zustand";

interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  storyId?: number;
}

interface NotificationStore {
  notifications: Notification[];

  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAllRead: () => void;
  markOneRead: (id: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],

  setNotifications: (notifications) =>
    set({
      notifications
    }),

  addNotification: (notification) =>
    set((state) => {
      const notifications = [notification, ...state.notifications];
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    }),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  markOneRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      return {
        notifications,
      };
    }),
}));
