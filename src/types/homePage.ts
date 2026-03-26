export type SortOrder = "views_desc" | "views_asc" | "updated_desc";

export interface FilterState {
  genres: string[];
  years: number[];
  status: "all" | "done" | "ongoing";
  sort: SortOrder;
}

export interface StoryShape {
  id: number;
  title: string;
  author: string;
  penName: string;
  cover: string;
  coverUrl: string;
  genre: string;
  categoryId: number | null;
  tags: string[];
  rating: number;
  reviewCount: number;
  reads: string;
  views: number;
  favorites: number;
  chapters: number;
  description: string;
  status: "done" | "ongoing";
  featured: boolean;
  excerpt: string;
  updatedAt: string;
}
