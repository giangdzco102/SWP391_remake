import React, { useState } from "react";
import { EditRequest } from "@/types/myStoriesPage";
import {
  T,
  btnOutline,
  btnSuccess,
  btnDanger,
  btnDisabled,
  fLabel,
  fInput,
} from "@/utils/myStoriesPage.constants";
import { stripHtml } from "@/utils/myStoriesPage.utils";

interface AuthorReviewEditModalProps {
  request: EditRequest;
  originalContent?: string;
  onClose: () => void;
  onAction: (
    reqId: number,
    isApprove: boolean,
    note: string
  ) => Promise<void>;
}

type ViewTab = "side" | "edited";

export function AuthorReviewEditModal({
  request,
  originalContent,
  onClose,
  onAction,
}: AuthorReviewEditModalProps) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [viewTab, setViewTab] = useState<ViewTab>("side");

  const handleApprove = async () => {
    setSaving(true);
    await onAction(request.id, true, note);
    setSaving(false);
  };

  const handleReject = async () => {
    if (!note.trim()) {
      alert("Vui lòng nhập lý do để Editor biết đường sửa lại!");
      return;
    }
    setSaving(true);
    await onAction(request.id, false, note);
    setSaving(false);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        style={{
          background: T.card,
          borderRadius: 20,
          width: "100%",
          maxWidth: 960,
          maxHeight: "94vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: T.shadowMd,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px 12px",
            borderBottom: `1.5px solid ${T.borderLight}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: T.fontSerif,
                fontSize: 16,
                fontWeight: 800,
                color: T.text,
              }}
            >
              📋 Duyệt bản chỉnh sửa
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
              {request.chapterTitle} · Editor: {request.editorName} · Lần #
              {request.attemptCount}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: `1.5px solid ${T.border}`,
              background: T.bg,
              cursor: "pointer",
              fontSize: 16,
              color: T.textSec,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "16px 20px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            flex: 1,
          }}
        >
          {request.editorNote && (
            <div
              style={{
                background: T.successBg,
                border: `1.5px solid ${T.successBorder}`,
                borderRadius: T.radiusSm,
                padding: "10px 14px",
                fontSize: 13,
                color: T.success,
              }}
            >
              💬 <strong>Editor ghi chú:</strong> {request.editorNote}
            </div>
          )}

          {/* View toggle */}
          <div style={{ display: "flex", gap: 6 }}>
            {(["side", "edited"] as ViewTab[]).map((v) => (
              <button
                key={v}
                onClick={() => setViewTab(v)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: `1.5px solid ${
                    viewTab === v ? T.accent : T.border
                  }`,
                  background: viewTab === v ? T.accentLight : T.card,
                  color: viewTab === v ? T.accent : T.textSec,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {v === "side" ? "📐 So sánh" : "📝 Bản chỉnh sửa"}
              </button>
            ))}
          </div>

          {viewTab === "side" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.textMuted,
                    marginBottom: 6,
                    textTransform: "uppercase",
                  }}
                >
                  📄 Nội dung gốc
                </div>
                <div
                  style={{
                    padding: 14,
                    background: T.grayBg,
                    border: `1px solid ${T.grayBorder}`,
                    borderRadius: T.radiusSm,
                    fontSize: 13,
                    color: T.text,
                    lineHeight: 1.8,
                    minHeight: 200,
                    maxHeight: 400,
                    overflowY: "auto",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {originalContent
                    ? stripHtml(originalContent)
                    : "(Không có dữ liệu gốc)"}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.accent,
                    marginBottom: 6,
                    textTransform: "uppercase",
                  }}
                >
                  ✏️ Bản chỉnh sửa
                </div>
                <div
                  style={{
                    padding: 14,
                    background: T.accentLight,
                    border: `1px solid ${T.accentBorder}`,
                    borderRadius: T.radiusSm,
                    fontSize: 13,
                    color: T.text,
                    lineHeight: 1.8,
                    minHeight: 200,
                    maxHeight: 400,
                    overflowY: "auto",
                  }}
                  dangerouslySetInnerHTML={{ __html: request.editedContent || "<em>(Trống)</em>" }}
                />
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: 16,
                background: T.bg,
                border: `1.5px solid ${T.border}`,
                borderRadius: T.radiusSm,
                fontSize: 14,
                color: T.text,
                lineHeight: 1.8,
                minHeight: 200,
                maxHeight: 500,
                overflowY: "auto",
              }}
              dangerouslySetInnerHTML={{ __html: request.editedContent || "<em>(Trống)</em>" }}
            />
          )}

          <div>
            <label style={fLabel()}>
              Phản hồi của bạn (bắt buộc khi từ chối)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập nhận xét / lý do từ chối…"
              rows={3}
              style={{ ...fInput(), resize: "none" }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={btnOutline}>
              Đóng
            </button>
            <button
              onClick={handleReject}
              disabled={saving}
              style={saving ? btnDisabled : btnDanger}
            >
              ❌ Yêu cầu sửa lại
            </button>
            <button
              onClick={handleApprove}
              disabled={saving}
              style={saving ? btnDisabled : btnSuccess}
            >
              ✅ Chấp nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
