import React from "react";
import { fInput, fLabel, btnOutline, btnPrimary } from "@/utils/myStoriesPage.constants";

interface ScheduleDateInputProps {
  onConfirm: (publishAt: string) => void;
  onClose: () => void;
  loading: boolean;
}

export function ScheduleDateInput({
  onConfirm,
  onClose,
  loading,
}: ScheduleDateInputProps) {
  const [publishAt, setPublishAt] = React.useState("");
  const min = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  return (
    <>
      <label style={fLabel()}>Thời gian xuất bản</label>
      <input
        type="datetime-local"
        value={publishAt}
        min={min}
        onChange={(e) => setPublishAt(e.target.value)}
        style={fInput()}
      />
      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 20,
          justifyContent: "flex-end",
        }}
      >
        <button onClick={onClose} style={btnOutline}>
          Hủy
        </button>
        <button
          onClick={() => {
            if (publishAt) onConfirm(publishAt);
          }}
          disabled={!publishAt || loading}
          style={
            !publishAt || loading
              ? { ...btnPrimary, background: "#f0edea", color: "#b5a99e", cursor: "not-allowed" }
              : btnPrimary
          }
        >
          {loading ? "⏳ Đang lưu…" : "📅 Hẹn lịch"}
        </button>
      </div>
    </>
  );
}
