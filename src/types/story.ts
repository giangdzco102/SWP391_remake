// ── Category ──────────────────────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  description?: string;
}

// ── Author (nested inside Story) ──────────────────────────────────────────
export interface StoryAuthor {
  id: number;
  fullName: string;
  avatarUrl?: string;
}

// ── Story ─────────────────────────────────────────────────────────────────
export type StoryStatus = "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED";

export interface Story {
  id: number;
  title: string;
  description?: string;
  coverUrl?: string;
  status: StoryStatus;
  viewCount: number;
  totalChapters?: number;
  author: StoryAuthor;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

// Detail includes more info (e.g. chapters list)
export interface StoryDetail extends Story {
  chapters?: ChapterSummary[];
}

// Lightweight chapter used inside story detail
export interface ChapterSummary {
  id: number;
  title: string;
  chapterNumber: number;
  isPaid: boolean;
  price?: number;
  status: string;
  createdAt: string;
}

// ── Chapter ───────────────────────────────────────────────────────────────
export type ChapterStatus = "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED";

export interface Chapter {
  id: number;
  storyId: number;
  title: string;
  content: string;
  chapterNumber: number;
  isPaid: boolean;
  price?: number;
  status: ChapterStatus;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ── Comment ───────────────────────────────────────────────────────────────
export interface CommentUser {
  id: number;
  fullName: string;
  avatarUrl?: string;
}

export interface Comment {
  id: number;
  chapterId: number;
  user: CommentUser;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

// ── Query params ──────────────────────────────────────────────────────────
export interface StoryListParams {
  page?: number;
  size?: number;
  sort?: string;
  categoryId?: number;
  status?: StoryStatus;
}

export interface StorySearchParams {
  keyword: string;
  page?: number;
  size?: number;
  categoryId?: number;
}

export interface CommentListParams {
  page?: number;
  size?: number;
}
