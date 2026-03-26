import React from "react";
import { useRouter } from "next/navigation";
import { Ico } from "@/components/Icons";
import { ReadingSettingsPanel } from "@/components/popup/ReadingSettingsPanel";
import { useReaderTheme } from "@/hooks/useReaderTheme";

interface Props {
  chapterTitle: string;
  showChapterList: boolean;
  setShowChapterList: React.Dispatch<React.SetStateAction<boolean>>;
  showSettings: boolean;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
  fontSize: number;
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  fontFamily: string;
  setFontFamily: React.Dispatch<React.SetStateAction<string>>;
  lineHeight: number;
  setLineHeight: React.Dispatch<React.SetStateAction<number>>;
}

export function ReaderNav({
  chapterTitle,
  showChapterList,
  setShowChapterList,
  showSettings,
  setShowSettings,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  lineHeight,
  setLineHeight,
}: Props) {
  const router = useRouter();
  const { dk } = useReaderTheme();

  return (
    <div
      className="reader-nav"
      style={{ borderBottomColor: dk.border, background: dk.bg }}
    >
      <button
        className="nav-ch-btn"
        style={{
          background: dk.navBtn,
          borderColor: dk.border,
          color: dk.navBtnText,
        }}
        onClick={() => router.back()}
      >
        <Ico.Back />
        Trang truyện
      </button>
      <div
        className="reader-chapter-title"
        style={{
          maxWidth: 340,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: dk.text,
        }}
      >
        {chapterTitle}
      </div>

      <button
        onClick={() => setShowChapterList((v) => !v)}
        title="Danh sách chương"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 14px",
          borderRadius: 8,
          border: showChapterList
            ? `1.5px solid ${dk.navBtnActBdr}`
            : `1.5px solid ${dk.border}`,
          background: showChapterList ? dk.navBtnActive : dk.navBtn,
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 600,
          color: showChapterList ? dk.navBtnActTxt : dk.navBtnText,
          transition: "all 0.15s",
        }}
      >
        <span style={{ fontSize: 14 }}>☰</span>
        <span>Chương</span>
      </button>

      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowSettings((v) => !v)}
          title="Tuỳ chỉnh hiển thị"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 8,
            border: showSettings
              ? `1.5px solid ${dk.navBtnActBdr}`
              : `1.5px solid ${dk.border}`,
            background: showSettings ? dk.navBtnActive : dk.navBtn,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            color: showSettings ? dk.navBtnActTxt : dk.navBtnText,
            transition: "all 0.15s",
          }}
        >
          <span style={{ fontSize: 15 }}>Aa</span>
          <span style={{ fontSize: 10, opacity: 0.7 }}>
            {showSettings ? "▲" : "▼"}
          </span>
        </button>

        {showSettings && (
          <ReadingSettingsPanel
            fontSize={fontSize}
            setFontSize={setFontSize}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            lineHeight={lineHeight}
            setLineHeight={setLineHeight}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </div>
  );
}
