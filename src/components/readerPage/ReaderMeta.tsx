import React from "react";
import { useReaderTheme } from "@/hooks/useReaderTheme";

interface Props {
  chapterTitle: string;
  storyTitle: string;
  readMins: number;
  wordCount: number;
  scrollPct: number;
}

export function ReaderMeta({
  chapterTitle,
  storyTitle,
  readMins,
  wordCount,
  scrollPct,
}: Props) {
  const { dk } = useReaderTheme();

  return (
    <div style={{ maxWidth: 680, margin: "0 auto 24px", padding: "0 16px" }}>
      <h1
        style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: 22,
          fontWeight: 800,
          color: dk.text,
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        {chapterTitle}
      </h1>
      <div
        style={{
          textAlign: "center",
          fontSize: 12,
          color: dk.textMuted,
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <span>📖 {storyTitle}</span>
        <span>·</span>
        <span>⏱ {readMins} phút đọc</span>
        <span>·</span>
        <span>{wordCount.toLocaleString()} chữ</span>
        <span>·</span>
        <span>{scrollPct}% đã đọc</span>
      </div>
    </div>
  );
}
