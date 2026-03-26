"use client";

interface CancelInfoBoxProps {
  orderCode: string;
}

/**
 * Hiển thị mã đơn hàng và trạng thái "Đã hủy" khi thanh toán bị cancel.
 */
export function CancelInfoBox({ orderCode }: CancelInfoBoxProps) {
  return (
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
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1c1512" }}>
          #{orderCode}
        </span>
      </div>
      <div
        style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}
      >
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
  );
}
