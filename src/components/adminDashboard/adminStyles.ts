import React from "react";

export const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 8,
  border: "1.5px solid #e5e7eb",
  padding: "9px 12px",
  fontSize: 14,
  boxSizing: "border-box",
  outline: "none",
  background: "#fff",
  color: "#1c1512",
  transition: "border-color 0.15s",
};
export const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#6b7280",
  display: "block",
  marginBottom: 4,
};
export const sectionTitle: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 700,
  color: "#1c1512",
  marginBottom: 18,
  marginTop: 0,
};
export const tableWrap: React.CSSProperties = {
  overflowX: "auto",
  borderRadius: 12,
  border: "1.5px solid #f0ebe3",
  background: "#fff",
};
export const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};
export const th: React.CSSProperties = {
  padding: "11px 14px",
  textAlign: "left",
  fontWeight: 700,
  fontSize: 11,
  color: "#9ca3af",
  whiteSpace: "nowrap",
  borderBottom: "1.5px solid #f0ebe3",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};
export const td: React.CSSProperties = {
  padding: "11px 14px",
  verticalAlign: "middle",
  borderBottom: "1px solid #f5f1ee",
};
export const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 18,
  border: "1.5px solid #f0ebe3",
};
export const iconBtnStyle = (color: string): React.CSSProperties => ({
  width: 30,
  height: 30,
  borderRadius: 7,
  border: "none",
  background: color + "18",
  color,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.15s",
});
export const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};
export const modalStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 0,
  maxWidth: 520,
  width: "100%",
  boxShadow: "0 24px 64px rgba(0,0,0,.25)",
  maxHeight: "90vh",
  overflowY: "auto",
};
