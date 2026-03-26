import React from "react";
import { CoinPackage } from "@/api/usePayment.service";

/* ── Theme tokens ── */
export const T = {
  bg: "#f6f4f1",
  card: "#ffffff",
  cardHover: "#fdfcfa",
  border: "#e8e3dc",
  borderLight: "#f0ece6",
  text: "#2d2319",
  textSec: "#7a6e63",
  textMuted: "#b5a99e",
  accent: "#c2613a",
  accentLight: "#fef0ea",
  accentBorder: "#f5c8b4",
  success: "#3a8a5c",
  successBg: "#eaf7f0",
  successBorder: "#b8e0ca",
  warn: "#b08430",
  warnBg: "#fef9ee",
  warnBorder: "#f0daa8",
  danger: "#c24040",
  dangerBg: "#fdf0f0",
  dangerBorder: "#f0b8b8",
  info: "#3a72b0",
  infoBg: "#eef4fc",
  infoBorder: "#b4cde8",
  purple: "#7c5cbf",
  purpleBg: "#f4f0fc",
  purpleBorder: "#d0c2ec",
  gray: "#8a8078",
  grayBg: "#f3f0ed",
  grayBorder: "#ddd7d0",
  headerGrad: "linear-gradient(135deg, #3a2a1d 0%, #5c3d28 50%, #7a5035 100%)",
  radius: 14,
  radiusSm: 10,
  shadow: "0 2px 12px rgba(45,35,25,0.06)",
  shadowMd: "0 6px 24px rgba(45,35,25,0.1)",
  font: "'DM Sans', sans-serif",
  fontSerif: "'Playfair Display', 'Lora', Georgia, serif",
} as const;

/* ── Button styles ── */
export const btnBase: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: T.radiusSm,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  border: "none",
  fontFamily: T.font,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  transition: "all 0.15s ease",
};

export const btnPrimary: React.CSSProperties  = { ...btnBase, background: T.accent,     color: "#fff" };
export const btnOutline: React.CSSProperties  = { ...btnBase, background: T.card,       color: T.textSec, border: `1.5px solid ${T.border}` };
export const btnSuccess: React.CSSProperties  = { ...btnBase, background: T.success,    color: "#fff" };
export const btnDanger: React.CSSProperties   = { ...btnBase, background: T.danger,     color: "#fff" };
export const btnWarn: React.CSSProperties     = { ...btnBase, background: T.warnBg,     color: T.warn,    border: `1.5px solid ${T.warnBorder}` };
export const btnPurple: React.CSSProperties   = { ...btnBase, background: T.purpleBg,   color: T.purple,  border: `1.5px solid ${T.purpleBorder}` };
export const btnDisabled: React.CSSProperties = { ...btnBase, background: "#f0edea",    color: T.textMuted, cursor: "not-allowed" };

/* ── Form style helpers ── */
export function fLabel(): React.CSSProperties {
  return {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: T.textSec,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };
}

export function fInput(): React.CSSProperties {
  return {
    width: "100%",
    padding: "10px 14px",
    borderRadius: T.radiusSm,
    border: `1.5px solid ${T.border}`,
    fontSize: 14,
    color: T.text,
    fontFamily: T.font,
    outline: "none",
    boxSizing: "border-box",
    background: T.card,
    transition: "border-color 0.15s",
  };
}

/* ── Wallet fallback packages ── */
export const WALLET_FALLBACK_PKGS: CoinPackage[] = [
  { id: "BASIC",    displayName: "Cơ Bản",      amountVnd: 10000,  coinAmount: 10000,  bonusPercent: 0  },
  { id: "SAVING",   displayName: "Tiết Kiệm",   amountVnd: 50000,  coinAmount: 56000,  bonusPercent: 12 },
  { id: "POPULAR",  displayName: "Phổ Biến ⭐", amountVnd: 100000, coinAmount: 118000, bonusPercent: 18 },
  { id: "ADVANCED", displayName: "Nâng Cao",    amountVnd: 200000, coinAmount: 244000, bonusPercent: 22 },
  { id: "VIP",      displayName: "VIP",          amountVnd: 500000, coinAmount: 650000, bonusPercent: 30 },
];
