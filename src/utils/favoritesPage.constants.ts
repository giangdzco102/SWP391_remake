export const COVER_GRADIENTS = [
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f7971e,#ffd200)",
  "linear-gradient(135deg,#c471ed,#f64f59)",
];

export const YEARS = [
  "2026", "2025", "2024", "2023", "2022",
  "2021", "2020", "2019", "2018", "2017",
];

export type SortOption = "newest" | "views_desc" | "views_asc";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Mới cập nhật" },
  { value: "views_desc", label: "Lượt đọc ↓" },
  { value: "views_asc", label: "Lượt đọc ↑" },
];
