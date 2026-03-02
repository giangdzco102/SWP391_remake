// Theme types
export type Theme = "light" | "dark";

// CSS Variables mapping
export interface ThemeColors {
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;

  // Text colors
  foreground: string;
  foregroundSecondary: string;
  foregroundMuted: string;

  // Border colors
  border: string;
  borderSecondary: string;

  // Primary colors
  primary: string;
  primaryHover: string;
  primaryActive: string;

  // Success colors
  success: string;
  successHover: string;

  // Warning colors
  warning: string;
  warningHover: string;

  // Error colors
  error: string;
  errorHover: string;

  // Card & Surface
  cardBg: string;
  cardShadow: string;

  // Input
  inputBg: string;
  inputBorder: string;
  inputFocusBorder: string;
}
