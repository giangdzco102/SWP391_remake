import React from "react";
import { useRouter } from "next/navigation";
import { useReaderTheme } from "@/hooks/useReaderTheme";
import { Ico } from "@/components/Icons";

interface ChapterSummary {
  id: number;
}

interface Props {
  prevChapter: ChapterSummary | null;
  nextChapter: ChapterSummary | null;
  goToChapter: (id: number) => void;
  setShowChapterList: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ReaderBottomNav({
  prevChapter,
  nextChapter,
  goToChapter,
  setShowChapterList,
}: Props) {
  const router = useRouter();
  const { dk } = useReaderTheme();

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        justifyContent: "center",
        marginTop: 48,
        paddingTop: 32,
        borderTop: `1.5px solid ${dk.border}`,
        flexWrap: "wrap",
        padding: "32px 16px 0",
      }}
    >
      <button
        className="nav-ch-btn"
        style={{
          background: dk.navBtn,
          borderColor: dk.border,
          color: dk.navBtnText,
        }}
        disabled={!prevChapter}
        onClick={() => prevChapter && goToChapter(prevChapter.id)}
      >
        <Ico.Back />
        Chương trước
      </button>
      <button
        className="nav-ch-btn"
        style={{
          background: dk.navBtnActive,
          color: dk.navBtnActTxt,
          borderColor: dk.navBtnActBdr,
        }}
        onClick={() => router.back()}
      >
        Về trang truyện
      </button>
      <button
        className="nav-ch-btn"
        style={{
          background: dk.navBtn,
          borderColor: dk.border,
          color: dk.navBtnText,
          gap: 6,
        }}
        onClick={() => setShowChapterList(true)}
      >
        ☰ Chương
      </button>
      <button
        className="nav-ch-btn"
        style={{
          background: dk.navBtn,
          borderColor: dk.border,
          color: dk.navBtnText,
        }}
        disabled={!nextChapter}
        onClick={() => nextChapter && goToChapter(nextChapter.id)}
      >
        Chương tiếp
        <Ico.Next />
      </button>
    </div>
  );
}
