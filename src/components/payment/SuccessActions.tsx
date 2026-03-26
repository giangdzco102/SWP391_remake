"use client";
import { useRouter } from "next/navigation";

/**
 * Nút hành động trên trang thanh toán thành công:
 * - "Về cửa hàng coin" → /coinShopPage
 * - "Trang chủ" → /
 */
export function SuccessActions() {
  const router = useRouter();

  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
      <button
        className="btn-full btn-red-full"
        style={{ flex: 1, padding: "11px 0", fontSize: 14, maxWidth: 200 }}
        onClick={() => router.push("/coinShopPage")}
      >
        🪙 Về cửa hàng coin
      </button>
      <button
        style={{
          flex: 1,
          maxWidth: 160,
          padding: "11px 0",
          fontSize: 14,
          background: "transparent",
          border: "1.5px solid #e8e0d6",
          borderRadius: 10,
          color: "#6b7280",
          cursor: "pointer",
          fontWeight: 600,
        }}
        onClick={() => router.push("/")}
      >
        Trang chủ
      </button>
    </div>
  );
}
