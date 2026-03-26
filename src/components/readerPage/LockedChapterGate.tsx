import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { ReaderChapterData as ChapterData } from "@/types/story";
import { useReaderTheme } from "@/hooks/useReaderTheme";

interface Props {
  chapterData: ChapterData;
  onConfirmPurchase: () => void;
}

export function LockedChapterGate({ chapterData, onConfirmPurchase }: Props) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { dk, isDark } = useReaderTheme();

  return (
    <div
      style={{
        maxWidth: 520,
        margin: "40px auto",
        textAlign: "center",
        padding: "48px 32px",
        background: dk.locked,
        borderRadius: 20,
        border: `1.5px solid ${dk.border}`,
      }}
    >
      <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
      <div
        style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: 22,
          fontWeight: 700,
          color: dk.text,
          marginBottom: 8,
        }}
      >
        Chương VIP
      </div>
      <div
        style={{
          background: dk.lockedCoin,
          border: `1.5px solid ${dk.lockedCoinBdr}`,
          borderRadius: 12,
          padding: "16px 24px",
          marginBottom: 24,
          display: "inline-block",
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: isDark ? "#c69526" : "#92400e",
            marginBottom: 4,
          }}
        >
          Chi phí mở khóa
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#c69526" }}>
          🪙 {chapterData.coinPrice} xu
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            padding: "10px 24px",
            borderRadius: 9,
            border: `1.5px solid ${dk.border}`,
            background: dk.surface,
            color: dk.navBtnText,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ← Quay lại
        </button>
        {!user ? (
          <button
            onClick={() => router.push("?login")}
            style={{
              padding: "10px 24px",
              borderRadius: 9,
              border: "none",
              background: "#c23d3f",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Đăng nhập để mở khóa
          </button>
        ) : (
          <button
            onClick={onConfirmPurchase}
            style={{
              padding: "10px 24px",
              borderRadius: 9,
              border: "none",
              background: "linear-gradient(135deg,#c69526,#9a7020)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(194,149,38,.3)",
            }}
          >
            🪙 Mua {chapterData.coinPrice} xu
          </button>
        )}
      </div>
    </div>
  );
}
