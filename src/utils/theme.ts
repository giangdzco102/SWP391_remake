/**
 * Theme utility functions
 */

/**
 * Get current theme from localStorage or system preference
 */
export function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";

  const storedTheme = localStorage.getItem("fdm-theme");
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  // Check system preference
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: "light" | "dark"): void {
  if (typeof window === "undefined") return;

  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

/**
 * Get a CSS variable value
 */
export function getCSSVariable(variable: string): string {
  if (typeof window === "undefined") return "";

  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
}

/**
 * Set a CSS variable value
 */
export function setCSSVariable(variable: string, value: string): void {
  if (typeof window === "undefined") return;

  document.documentElement.style.setProperty(variable, value);
}

/**
 * Get all theme colors
 */
export function getAllThemeColors() {
  return {
    background: getCSSVariable("--background"),
    backgroundSecondary: getCSSVariable("--background-secondary"),
    backgroundTertiary: getCSSVariable("--background-tertiary"),
    foreground: getCSSVariable("--foreground"),
    foregroundSecondary: getCSSVariable("--foreground-secondary"),
    foregroundMuted: getCSSVariable("--foreground-muted"),
    border: getCSSVariable("--border"),
    borderSecondary: getCSSVariable("--border-secondary"),
    primary: getCSSVariable("--primary"),
    primaryHover: getCSSVariable("--primary-hover"),
    primaryActive: getCSSVariable("--primary-active"),
    success: getCSSVariable("--success"),
    successHover: getCSSVariable("--success-hover"),
    warning: getCSSVariable("--warning"),
    warningHover: getCSSVariable("--warning-hover"),
    error: getCSSVariable("--error"),
    errorHover: getCSSVariable("--error-hover"),
    cardBg: getCSSVariable("--card-bg"),
    cardShadow: getCSSVariable("--card-shadow"),
    inputBg: getCSSVariable("--input-bg"),
    inputBorder: getCSSVariable("--input-border"),
    inputFocusBorder: getCSSVariable("--input-focus-border"),
  };
}

/**
 * Check if dark mode is currently active
 */
export function isDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

/**
 * Listen to theme changes
 */
export function onThemeChange(callback: (isDark: boolean) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        callback(isDarkMode());
      }
    });
  });

  observer.observe(document.documentElement, { attributes: true });

  return () => observer.disconnect();
}
