import React from "react";
import { STATUS_MAP } from "@/utils/adminConstants";

export const StatusBadge = ({ status }: { status: string }) => {
  const s = STATUS_MAP[status] ?? {
    bg: "#f3f4f6",
    color: "#374151",
    label: status,
  };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        borderRadius: 20,
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
};

export function ActionBtn({
  color,
  onClick,
  children,
}: {
  color: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "6px 12px",
        borderRadius: 7,
        border: "none",
        background: color,
        color: "#fff",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

export function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div
      style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}
    >
      <div style={{ fontSize: 44, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 15 }}>{message}</div>
    </div>
  );
}

export function ModalHeader({
  title,
  onClose,
}: {
  title: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        padding: "20px 24px 16px",
        borderBottom: "1px solid #f0ebe3",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <h3
        style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1c1512" }}
      >
        {title}
      </h3>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 20,
          color: "#9ca3af",
          lineHeight: 1,
          padding: 4,
        }}
      >
        ✕
      </button>
    </div>
  );
}
