/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import useHttpClient from "@/api/useHttpClient";
import APP_CONFIG from "@/config/app-config";
import { EditRequest } from "@/types/editorDashboard";
import { T, btnOutline, btnDisabled, btnPrimary, fLabel, fInput } from "@/utils/editorDashboard.constants";
import { stripHtml } from "@/utils/editorDashboard.utils";
import { RichEditor } from "./RichEditor";
import { getAccessToken } from "@/utils/index";

export function EditorWorkModal({ request, onClose, onSubmit, onWithdraw }: { request: EditRequest; onClose: () => void; onSubmit: (id: number, content: string, note: string) => Promise<void>; onWithdraw: (id: number) => Promise<void> }) {
  const httpClient = useHttpClient();
  const [originalContent, setOriginalContent] = useState<string>("");
  const [editedContent, setEditedContent] = useState(request.editedContent ?? "");
  const [editorNote, setEditorNote] = useState(request.editorNote ?? "");
  const [saving, setSaving] = useState(false);
  const [loadingOriginal, setLoadingOriginal] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const token = getAccessToken();
    httpClient.getPublic(APP_CONFIG.CHAPTER.GET(request.chapterId), token ? { Authorization: `Bearer ${token}` } : {})
      .then((res: any) => setOriginalContent(res?.data?.content ?? res?.content ?? ""))
      .catch(() => {})
      .finally(() => setLoadingOriginal(false));
  }, [request.chapterId]);

  const handleSubmit = async () => {
    if (!stripHtml(editedContent).trim() || !editorNote.trim()) return;
    setSaving(true);
    try { await onSubmit(request.id, editedContent, editorNote); onClose(); }
    catch { /* error handled in parent */ }
    finally { setSaving(false); }
  };

  const isSubmitted = request.status === "SUBMITTED";
  const isRejected = request.status === "IN_PROGRESS" && request.attemptCount > 1;
  const canWithdraw = request.status === "IN_PROGRESS" && request.attemptCount <= 1;
  const wordCount = stripHtml(editedContent).split(/\s+/).filter(Boolean).length;

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)" }}>
      <div style={{ background: T.card, borderRadius: 20, width: "100%", maxWidth: 1100, maxHeight: "96vh", display: "flex", flexDirection: "column", boxShadow: T.shadowMd, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "16px 22px 12px", borderBottom: `1.5px solid ${T.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, background: T.grayBg }}>
          <div>
            <div style={{ fontFamily: T.fontSerif, fontSize: 17, fontWeight: 800, color: T.text }}>
              {isSubmitted ? "📋 Bản chỉnh sửa đã nộp" : "✏️ Soạn thảo chỉnh sửa"}
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
              {request.chapterTitle} · {request.storyTitle} · <span style={{ color: T.success, fontWeight: 700 }}>🪙 {request.coinReward} xu</span>
              {request.attemptCount > 1 && <span style={{ color: T.warn, fontWeight: 700 }}> · Lần #{request.attemptCount}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${T.border}`, background: T.card, cursor: "pointer", fontSize: 16, color: T.textSec, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Alerts */}
        <div style={{ padding: "12px 22px 0", display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
          {isSubmitted && (
            <div style={{ background: T.infoBg, border: `1.5px solid ${T.infoBorder}`, borderRadius: T.radiusSm, padding: "10px 14px", fontSize: 13, color: T.info }}>
              ⏳ Bản chỉnh sửa đã nộp — đang chờ Author xem xét. Không thể chỉnh sửa thêm.
            </div>
          )}
          {request.description && (
            <div style={{ background: T.warnBg, border: `1.5px solid ${T.warnBorder}`, borderRadius: T.radiusSm, padding: "10px 14px", fontSize: 13, color: T.warn }}>
              📋 <strong>Yêu cầu của Author:</strong> {request.description}
            </div>
          )}
          {isRejected && request.authorNote && (
            <div style={{ background: T.dangerBg, border: `1.5px solid ${T.dangerBorder}`, borderRadius: T.radiusSm, padding: "10px 14px", fontSize: 13, color: T.danger }}>
              ❌ <strong>Author từ chối lần trước:</strong> {request.authorNote}
            </div>
          )}
        </div>

        {/* Main content — side by side */}
        <div style={{ flex: 1, overflow: "hidden", minHeight: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
          {/* Left: Original */}
          <div style={{ display: "flex", flexDirection: "column", borderRight: `1.5px solid ${T.borderLight}`, minHeight: 0 }}>
            <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.borderLight}`, fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", flexShrink: 0 }}>📄 Nội dung gốc (readonly)</div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
              {loadingOriginal ? <div style={{ color: T.textMuted }}>Đang tải…</div> :
                !originalContent ? <div style={{ color: T.textMuted, fontStyle: "italic" }}>Không có nội dung gốc.</div> :
                  /<[a-z]/i.test(originalContent) ?
                    <div style={{ fontSize: 14, color: T.text, lineHeight: 1.8, fontFamily: "'Lora',serif", overflowWrap: "break-word", wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html: originalContent }} /> :
                    originalContent.split(/\n+/).filter(Boolean).map((p, i) => <p key={i} style={{ fontSize: 14, color: T.text, lineHeight: 1.8, fontFamily: "'Lora',serif", marginBottom: "0.8em", overflowWrap: "break-word", wordBreak: "break-word" }}>{p}</p>)
              }
            </div>
          </div>
          {/* Right: Editor */}
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.borderLight}`, fontSize: 12, fontWeight: 700, color: T.accent, textTransform: "uppercase", flexShrink: 0, display: "flex", justifyContent: "space-between" }}>
              <span>✏️ Bản chỉnh sửa</span>
              <span style={{ color: T.textMuted, fontWeight: 400 }}>{wordCount.toLocaleString()} chữ</span>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "12px 16px", minHeight: 0 }}>
              {isSubmitted ? (
                <div style={{ flex: 1, overflowY: "auto", fontSize: 14, color: T.text, lineHeight: 1.8, fontFamily: "'Lora',serif", overflowWrap: "break-word", wordBreak: "break-word" }}
                  dangerouslySetInnerHTML={{ __html: editedContent || "<em>(Trống)</em>" }}
                />
              ) : (
                <RichEditor value={editedContent} onChange={setEditedContent} height="100%" />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 22px", borderTop: `1.5px solid ${T.borderLight}`, display: "flex", gap: 12, alignItems: "flex-end", flexShrink: 0, background: T.grayBg }}>
          {!isSubmitted && (
            <div style={{ flex: 1 }}>
              <label style={{ ...fLabel(), marginBottom: 4 }}>Ghi chú cho Author (bắt buộc)</label>
              <input value={editorNote} onChange={(e) => setEditorNote(e.target.value)} placeholder="Giải thích những thay đổi bạn đã thực hiện…" style={{ ...fInput(), padding: "8px 12px", fontSize: 13 }} />
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={btnOutline}>Đóng</button>
            {canWithdraw && (
              <button onClick={async () => { await onWithdraw(request.id); onClose(); }} style={{ ...btnOutline, color: T.danger }}>🚪 Rút lui</button>
            )}
            {!isSubmitted && (
              <button onClick={handleSubmit} disabled={!stripHtml(editedContent).trim() || !editorNote.trim() || saving} style={!stripHtml(editedContent).trim() || !editorNote.trim() || saving ? btnDisabled : btnPrimary}>
                {saving ? "Đang nộp…" : "📤 Nộp bản chỉnh sửa"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
