/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import useHttpClient from "./useHttpClient";
import { useMemo } from "react";

export interface CoinPackage {
  id: string;          // "BASIC" | "SAVING" | "POPULAR" | "ADVANCED" | "VIP"
  displayName: string;
  amountVnd: number;
  coinAmount: number;
  bonusPercent: number;
}

export interface CreateLinkResponse {
  orderCode: number;
  packageId: string;
  packageName: string;
  amountVnd: number;
  coinAmount: number;
  bonusPercent: number;
  checkoutUrl: string;
}

export interface PaymentHistoryItem {
  id: number;
  orderCode: number;
  packageId: string;
  packageName: string;
  amountVnd: number;
  coinAmount: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  checkoutUrl: string;
  createdAt: string;
  paidAt: string | null;
}

const usePaymentService = () => {
  const httpClient = useHttpClient();

  /** GET /payment/packages — Danh sách gói coin (public) */
  const getPackages = (): Promise<CoinPackage[]> =>
    httpClient.get<CoinPackage[]>(APP_CONFIG.PAYMENT.PACKAGES);

  /** POST /payment/create-link 🔒 — Tạo link PayOS */
  const createPaymentLink = (packageId: string): Promise<CreateLinkResponse> =>
    httpClient.post<CreateLinkResponse>(APP_CONFIG.PAYMENT.CREATE_LINK, { packageId });

  /** GET /payment/history 🔒 — Lịch sử đơn nạp */
  const getPaymentHistory = (): Promise<PaymentHistoryItem[]> =>
    httpClient.get<PaymentHistoryItem[]>(APP_CONFIG.PAYMENT.HISTORY);

  /** GET /payment/verify/{orderCode} 🔒 — Verify trạng thái sau khi redirect */
  const verifyPayment = (orderCode: string | number): Promise<PaymentHistoryItem> =>
    httpClient.get<PaymentHistoryItem>(APP_CONFIG.PAYMENT.VERIFY(orderCode));

  /** POST /payment/recover 🔒 — Recover coin cho tất cả đơn PENDING */
  const recoverPayments = (): Promise<PaymentHistoryItem[]> =>
    httpClient.post<PaymentHistoryItem[]>(APP_CONFIG.PAYMENT.RECOVER, {});

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ({ getPackages, createPaymentLink, getPaymentHistory, verifyPayment, recoverPayments }), [httpClient]);
};

export default usePaymentService;
