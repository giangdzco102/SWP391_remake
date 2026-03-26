import { FilterState, SortOrder } from "@/types/homePage";

export const PAGE_SIZE = 18;
export const HOT_FETCH_SIZE = 50;
export const HOT_DISPLAY_LIMIT = 12;
export const TOP5_LIMIT = 5;

const CURRENT_YEAR = new Date().getFullYear();

export const COVER_GRADIENTS = [
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  "linear-gradient(135deg,#ffecd2,#fcb69f)",
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f7971e,#ffd200)",
];

export const RANK_COLORS = [
  "linear-gradient(135deg,#f7d000,#e59400)",
  "linear-gradient(135deg,#c0c0c0,#909090)",
  "linear-gradient(135deg,#cd7f32,#a0522d)",
];

export const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

export const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "updated_desc", label: "Mới cập nhật" },
  { value: "views_desc", label: "Lượt đọc ↓" },
  { value: "views_asc", label: "Lượt đọc ↑" },
];

export const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "ongoing", label: "Đang ra" },
  { value: "done", label: "Hoàn thành" },
] as const;

export const DEFAULT_FILTERS: FilterState = {
  genres: [],
  years: [],
  status: "all",
  sort: "updated_desc",
};
