import React, { useState } from "react";
import useReportService from "@/api/useReport.service";
import { useToast } from "@/hooks/use-toast";
import { useStoryDetailTheme } from "@/hooks/useStoryDetailTheme";

interface Props {
  isOpen: boolean;
  storyId: number;
  storyTitle: string;
  onClose: () => void;
}

export function ReportPanel({ isOpen, storyId, storyTitle, onClose }: Props) {
  const { createReport } = useReportService();
  const toast = useToast();
  const { dk } = useStoryDetailTheme();
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);

  if (!isOpen) return null;

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    setReporting(true);
    try {
      await createReport({
        targetType: "STORY",
        targetId: storyId,
        reason: reportReason.trim(),
      });
      toast.success("Báo cáo đã được gửi. Cảm ơn bạn!");
      onClose();
      setReportReason("");
    } catch {
      toast.error("Không thể gửi báo cáo. Thử lại sau.");
    } finally {
      setReporting(false);
    }
  };

  return (
    <div
      style={{
        background: dk.surfaceMid,
        border: `1.5px solid ${dk.border}`,
        borderRadius: 14,
        padding: "16px 18px",
        marginBottom: 16,
      }}
    >
      <div
        style={{ fontWeight: 700, fontSize: 14, color: dk.text, marginBottom: 8 }}
      >
        🚩 Báo cáo truyện: <em>{storyTitle}</em>
      </div>
      <textarea
        value={reportReason}
        onChange={(e) => setReportReason(e.target.value)}
        placeholder="Mô tả lý do báo cáo..."
        rows={3}
        style={{
          width: "100%",
          padding: "9px 12px",
          borderRadius: 10,
          border: `1.5px solid ${dk.border}`,
          background: dk.surface,
          fontSize: 13,
          color: dk.textSub,
          resize: "none",
          fontFamily: "inherit",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 10,
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={() => {
            onClose();
            setReportReason("");
          }}
          style={{
            padding: "8px 18px",
            borderRadius: 9,
            border: `1.5px solid ${dk.border}`,
            background: dk.surface,
            color: dk.textSub2,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Hủy
        </button>
        <button
          onClick={handleReport}
          disabled={!reportReason.trim() || reporting}
          style={{
            padding: "8px 18px",
            borderRadius: 9,
            border: "none",
            background:
              !reportReason.trim() || reporting ? dk.disabledBg : "#c23d3f",
            color:
              !reportReason.trim() || reporting ? dk.disabledTxt : "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor:
              !reportReason.trim() || reporting ? "not-allowed" : "pointer",
          }}
        >
          {reporting ? "Đang gửi..." : "Gửi báo cáo"}
        </button>
      </div>
    </div>
  );
}
