// stores/storyStore.ts
import { create } from "zustand";
import { MOCK_CHAPTERS, MOCK_REVIEWS, MOCK_STORIES } from "@/utils/mockData";

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

interface Review {
  id: number;
  user: string;
  avatar: string;
  avatarColor: string;
  isReviewer: boolean;
  rating: number;
  date: string;
  chapter: number;
  content: string;
  likes: number;
  aspects: Record<string, number>;
}

interface Chapter {
  id: number;
  title: string;
  words: number;
  readTime: string;
  publishedAt?: string;
  locked?: boolean;
  price?: number;
}

interface StoryStore {
  stories: Story[];
  allStories: Story[];
  activeGenre: string;
  likedStories: number[];
  readProgress: Record<string, number>;
  searchQ: string;
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;

  chapters: Chapter[];

  unlockedChapters: Set<number>;
  unlockChapter: (chapterId: number, price: number) => void;
  setSearchQ: (q: string) => void;
  setReadProgress: (chapterId: string, progress: number) => void;
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
  readProgress: {},
  searchQ: "",
  reviews: MOCK_REVIEWS,
  setReviews: (reviews) => set({ reviews }),
  chapters: MOCK_CHAPTERS,
  unlockedChapters: new Set(),
  unlockChapter: (chapterId, price) =>
    set((state) => ({
      unlockedChapters: new Set([...state.unlockedChapters, chapterId]),
    })),
  setSearchQ: (q) => set({ searchQ: q }),
  setReadProgress: (chapterId, progress) =>
    set((state) => ({
      readProgress: { ...state.readProgress, [chapterId]: progress },
    })),
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
