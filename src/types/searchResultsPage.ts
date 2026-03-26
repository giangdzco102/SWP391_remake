export type SortKey = "relevant" | "views" | "rating" | "chapters";

export type StorySearchResult = {
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
  status: "done" | "ongoing";
  featured: boolean;
  excerpt: string;
  updatedAt: string;
};
