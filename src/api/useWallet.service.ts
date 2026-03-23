/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import useHttpClient from "./useHttpClient";
import { useMemo } from "react";

const useWalletService = () => {
  const httpClient = useHttpClient();

  /** GET /wallet — Lấy thông tin ví */
  const getWallet = (): Promise<any> =>
    httpClient.get(APP_CONFIG.WALLET.GET);

  /** POST /wallet/topup — Nạp coin */
  const topup = (amount: number): Promise<any> =>
    httpClient.post(APP_CONFIG.WALLET.TOPUP, { amount });

  /** GET /wallet/transactions — Lịch sử giao dịch */
  const getTransactions = (): Promise<any> =>
    httpClient.get(APP_CONFIG.WALLET.TRANSACTIONS);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ({ getWallet, topup, getTransactions }), [httpClient]);
};

export default useWalletService;
