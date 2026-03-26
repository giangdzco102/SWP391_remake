export interface RankedStory {
  id: string | number;
  title: string;
  author: string;
  penName: string;
  cover: string;
  genre: string;
  rating: number;
  reads: string | number;
  views: number;
  favorites: number;
  chapters: number;
  status: "done" | "ongoing";
}
