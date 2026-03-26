import { useTheme } from "@/contexts/ThemeContext";

export function useReaderTheme() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const dk = {
    bg: isDark ? "#0f0e0c" : "transparent",
    surface: isDark ? "#1c1814" : "#fff",
    surfaceMid: isDark ? "#1a1614" : "#fdfaf7",
    border: isDark ? "#2e2820" : "#e8e0d6",
    borderMid: isDark ? "#2e2820" : "#ece6dd",
    text: isDark ? "#e8ddd5" : "#1c1512",
    textSub: isDark ? "#c8bcb0" : "#3d2f28",
    textMuted: isDark ? "#6b5a4e" : "#b0a096",
    textFaint: isDark ? "#4a3f38" : "#9e8e82",
    navBtn: isDark ? "#1c1814" : "#fff",
    navBtnText: isDark ? "#b0a096" : "#6b5a4e",
    navBtnActive: isDark ? "#2a1515" : "#fde8e8",
    navBtnActTxt: isDark ? "#e8726a" : "#c23d3f",
    navBtnActBdr: isDark ? "#5c2a2a" : "#c23d3f",
    inputBg: isDark ? "#1c1814" : "#fdfaf7",
    locked: isDark ? "#1c1814" : "#fff",
    lockedCoin: isDark ? "#241e0f" : "#fffbeb",
    lockedCoinBdr: isDark ? "#4a3a10" : "#fcd34d",
    modalBg: isDark ? "#1c1814" : "#fff",
    giftDrop: isDark ? "#1c1814" : "#fff",
    giftDropBdr: isDark ? "#3a3028" : "#e8e0d6",
    sendBtn: isDark ? "#2a1a1a" : "#f3f4f6",
    sendBtnTxt: isDark ? "#6b5a4e" : "#9ca3af",
    reportBtn: isDark ? "#1c1814" : "transparent",
    reportBdr: isDark ? "#3a3028" : "#e8e0d6",
    reportTxt: isDark ? "#6b5a4e" : "#9ca3af",
  };

  return { isDark, dk };
}
