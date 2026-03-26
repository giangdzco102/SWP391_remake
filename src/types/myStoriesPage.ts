export interface EditRequest {
  id: number;
  chapterId: number;
  chapterTitle: string;
  storyTitle: string;
  authorId: number;
  authorName: string;
  editorId?: number;
  editorName?: string;
  coinReward: number;
  description?: string;
  editedContent?: string;
  editorNote?: string;
  authorNote?: string;
  status: "OPEN" | "IN_PROGRESS" | "SUBMITTED" | "APPROVED" | "CANCELLED";
  attemptCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoryItem {
  id: number;
  title: string;
  summary?: string;
  description?: string;
  coverUrl?: string;
  status: string;
  viewCount: number;
  totalChapterCount?: number;
  publishedChapterCount?: number;
  totalChapters?: number;
  avgRating?: number;
  ratingCount?: number;
  followCount?: number;
  isCompleted?: boolean;
  isDeleted?: boolean;
  reviewNote?: string;
  authorId?: number;
  authorName?: string;
  author?: { id: number; fullName: string };
  categories?: { id: number; name: string }[];
  categoryIds?: number[];
  categoryNames?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChapterItem {
  id: number;
  title: string;
  chapterOrder: number;
  wordCount?: number;
  content?: string;
  status: string;
  coinPrice?: number;
  viewCount?: number;
  reviewNote?: string;
  publishAt?: string;
  createdAt: string;
}

export interface WalletInfo {
  balance: number;
  lockedBalance: number;
}

export interface WalletTx {
  id: number;
  type: string;
  amount: number;
  description?: string;
  createdAt: string;
}

export interface CategoryItem {
  id: number;
  name: string;
}
