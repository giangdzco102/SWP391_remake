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

// Lightweight chapter used inside story detail  (matches StoryDetailResponse.chapters)
export interface ChapterSummary {
  id: number;
  title: string;
  chapterOrder: number;
  coinPrice: number;
  isPurchased: boolean;
  status: string;
  publishAt?: string;
  createdAt?: string;
}

// ── Chapter ───────────────────────────────────────────────────────────────
export type ChapterStatus = "DRAFT" | "EDITED" | "PENDING_REVIEW" | "APPROVED" | "PUBLISHED" | "HIDDEN";

export interface Chapter {
  id: number;
  storyId: number;
  storyTitle?: string;
  title: string;
  content: string;
  chapterOrder: number;
  coinPrice: number;
  isPurchased: boolean;
  status: ChapterStatus;
  publishAt?: string;
  reviewNote?: string | null;
  comments?: unknown[];
  totalComments?: number;
  createdAt: string;
  updatedAt: string;
}
// ── EditRequest ───────────────────────────────────────────────────────────
export type EditRequestStatus = "OPEN" | "IN_PROGRESS" | "SUBMITTED" | "APPROVED" | "CANCELLED";

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
  status: EditRequestStatus;
  attemptCount: number;
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

export interface ReaderCommentItem {
  id: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
  parentId?: number | null;
  replies: ReaderCommentItem[];
  user?: { id?: number; fullName?: string; name?: string };
}

export interface ReaderChapterData {
  id: number;
  storyId: number;
  storyTitle: string;
  title: string;
  content: string;
  coinPrice: number;
  chapterOrder: number;
  status: string;
  publishAt: string;
  createdAt: string;
  updatedAt: string;
  isPurchased: boolean;
}
