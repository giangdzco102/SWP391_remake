/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useCallback, useEffect } from "react";
import useWalletService from "@/api/useWallet.service";
import usePaymentService, { PaymentHistoryItem } from "@/api/usePayment.service";
import { useAuthStore } from "@/stores";
import { VerifyState } from "@/types/payment";

interface UseVerifyPaymentResult {
  verifyState: VerifyState;
  order: PaymentHistoryItem | null;
  walletBalance: number | null;
  retryCount: number;
}

/**
 * Hook xác minh trạng thái đơn hàng sau khi PayOS redirect về.
 * - Tự động gọi API verify khi mount.
 * - Auto-retry mỗi 3 giây khi PENDING (tối đa 5 lần).
 * - Refresh số dư ví khi thanh toán thành công.
 */
export function useVerifyPayment(orderCode: string): UseVerifyPaymentResult {
  const { user, setWalletBalance: syncBalance } = useAuthStore();
  const { getWallet } = useWalletService();
  const { verifyPayment } = usePaymentService();

  const [verifyState, setVerifyState] = useState<VerifyState>("loading");
  const [order, setOrder] = useState<PaymentHistoryItem | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const refreshWallet = useCallback(() => {
    if (!user) return;
    getWallet()
      .then((res: any) => {
        const d = res?.data ?? res;
        if (d?.balance != null) {
          setWalletBalance(d.balance);
          syncBalance(d.balance);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const verify = useCallback(() => {
    if (!orderCode || !user) {
      setVerifyState("pending");
      return;
    }
    setVerifyState("loading");
    verifyPayment(orderCode)
      .then((res: any) => {
        const d: PaymentHistoryItem = res?.data ?? res;
        setOrder(d);
        if (d.status === "PAID") {
          setVerifyState("paid");
          refreshWallet();
        } else if (d.status === "CANCELLED") {
          setVerifyState("cancelled");
        } else {
          setVerifyState("pending");
        }
      })
      .catch(() => setVerifyState("pending"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderCode, user, retryCount]);

  // Verify lần đầu khi mount
  useEffect(() => {
    verify();
  }, [verify]);

  // Auto-retry mỗi 3 giây khi PENDING (tối đa 5 lần)
  useEffect(() => {
    if (verifyState !== "pending" || retryCount >= 5) return;
    const t = setTimeout(() => setRetryCount((c) => c + 1), 3000);
    return () => clearTimeout(t);
  }, [verifyState, retryCount]);

  return { verifyState, order, walletBalance, retryCount };
}
