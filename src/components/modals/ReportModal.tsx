import React, { useState } from "react";

export interface ReportModalProps {
  targetLabel: string;
  onSubmit: (reason: string) => void;
  onClose: () => void;
  loading?: boolean;
}

export function ReportModal({
  targetLabel,
  onSubmit,
  onClose,
  loading,
}: ReportModalProps) {
  const [reason, setReason] = useState("");
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "28px 28px 24px",
          maxWidth: 420,
          width: "100%",
          boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
        }}
      >
        <div
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 18,
            fontWeight: 700,
            color: "#1c1512",
            marginBottom: 6,
          }}
        >
          🚩 Báo cáo
        </div>
        <div style={{ fontSize: 13, color: "#6b5a4e", marginBottom: 16 }}>
          Báo cáo: <strong>{targetLabel}</strong>
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Mô tả lý do báo cáo..."
          rows={4}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1.5px solid #e8e0d6",
            fontSize: 14,
            color: "#3d2f28",
            resize: "vertical",
            fontFamily: "inherit",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 16,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "9px 20px",
              borderRadius: 9,
              border: "1.5px solid #e8e0d6",
              background: "#fff",
              color: "#6b5a4e",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Hủy
          </button>
          <button
            onClick={() => reason.trim() && onSubmit(reason.trim())}
            disabled={!reason.trim() || loading}
            style={{
              padding: "9px 20px",
              borderRadius: 9,
              border: "none",
              background: !reason.trim() || loading ? "#f3f4f6" : "#c23d3f",
              color: !reason.trim() || loading ? "#9ca3af" : "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: !reason.trim() || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Đang gửi..." : "Gửi báo cáo"}
          </button>
        </div>
      </div>
    </div>
  );
}
