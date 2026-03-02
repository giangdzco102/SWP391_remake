import { ModalType } from "@/types/global";
import { create } from "zustand";
interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: number;
}
interface AppState {
  notiAuth: boolean;
  notifications: Notification[];
  loading: boolean;
  modal: ModalType;
}

interface AppActions {
  toggleNotiAuth: (open: boolean) => void;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp">
  ) => void;
  setLoading: (loading: boolean) => void;
  changeModal: (modal: ModalType) => void;
}

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  // State
  notiAuth: false,
  notifications: [],
  loading: false,
  modal: ModalType.AGENT,

  // Setters
  setLoading: (loading: boolean) => {
    set({ loading });
  },
  // Actions
  toggleNotiAuth: (open: boolean) => {
    set({ notiAuth: open });
  },
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));
  },
  changeModal: (modal) => {
    set({ modal });
  },
}));
