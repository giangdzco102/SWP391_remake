import React, { useState, useEffect } from 'react';
import { Ico } from '../Icons';
import { StarRating, AvatarComp, Toast } from '../ui';
export function ReaderPage({ story, chapter, chapters, content, onBack, onChange, fontSize, setFontSize, onProgress, unlockedChapters, unlockChapter }) {
    const [scrollPct, setScrollPct] = useState(0);
    useEffect(() => {
        const handler = () => { const el = document.documentElement; const pct = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100); setScrollPct(pct); onProgress?.(pct); };
        window.addEventListener("scroll", handler);
        return () => window.removeEventListener("scroll", handler);
    }, [onProgress]);
    useEffect(() => { window.scrollTo(0, 0); }, [chapter]);
    const currentChapter = chapters[chapter];
    const isLocked = currentChapter?.locked && !unlockedChapters?.has(currentChapter?.id);
    if (isLocked) {
        return (<div className="reader-wrap fade-in">
        <div className="reader-nav">
          <button className="nav-ch-btn" onClick={onBack}><Ico.Back />Trang truyện</button>
          <div className="reader-chapter-title">{currentChapter?.title}</div>
          <div />
        </div>
        <div style={{ maxWidth: 520, margin: "80px auto", textAlign: "center", padding: "48px 32px", background: "#fff", borderRadius: 20, border: "1.5px solid #e8e0d6", boxShadow: "0 8px 32px rgba(60,35,10,.08)" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "#1c1512", marginBottom: 8 }}>Chương VIP</div>
          <div style={{ fontSize: 14, color: "#9e8e82", marginBottom: 24, lineHeight: 1.6 }}>Chương này dành riêng cho độc giả VIP.<br />Mở khóa để tiếp tục đọc câu chuyện.</div>
          <div style={{ background: "#fffbeb", border: "1.5px solid #fcd34d", borderRadius: 12, padding: "16px 24px", marginBottom: 24, display: "inline-block" }}>
            <div style={{ fontSize: 13, color: "#92400e", marginBottom: 4 }}>Chi phí mở khóa</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#c69526" }}>🪙 {currentChapter?.price} xu</div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={onBack} style={{ padding: "10px 24px", borderRadius: 9, border: "1.5px solid #e8e0d6", background: "#fff", color: "#6b5a4e", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← Quay lại</button>
            <button onClick={() => unlockChapter?.(currentChapter.id, currentChapter.price)} style={{ padding: "10px 28px", borderRadius: 9, background: "linear-gradient(135deg,#c69526,#9a7020)", color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(194,149,38,.35)" }}>
              🔓 Mở khóa ngay · {currentChapter?.price}🪙
            </button>
          </div>
          <p style={{ fontSize: 12, color: "#b0a096", marginTop: 16 }}>Sau khi mở khóa, bạn có thể đọc lại miễn phí bất kỳ lúc nào.</p>
        </div>
      </div>);
    }
    return (<div className="reader-wrap fade-in">
      <div className="progress-bar"><div className="progress-fill" style={{ width: `${scrollPct}%` }}/></div>
      <div className="reader-nav">
        <button className="nav-ch-btn" onClick={onBack}><Ico.Back />Trang truyện</button>
        <div className="reader-chapter-title">{chapters[chapter]?.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="font-btn" onClick={() => setFontSize((f) => Math.max(14, f - 1))}>A-</button>
          <span style={{ fontSize: 12, color: "#9e8e82", minWidth: 36, textAlign: "center" }}>{fontSize}px</span>
          <button className="font-btn" onClick={() => setFontSize((f) => Math.min(26, f + 1))}>A+</button>
        </div>
      </div>
      <div style={{ marginBottom: 20, fontSize: 13, color: "#b0a096", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <span>⏱ {chapters[chapter]?.readTime}</span>
        <span>·</span>
        <span>{chapters[chapter]?.words?.toLocaleString()} chữ</span>
        <span>·</span>
        <span>{scrollPct}% đã đọc</span>
      </div>
      <div className="reader-content" style={{ fontSize }}>
        {(content || []).map((p, i) => <p key={i}>{p}</p>)}
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 48, paddingTop: 32, borderTop: "1.5px solid #e8e0d6", flexWrap: "wrap" }}>
        <button className="nav-ch-btn" disabled={chapter === 0} onClick={() => onChange(chapter - 1)}><Ico.Back />Chương trước</button>
        <button className="nav-ch-btn" style={{ background: "#fde8e8", color: "#c23d3f", borderColor: "#e8a0a1" }} onClick={onBack}>Về trang truyện</button>
        <button className="nav-ch-btn" disabled={chapter >= chapters.length - 1} onClick={() => onChange(chapter + 1)}>Chương tiếp<Ico.Next /></button>
      </div>
    </div>);
}