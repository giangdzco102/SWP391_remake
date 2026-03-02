// stores/storyStore.ts
import { create } from "zustand";
import { MOCK_STORIES } from "@/utils/mockData";

interface Story {
  id: number;
  title: string;
  author: string;
  penName: string;
  cover: string;
  genre: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  reads: string;
  views: number;
  favorites: number;
  chapters: number;
  description: string;
  status: string;
  featured: boolean;
  excerpt: string;
}

interface StoryStore {
  stories: Story[];
  allStories: Story[];
  activeGenre: string;
  likedStories: number[];

  setStories: (stories: Story[]) => void;
  setActiveGenre: (genre: string) => void;
  toggleLike: (
    id: number,
    showFn?: (msg: string, type: string) => void,
  ) => void;
}

export const useStoryStore = create<StoryStore>((set) => ({
  stories: MOCK_STORIES,
  allStories: MOCK_STORIES,
  activeGenre: "all",
  likedStories: [],

  setStories: (stories) => set({ stories }),
  setActiveGenre: (genre) => set({ activeGenre: genre }),
  toggleLike: (id, showFn) =>
    set((state) => {
      const isLiked = state.likedStories.includes(id);
      showFn?.(
        isLiked ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích ❤",
        isLiked ? "info" : "success",
      );
      return {
        likedStories: isLiked
          ? state.likedStories.filter((x) => x !== id)
          : [...state.likedStories, id],
      };
    }),
}));
