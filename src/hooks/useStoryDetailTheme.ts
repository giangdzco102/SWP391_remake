import { useTheme } from "@/contexts/ThemeContext";

export function useStoryDetailTheme() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const dk = {
    surface: isDark ? "#1c1814" : "#fff",
    surfaceMid: isDark ? "#1a1614" : "#fdfaf7",
    border: isDark ? "#2e2820" : "#e8e0d6",
    borderMid: isDark ? "#2a2420" : "#ece6dc",
    borderLight: isDark ? "#26201a" : "#f0ebe3",
    borderTable: isDark ? "#26201a" : "#f5ede4",
    text: isDark ? "#e8ddd5" : "#1c1512",
    textSub: isDark ? "#c8bcb0" : "#3d2f28",
    textSub2: isDark ? "#a09080" : "#6b5a4e",
    textMuted: isDark ? "#6b5a4e" : "#b0a096",
    textFaint: isDark ? "#5a4f48" : "#9e8e82",
    sep: isDark ? "#3a3028" : "#ddd",
    sep2: isDark ? "#3a3028" : "#e0d8d0",
    starOff: isDark ? "#3a3028" : "#e5ddd5",
    starOff2: isDark ? "#3a3028" : "#d1c9be",
    disabledBg: isDark ? "#2a2420" : "#f3f4f6",
    disabledBg2: isDark ? "#2a2420" : "#e5ddd5",
    disabledTxt: isDark ? "#4a3f38" : "#9ca3af",
    chNum: isDark ? "#5a4b38" : "#c9b89a",
    lockedItem: isDark ? "#1e1a14" : "#fdf7f0",
    lockedBdr: isDark ? "#3a3020" : "#f0dfc8",
    giftBg: isDark ? "#211d10" : "#fef9ee",
    giftBdr: isDark ? "#4a3a10" : "#f0daa8",
    coinBg: isDark ? "#241e0f" : "#fffbeb",
    coinBdr: isDark ? "#4a3a10" : "#fcd34d",
    ratingCard: isDark ? "#1a1614" : "#fdfaf7",
    ratingBdr: isDark ? "#5c2a2a" : "#f0b4b5",
    blockBtn: isDark ? "#1c1814" : "#fff8f8",
    blockBdr: isDark ? "#3a2a2a" : "#e5ddd5",
  };

  return { isDark, dk };
}
