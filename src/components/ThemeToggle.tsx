"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({
  className = "",
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 
        hover:bg-background-secondary active:scale-95 ${className}`}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <FontAwesomeIcon
        icon={theme === "light" ? faMoon : faSun}
        className="w-5 h-5 text-foreground"
      />
      {showLabel && (
        <span className="text-sm font-medium text-foreground">
          {theme === "light" ? "Dark" : "Light"} Mode
        </span>
      )}
    </button>
  );
}
