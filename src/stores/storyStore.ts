// stores/storyStore.ts
import { create } from "zustand";
import {
  CHAPTER_TEXTS,
  MOCK_CHAPTERS,
  MOCK_REVIEWS,
  MOCK_STORIES,
} from "@/utils/mockData";

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
  categoryId?: number | null;
  updatedAt?: string;
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
  // new API fields
  chapterOrder?: number;
  coinPrice?: number;
  isPurchased?: boolean;
}

interface StoryStore {
  stories: Story[];
  allStories: Story[];
  activeGenre: string;
  likedStories: number[];
  readProgress: Record<string, number>;
  searchQ: string;
  reviews: Review[];
  chapters: Chapter[];
  unlockedChapters: number[];
  fontSize: number;
  selectedChapter: number;
  chapterTexts: Record<number, string[]>;

  setReviews: (reviews: Review[]) => void;
  unlockChapter: (chapterId: number, price: number) => void;
  setSearchQ: (q: string) => void;
  setReadProgress: (chapterId: string, progress: number) => void;
  setStories: (stories: Story[]) => void;
  setAllStories: (stories: Story[]) => void;
  setChapters: (chapters: Chapter[]) => void;
  setActiveGenre: (genre: string) => void;
  toggleLike: (
    id: number,
    showFn?: (msg: string, type: string) => void,
  ) => void;
  setFontSize: (size: number) => void;
  setSelectedChapter: (idx: number) => void;
}

export const useStoryStore = create<StoryStore>((set) => ({
  stories: MOCK_STORIES,
  allStories: MOCK_STORIES,
  activeGenre: "all",
  likedStories: [],
  readProgress: {},
  searchQ: "",
  reviews: MOCK_REVIEWS,
  chapters: [],
  unlockedChapters: [],
  fontSize: 18,
  selectedChapter: 0,
  chapterTexts: CHAPTER_TEXTS,

  setReviews: (reviews) => set({ reviews }),
  unlockChapter: (chapterId) =>
    set((state) => ({
      unlockedChapters: [...state.unlockedChapters, chapterId],
    })),
  setSearchQ: (q) => set({ searchQ: q }),
  setReadProgress: (chapterId, progress) =>
    set((state) => ({
      readProgress: { ...state.readProgress, [chapterId]: progress },
    })),
  setStories: (stories) => set({ stories }),
  setAllStories: (stories) => set({ allStories: stories }),
  setChapters: (chapters) => set({ chapters }),
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
  setFontSize: (size) => set({ fontSize: size }),
  setSelectedChapter: (idx) => set({ selectedChapter: idx }),
}));
