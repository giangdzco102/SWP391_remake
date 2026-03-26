import { create } from "zustand";
import { DataGetMe } from "@/types/auth";

interface AuthState {
  user: DataGetMe | null;
  isLoading: boolean;
}

interface AuthActions {
  setUser: (user: DataGetMe | null) => void;
  setLoading: (loading: boolean) => void;
  updateBalance: (amount: number) => void;
  setWalletBalance: (balance: number) => void;
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

  updateBalance: (amount: number) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, walletBalance: user.walletBalance - amount } });
    }
  },

  setWalletBalance: (balance: number) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, walletBalance: balance } });
    }
  },
}));
