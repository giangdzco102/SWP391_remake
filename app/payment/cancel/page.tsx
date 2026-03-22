/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function PaymentCancelContent() {
  const params = useSearchParams();
  const router = useRouter();

  const orderCode = params.get("orderCode") ?? params.get("order_code") ?? "—";

  return (
    <div
      className="fade-in"
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          background: "#fdfaf7",
          border: "2px solid #fca5a5",
          borderRadius: 20,
          padding: "40px 36px",
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        }}
      >
        {/* Icon */}
        <div style={{ fontSize: 64, marginBottom: 16, lineHeight: 1 }}>❌</div>

        {/* Title */}
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 26,
            fontWeight: 700,
            color: "#991b1b",
            marginBottom: 8,
          }}
        >
          Đã hủy thanh toán
        </div>

        <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 24 }}>
          Giao dịch đã bị hủy. Bạn chưa bị trừ tiền. <br />
          Bạn có thể thử lại bất cứ lúc nào.
        </p>

        {/* Order info */}
        {orderCode !== "—" && (
          <div
            style={{
              background: "#fef2f2",
              border: "1.5px solid #fca5a5",
              borderRadius: 12,
              padding: "14px 20px",
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "#9e8e82" }}>Mã đơn hàng</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1c1512" }}>#{orderCode}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontSize: 13, color: "#9e8e82" }}>Trạng thái</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#991b1b",
                  background: "#fef2f2",
                  border: "1px solid #fca5a5",
                  borderRadius: 20,
                  padding: "2px 10px",
                }}
              >
                Đã hủy
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            className="btn-full btn-red-full"
            style={{ flex: 1, padding: "11px 0", fontSize: 14, maxWidth: 200 }}
            onClick={() => router.push("/coinShopPage")}
          >
            💳 Thử lại
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
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="empty-state">⏳ Đang xử lý...</div>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  );
}
