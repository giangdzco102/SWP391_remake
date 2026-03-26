import React from "react";
import { T } from "@/utils/myStoriesPage.constants";

export function EditReqBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; border: string }> = {
    OPEN:        { label: "Đang chờ Editor", bg: T.infoBg,     color: T.info,    border: T.infoBorder },
    IN_PROGRESS: { label: "Editor đang làm", bg: T.warnBg,     color: T.warn,    border: T.warnBorder },
    SUBMITTED:   { label: "Chờ bạn duyệt",  bg: T.accentLight, color: T.accent, border: T.accentBorder },
    APPROVED:    { label: "Hoàn thành",      bg: T.successBg,  color: T.success, border: T.successBorder },
    CANCELLED:   { label: "Đã huỷ",         bg: T.dangerBg,   color: T.danger,  border: T.dangerBorder },
  };

  const s = map[status] ?? {
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
      }}
    >
      {s.label}
    </span>
  );
}
