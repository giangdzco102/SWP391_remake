import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";

interface Props {
  coinPrice: number;
  onPurchaseClick: () => void;
}

export function LockedChapterGate({ coinPrice, onPurchaseClick }: Props) {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <div
      style={{
        maxWidth: 520,
        margin: "40px auto",
        textAlign: "center",
        padding: "48px 32px",
        background: "#fff",
        borderRadius: 20,
        border: "1.5px solid #e8e0d6",
      }}
    >
      <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
      <div
        style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: 22,
          fontWeight: 700,
          color: "#1c1512",
          marginBottom: 8,
        }}
      >
        Chương VIP
      </div>
      <div
        style={{
          background: "#fffbeb",
          border: "1.5px solid #fcd34d",
          borderRadius: 12,
          padding: "16px 24px",
          marginBottom: 24,
          display: "inline-block",
        }}
      >
        <div style={{ fontSize: 13, color: "#92400e", marginBottom: 4 }}>
          Chi phí mở khóa
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#c69526" }}>
          🪙 {coinPrice} xu
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
            border: "1.5px solid #e8e0d6",
            background: "#fff",
            color: "#6b5a4e",
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
            onClick={onPurchaseClick}
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
            🪙 Mua {coinPrice} xu
          </button>
        )}
      </div>
    </div>
  );
}
