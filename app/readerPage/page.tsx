"use client";
import React, { useState, useEffect } from "react";
import { Ico } from "@/components/Icons";
import { useStoryStore } from "@/stores/storyStore";
import { useNavStore } from "@/stores/navStore";
import { useRouter } from "next/navigation";

export function ReaderPage() {
  const {
    chapters,
    unlockedChapters,
    unlockChapter,
    fontSize,
    setFontSize,
    selectedChapter,
    setSelectedChapter,
    chapterTexts,
    setReadProgress,
  } = useStoryStore();

  const { navTo } = useNavStore();
  const [scrollPct, setScrollPct] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handler = () => {
      const el = document.documentElement;
      const pct = Math.round(
        (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100,
      );
      setScrollPct(pct);
      setReadProgress(String(selectedChapter), pct);
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, [selectedChapter]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedChapter]);

  const currentChapter = chapters[selectedChapter];
  const content = chapterTexts[selectedChapter] || chapterTexts[0];
  const isLocked =
    currentChapter?.locked && !unlockedChapters?.includes(currentChapter?.id);

  if (isLocked) {
    return (
      <div className="reader-wrap fade-in">
        <div className="reader-nav">
          <button
            className="nav-ch-btn"
            onClick={() => router.push("/storyDetailPage")}
          >
            <Ico.Back />
            Trang truyện
          </button>
          <div className="reader-chapter-title">{currentChapter?.title}</div>
          <div />
        </div>

        <div className="max-w-lg mx-auto mt-20 text-center bg-white rounded-2xl border border-slate-200 shadow-lg p-12">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="font-serif text-2xl font-bold text-slate-800 mb-2">
            Chương VIP
          </h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Chương này dành riêng cho độc giả VIP.
            <br />
            Mở khóa để tiếp tục đọc câu chuyện.
          </p>

          <div className="inline-block bg-amber-50 border border-amber-300 rounded-xl px-6 py-4 mb-6">
            <div className="text-xs text-amber-700 mb-1">Chi phí mở khóa</div>
            <div className="text-3xl font-black text-amber-600">
              🪙 {currentChapter?.price} xu
            </div>
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => navTo("story")}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              ← Quay lại
            </button>
            <button
              onClick={() =>
                unlockChapter(currentChapter.id, currentChapter.price)
              }
              className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 text-white text-sm font-bold shadow-lg shadow-amber-200 hover:opacity-90 transition-opacity"
            >
              🔓 Mở khóa ngay · {currentChapter?.price}🪙
            </button>
          </div>
          <p className="text-xs text-slate-300 mt-4">
            Sau khi mở khóa, bạn có thể đọc lại miễn phí bất kỳ lúc nào.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="reader-wrap fade-in">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${scrollPct}%` }} />
      </div>

      <div className="reader-nav">
        <button
          className="nav-ch-btn"
          onClick={() => router.push("/storyDetailPage")}
        >
          <Ico.Back />
          Trang truyện
        </button>
        <div className="reader-chapter-title">{currentChapter?.title}</div>
        <div className="flex items-center gap-2">
          <button
            className="font-btn"
            onClick={() => setFontSize(Math.max(14, fontSize - 1))}
          >
            A-
          </button>
          <span className="text-xs text-slate-400 min-w-[36px] text-center">
            {fontSize}px
          </span>
          <button
            className="font-btn"
            onClick={() => setFontSize(Math.min(26, fontSize + 1))}
          >
            A+
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mb-5">
        <span>⏱ {currentChapter?.readTime}</span>
        <span>·</span>
        <span>{currentChapter?.words?.toLocaleString()} chữ</span>
        <span>·</span>
        <span>{scrollPct}% đã đọc</span>
      </div>

      <div className="reader-content" style={{ fontSize }}>
        {(content || []).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="flex gap-3 justify-center mt-12 pt-8 border-t border-slate-200 flex-wrap">
        <button
          className="nav-ch-btn"
          disabled={selectedChapter === 0}
          onClick={() => setSelectedChapter(selectedChapter - 1)}
        >
          <Ico.Back />
          Chương trước
        </button>
        <button
          className="nav-ch-btn bg-red-50 text-[#c23d3f] border-red-200"
          onClick={() => router.push("/storyDetailPage")}
        >
          Về trang truyện
        </button>
        <button
          className="nav-ch-btn"
          disabled={selectedChapter >= chapters.length - 1}
          onClick={() => setSelectedChapter(selectedChapter + 1)}
        >
          Chương tiếp
          <Ico.Next />
        </button>
      </div>
    </div>
  );
}

export default ReaderPage;
