import React, { useState, useEffect } from "react";
import useHttpClient from "@/api/useHttpClient";
import APP_CONFIG from "@/config/app-config";
import { StoryItem, ChapterItem } from "@/types/reviewerDashboard";
import { T, btnOutline, btnDanger, btnDisabled, btnSuccess } from "@/utils/reviewerDashboard.constants";
import { timeAgo } from "@/utils/reviewerDashboard.utils";

interface StoryDetailModalProps {
  story: StoryItem;
  onClose: () => void;
  onReview: (storyId: number, approved: boolean, note: string) => Promise<void>;
}

export function StoryDetailModal({ story, onClose, onReview }: StoryDetailModalProps) {
  const httpClient = useHttpClient();
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandChapter, setExpandChapter] = useState<number | null>(null);

  useEffect(() => {
    httpClient.get(APP_CONFIG.REVIEWER.STORY_DETAIL(story.id))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((res: any) => {
        const data = res?.data ?? res ?? {};
        const chs = data.chapters ?? data.content ?? [];
        setChapters(Array.isArray(chs) ? chs : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [story.id]);// eslint-disable-line react-hooks/exhaustive-deps

  const handleDecision = async (approved: boolean) => {
    if (!approved && !note.trim()) return;
    setSaving(true);
    try { await onReview(story.id, approved, note); onClose(); }
    catch { /* parent handles error */ }
    finally { setSaving(false); }
  };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)" }}>
      <div style={{ background: T.card, borderRadius: 20, width: "100%", maxWidth: 950, maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: T.shadowMd, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "18px 22px 14px", borderBottom: `1.5px solid ${T.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, background: T.grayBg }}>
          <div>
            <div style={{ fontFamily: T.fontSerif, fontSize: 18, fontWeight: 800, color: T.text }}>{story.title}</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>✍️ {story.authorName} · 📅 {timeAgo(story.createdAt)}{story.categoryNames?.length ? ` · 📂 ${story.categoryNames.join(", ")}` : ""}</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${T.border}`, background: T.card, cursor: "pointer", fontSize: 16, color: T.textSec, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Body — two columns */}
        <div style={{ flex: 1, overflow: "hidden", display: "grid", gridTemplateColumns: "340px 1fr", gap: 0 }}>
          {/* Left: Story info */}
          <div style={{ borderRight: `1.5px solid ${T.borderLight}`, overflowY: "auto", padding: "16px 18px" }}>
            {story.coverUrl && <img src={story.coverUrl} alt="" style={{ width: "100%", borderRadius: 12, marginBottom: 12, objectFit: "cover", maxHeight: 220 }} />}
            <div style={{ fontSize: 13, color: T.text, lineHeight: 1.7 }}>{story.description || <span style={{ color: T.textMuted, fontStyle: "italic" }}>Chưa có mô tả.</span>}</div>
            <div style={{ marginTop: 16, fontSize: 12, color: T.textMuted }}>📊 {chapters.length} chương</div>
          </div>
          {/* Right: Chapters */}
          <div style={{ overflowY: "auto", padding: "16px 18px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textSec, marginBottom: 10, textTransform: "uppercase" }}>📚 Danh sách chương</div>
            {loading ? <div style={{ color: T.textMuted }}>Đang tải…</div> :
              chapters.length === 0 ? <div style={{ color: T.textMuted, fontStyle: "italic" }}>Không có chương.</div> :
                chapters.map((ch) => (
                  <div key={ch.id} style={{ marginBottom: 8, border: `1px solid ${expandChapter === ch.id ? T.accentBorder : T.borderLight}`, borderRadius: 10, overflow: "hidden" }}>
                    <button onClick={() => setExpandChapter(expandChapter === ch.id ? null : ch.id)} style={{ width: "100%", padding: "10px 14px", border: "none", background: expandChapter === ch.id ? T.accentLight : T.card, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.text, flex: 1 }}>Ch.{ch.chapterOrder} — {ch.title}</span>
                      <span style={{ fontSize: 11, color: T.textMuted }}>{ch.coinPrice > 0 ? `🪙 ${ch.coinPrice}` : "Free"}</span>
                      <span style={{ fontSize: 11, transform: expandChapter === ch.id ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
                    </button>
                    {expandChapter === ch.id && (
                      <div style={{ padding: "14px 16px", borderTop: `1px solid ${T.borderLight}`, fontSize: 14, color: T.text, lineHeight: 1.8, fontFamily: "'Lora',serif", maxHeight: 300, overflowY: "auto" }}>
                        {!ch.content
                          ? <span style={{ color: T.textMuted, fontStyle: "italic" }}>Nội dung chưa được tải.</span>
                          : /<[a-z]/i.test(ch.content)
                            ? <div dangerouslySetInnerHTML={{ __html: ch.content }} />
                            : ch.content.split(/\n+/).filter(Boolean).map((p, i) => <p key={i} style={{ marginBottom: "0.7em" }}>{p}</p>)
                        }
                      </div>
                    )}
                  </div>
                ))}
          </div>
        </div>

        {/* Footer — decision */}
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
