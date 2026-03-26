"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useVerifyPayment } from "@/hooks/useVerifyPayment";
import { VerifyStatusHeader } from "@/components/payment/VerifyStatusHeader";
import { SuccessOrderInfoBox } from "@/components/payment/SuccessOrderInfoBox";
import { SuccessActions } from "@/components/payment/SuccessActions";
import {
  PAYMENT_PAGE_WRAPPER_STYLE,
  PAYMENT_CARD_BASE_STYLE,
} from "@/utils/payment.constants";
import { getVerifyBorderColor } from "@/utils/payment.utils";

function PaymentSuccessContent() {
  const params = useSearchParams();
  const orderCode = params.get("orderCode") ?? params.get("order_code") ?? "";

  const { verifyState, order, walletBalance, retryCount } = useVerifyPayment(orderCode);

  const borderColor = getVerifyBorderColor(verifyState);

  return (
    <div className="fade-in" style={PAYMENT_PAGE_WRAPPER_STYLE}>
      <div style={{ ...PAYMENT_CARD_BASE_STYLE, border: `2px solid ${borderColor}` }}>
        <VerifyStatusHeader verifyState={verifyState} retryCount={retryCount} />

        {orderCode && (
          <SuccessOrderInfoBox
            orderCode={orderCode}
            verifyState={verifyState}
            order={order}
            walletBalance={walletBalance}
          />
        )}

        <SuccessActions />
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div style={PAYMENT_PAGE_WRAPPER_STYLE}>
          <div className="empty-state">⏳ Đang xử lý...</div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
