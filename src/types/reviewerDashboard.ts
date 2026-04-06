export interface StoryItem {
  id: number;
  title: string;
  authorId: number;
  authorName: string;
  description?: string;
  summary?: string;
  coverUrl?: string;
  categoryIds?: number[];
  categoryNames?: string[];
  status: string;
  createdAt: string;
  chapterCount?: number;
}

export interface ChapterItem {
  id: number;
  title: string;
  storyId: number;
  storyTitle: string;
  authorName?: string;
  chapterOrder: number;
  content: string;
  coinPrice: number;
  status: string;
  createdAt: string;
}

export interface ReviewHistoryItem {
  id: number;
  reviewerId?: number;
  reviewerName?: string;
  targetType: "STORY" | "CHAPTER";
  targetId: number;
  targetTitle: string;
  storyTitle?: string;
  action: "APPROVE" | "REJECT";
  note?: string;
  currentStatus?: string;
  createdAt: string;
}
