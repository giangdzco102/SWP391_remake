import React from "react";

export const isRealCover = (url?: string): boolean =>
  !!url && !url.includes("placeholder.com") && !url.includes("placeholder");

export const formatNum = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
};

export const getPillStyle = (
  isActive: boolean,
  activeBg: string,
  activeColor = "#fff"
): React.CSSProperties => ({
  padding: "6px 16px",
  borderRadius: 20,
  fontSize: 13,
  cursor: "pointer",
  border: isActive ? "1px solid transparent" : "1px solid #e8e0d6",
  background: isActive ? activeBg : "transparent",
  color: isActive ? activeColor : "#6b5a4e",
  fontWeight: isActive ? 600 : 400,
  transition: "all 0.15s ease",
});
