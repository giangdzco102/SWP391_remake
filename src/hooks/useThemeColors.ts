"use client";

import { useEffect, useState } from "react";
import { ThemeColors } from "@/types/theme";

/**
 * Hook to get current CSS variable values
 * Useful when you need to use theme colors in JavaScript/canvas/charts
 */
export function useThemeColors(): ThemeColors {
  const [colors, setColors] = useState<ThemeColors>({
    background: "#ffffff",
    backgroundSecondary: "#f5f5f5",
    backgroundTertiary: "#fafafa",
    foreground: "#171717",
    foregroundSecondary: "#525252",
    foregroundMuted: "#737373",
    border: "#e5e5e5",
    borderSecondary: "#d4d4d4",
    primary: "#1890ff",
    primaryHover: "#40a9ff",
    primaryActive: "#096dd9",
    success: "#52c41a",
    successHover: "#73d13d",
    warning: "#faad14",
    warningHover: "#ffc53d",
    error: "#ff4d4f",
    errorHover: "#ff7875",
    cardBg: "#ffffff",
    cardShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    inputBg: "#ffffff",
    inputBorder: "#d9d9d9",
    inputFocusBorder: "#40a9ff",
  });

  useEffect(() => {
    const updateColors = () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);

      setColors({
        background: computedStyle.getPropertyValue("--background").trim(),
        backgroundSecondary: computedStyle
          .getPropertyValue("--background-secondary")
          .trim(),
        backgroundTertiary: computedStyle
          .getPropertyValue("--background-tertiary")
          .trim(),
        foreground: computedStyle.getPropertyValue("--foreground").trim(),
        foregroundSecondary: computedStyle
          .getPropertyValue("--foreground-secondary")
          .trim(),
        foregroundMuted: computedStyle
          .getPropertyValue("--foreground-muted")
          .trim(),
        border: computedStyle.getPropertyValue("--border").trim(),
        borderSecondary: computedStyle
          .getPropertyValue("--border-secondary")
          .trim(),
        primary: computedStyle.getPropertyValue("--primary").trim(),
        primaryHover: computedStyle.getPropertyValue("--primary-hover").trim(),
        primaryActive: computedStyle
          .getPropertyValue("--primary-active")
          .trim(),
        success: computedStyle.getPropertyValue("--success").trim(),
        successHover: computedStyle.getPropertyValue("--success-hover").trim(),
        warning: computedStyle.getPropertyValue("--warning").trim(),
        warningHover: computedStyle.getPropertyValue("--warning-hover").trim(),
        error: computedStyle.getPropertyValue("--error").trim(),
        errorHover: computedStyle.getPropertyValue("--error-hover").trim(),
        cardBg: computedStyle.getPropertyValue("--card-bg").trim(),
        cardShadow: computedStyle.getPropertyValue("--card-shadow").trim(),
        inputBg: computedStyle.getPropertyValue("--input-bg").trim(),
        inputBorder: computedStyle.getPropertyValue("--input-border").trim(),
        inputFocusBorder: computedStyle
          .getPropertyValue("--input-focus-border")
          .trim(),
      });
    };

    updateColors();

    // Update colors when theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          updateColors();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  return colors;
}
