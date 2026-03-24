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

export interface ChapterDetail {
  id: number;
  title: string;
  content: string;
  chapterOrder: number;
  coinPrice: number;
  storyTitle?: string;
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

export interface VersionItem {
  id: number;
  content: string;
  editorNote?: string;
  createdAt: string;
}
