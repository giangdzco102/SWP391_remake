import { create } from "zustand";
import { DataGetMe } from "@/types/auth";

interface AuthState {
  user: DataGetMe | null;
  isLoading: boolean;
}

interface AuthActions {
  setUser: (user: DataGetMe | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()((set, get) => ({
  // State
  user: null,
  isLoading: false,

  setUser: (user: DataGetMe | null) => {
    set({ user });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
