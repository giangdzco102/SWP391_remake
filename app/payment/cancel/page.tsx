"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CancelInfoBox } from "@/components/payment/CancelInfoBox";
import { CancelActions } from "@/components/payment/CancelActions";
import {
  PAYMENT_PAGE_WRAPPER_STYLE,
  PAYMENT_CARD_BASE_STYLE,
  PAYMENT_BORDER,
  PAYMENT_FALLBACK_ORDER_CODE,
} from "@/utils/payment.constants";

function PaymentCancelContent() {
  const params = useSearchParams();
  const orderCode =
    params.get("orderCode") ?? params.get("order_code") ?? PAYMENT_FALLBACK_ORDER_CODE;

  return (
    <div className="fade-in" style={PAYMENT_PAGE_WRAPPER_STYLE}>
      <div style={{ ...PAYMENT_CARD_BASE_STYLE, border: PAYMENT_BORDER.cancel }}>
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
        {orderCode !== PAYMENT_FALLBACK_ORDER_CODE && (
          <CancelInfoBox orderCode={orderCode} />
        )}

        {/* Actions */}
        <CancelActions />
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div style={PAYMENT_PAGE_WRAPPER_STYLE}>
          <div className="empty-state">⏳ Đang xử lý...</div>
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}
