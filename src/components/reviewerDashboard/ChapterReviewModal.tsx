import React, { useState, useEffect } from "react";
import useHttpClient from "@/api/useHttpClient";
import APP_CONFIG from "@/config/app-config";
import { getAccessToken } from "@/utils/index";
import { ChapterItem } from "@/types/reviewerDashboard";
import { T, btnOutline, btnDanger, btnDisabled, btnSuccess } from "@/utils/reviewerDashboard.constants";

interface ChapterReviewModalProps {
  chapter: ChapterItem;
  onClose: () => void;
  onReview: (chapterId: number, approved: boolean, note: string) => Promise<void>;
}

export function ChapterReviewModal({ chapter, onClose, onReview }: ChapterReviewModalProps) {
  const httpClient = useHttpClient();
  const [content, setContent] = useState<string>(chapter.content ?? "");
  const [loading, setLoading] = useState(!chapter.content);
  const [fetchError, setFetchError] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (chapter.content) return;
    const token = getAccessToken();
    httpClient.getPublic(
      APP_CONFIG.REVIEWER.CHAPTER_DETAIL(chapter.id),
      token ? { Authorization: `Bearer ${token}` } : {},
    )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((res: any) => {
        const c = res?.data?.content ?? res?.content ?? "";
        setContent(c);
        if (!c) setFetchError(true);
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [chapter.id]);// eslint-disable-line react-hooks/exhaustive-deps

  const handleDecision = async (approved: boolean) => {
    if (!approved && !note.trim()) return;
    setSaving(true);
    try { await onReview(chapter.id, approved, note); onClose(); }
    catch { /* parent handles error */ }
    finally { setSaving(false); }
  };

  const isHtml = /<[a-z]/i.test(content);

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)" }}>
      <div style={{ background: T.card, borderRadius: 20, width: "100%", maxWidth: 750, maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: T.shadowMd, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "18px 22px 14px", borderBottom: `1.5px solid ${T.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: T.fontSerif, fontSize: 17, fontWeight: 800, color: T.text }}>{chapter.title}</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>📖 {chapter.storyTitle} · Ch.{chapter.chapterOrder} · {chapter.coinPrice > 0 ? `🪙 ${chapter.coinPrice} xu` : "Miễn phí"} · ✍️ {chapter.authorName ?? "?"}</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${T.border}`, background: T.bg, cursor: "pointer", fontSize: 16, color: T.textSec, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {loading ? <div style={{ textAlign: "center", padding: 20, color: T.textMuted }}>⏳ Đang tải…</div> :
            fetchError ? <div style={{ color: T.danger, fontStyle: "italic", padding: 8, background: T.dangerBg, borderRadius: 8 }}>⚠️ Không thể tải nội dung chương. Vui lòng thử lại.</div> :
            !content ? <div style={{ color: T.textMuted, fontStyle: "italic" }}>Không có nội dung.</div> :
              isHtml ?
                <div style={{ fontSize: 15, color: T.text, lineHeight: 1.85, fontFamily: "'Lora',serif" }} dangerouslySetInnerHTML={{ __html: content }} /> :
                content.split(/\n+/).filter(Boolean).map((p, i) => <p key={i} style={{ fontSize: 15, color: T.text, lineHeight: 1.85, fontFamily: "'Lora',serif", marginBottom: "1em" }}>{p}</p>)
          }
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 22px", borderTop: `1.5px solid ${T.borderLight}`, flexShrink: 0, background: T.grayBg }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.textSec, marginBottom: 4, textTransform: "uppercase" }}>Ghi chú kiểm duyệt</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Bắt buộc nếu từ chối…" style={{ width: "100%", padding: "8px 12px", borderRadius: T.radiusSm, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.text, fontFamily: T.font, outline: "none", background: T.card, boxSizing: "border-box" }} />
            </div>
            <button onClick={onClose} style={btnOutline}>Đóng</button>
            <button onClick={() => handleDecision(false)} disabled={!note.trim() || saving} style={!note.trim() || saving ? btnDisabled : btnDanger}>
              {saving ? "…" : "❌ Từ chối"}
            </button>
            <button onClick={() => handleDecision(true)} disabled={saving} style={saving ? btnDisabled : btnSuccess}>
              {saving ? "…" : "✅ Duyệt"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
