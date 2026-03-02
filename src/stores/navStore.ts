/* eslint-disable @typescript-eslint/no-explicit-any */
// stores/navStore.ts
import { create } from "zustand";

interface NavStore {
  page: string;
  selectedStory: any | null;
  navTo: (page: string) => void;
  gotoStory: (story: any) => void;
}

export const useNavStore = create<NavStore>((set) => ({
  page: "home",
  selectedStory: null,
  navTo: (page) => {
    set({ page });
    window.scrollTo(0, 0);
  },
  gotoStory: (story) => {
    set({ selectedStory: story, page: "story" });
    window.scrollTo(0, 0);
  },
}));
