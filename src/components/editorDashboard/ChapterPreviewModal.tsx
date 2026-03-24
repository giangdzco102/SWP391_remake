/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import useHttpClient from "@/api/useHttpClient";
import APP_CONFIG from "@/config/app-config";
import { ChapterDetail } from "@/types/editorDashboard";
import { T, btnOutline } from "@/utils/editorDashboard.constants";

export function ChapterPreviewModal({ chapterId, onClose }: { chapterId: number; onClose: () => void }) {
  const httpClient = useHttpClient();
  const [chapter, setChapter] = useState<ChapterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    httpClient.get(APP_CONFIG.CHAPTER.GET(chapterId))
      .then((res: any) => setChapter(res?.data ?? res ?? null))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [chapterId]);
  
  const content = chapter?.content ?? "";
  const isHtml = /<[a-z][\s\S]*>/i.test(content);
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)" }}>
      <div style={{ background: T.card, borderRadius: 20, width: "100%", maxWidth: 700, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: T.shadowMd, overflow: "hidden" }}>
        <div style={{ padding: "18px 22px 14px", borderBottom: `1.5px solid ${T.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: T.fontSerif, fontSize: 16, fontWeight: 800, color: T.text }}>{chapter?.title ?? "Đang tải…"}</div>
            {chapter && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{chapter.storyTitle} · Chương {chapter.chapterOrder} · {chapter.coinPrice > 0 ? `🪙 ${chapter.coinPrice} xu` : "Miễn phí"}</div>}
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${T.border}`, background: T.bg, cursor: "pointer", fontSize: 16, color: T.textSec, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", minHeight: 0 }}>
          {loading ? <div style={{ textAlign: "center", padding: 20, color: T.textMuted }}>⏳ Đang tải nội dung…</div> :
            !content ? <div style={{ color: T.textMuted, fontStyle: "italic" }}>Không có nội dung.</div> :
              isHtml ? <div style={{ fontSize: 15, color: T.text, lineHeight: 1.85, fontFamily: "'Lora',serif", overflowWrap: "break-word", wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html: content }} /> :
                content.split(/\n+/).filter(Boolean).map((p, i) => <p key={i} style={{ fontSize: 15, color: T.text, lineHeight: 1.85, fontFamily: "'Lora',serif", marginBottom: "1em", overflowWrap: "break-word", wordBreak: "break-word" }}>{p}</p>)
          }
        </div>
        <div style={{ padding: "12px 22px", borderTop: `1px solid ${T.borderLight}`, display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
          <button onClick={onClose} style={btnOutline}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
