/* eslint-disable @typescript-eslint/no-explicit-any */
// stores/navStore.ts
import { create } from "zustand";

interface NavStore {
  page: string;
  selectedStory: any | null;
  selectedChapterId: number | null;
  navTo: (page: string) => void;
  setSelectedStory: (story: any) => void;
  setSelectedChapterId: (id: number | null) => void;
}

export const useNavStore = create<NavStore>((set) => ({
  page: "homePage",
  selectedStory: null,
  selectedChapterId: null,
  navTo: (page) => {
    set({ page });
    window.scrollTo(0, 0);
  },
  // Reset selectedChapterId whenever a new story is selected
  setSelectedStory: (story) => set({ selectedStory: story, selectedChapterId: null }),
  setSelectedChapterId: (id) => set({ selectedChapterId: id }),
}));
