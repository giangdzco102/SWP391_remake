import React from "react";
import { T } from "@/utils/myStoriesPage.constants";

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; border: string }> = {
    DRAFT:          { label: "Bản nháp",      bg: T.grayBg,    color: T.gray,    border: T.grayBorder },
    EDITED:         { label: "Đã chỉnh sửa",  bg: T.purpleBg,  color: T.purple,  border: T.purpleBorder },
    EDIT_REQUEST:   { label: "Đang yêu cầu biên tập", bg: "#f3e8ff", color: "#7e22ce", border: "#d8b4fe" },
    PENDING_REVIEW: { label: "Chờ duyệt",     bg: T.warnBg,    color: T.warn,    border: T.warnBorder },
    PENDING:        { label: "Chờ duyệt",     bg: T.warnBg,    color: T.warn,    border: T.warnBorder },
    APPROVED:       { label: "Đã duyệt",      bg: T.successBg, color: T.success, border: T.successBorder },
    SCHEDULED:      { label: "Đã hẹn lịch",   bg: T.infoBg,    color: T.info,    border: T.infoBorder },
    PUBLISHED:      { label: "Đã xuất bản",   bg: T.infoBg,    color: T.info,    border: T.infoBorder },
    REJECTED:       { label: "Bị từ chối",    bg: T.dangerBg,  color: T.danger,  border: T.dangerBorder },
    HIDDEN:         { label: "Đã ẩn",         bg: T.grayBg,    color: T.gray,    border: T.grayBorder },
  };

  const s = map[status?.toUpperCase()] ?? {
    label: status,
    bg: T.grayBg,
    color: T.gray,
    border: T.grayBorder,
  };

  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        borderRadius: 20,
        padding: "3px 10px",
        background: s.bg,
        color: s.color,
        border: `1.5px solid ${s.border}`,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}
