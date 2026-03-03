/* eslint-disable @typescript-eslint/no-explicit-any */
// stores/navStore.ts
import { create } from "zustand";

interface NavStore {
  page: string;
  selectedStory: any | null;
  navTo: (page: string) => void;
  setSelectedStory: (story: any) => void;
}

export const useNavStore = create<NavStore>((set) => ({
  page: "homePage",
  selectedStory: null,
  navTo: (page) => {
    set({ page });
    window.scrollTo(0, 0);
  },
  setSelectedStory: (story) => set({ selectedStory: story }),
}));
