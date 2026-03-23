/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import useHttpClient from "./useHttpClient";
import { useMemo } from "react";

export interface WithdrawRequest {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  note?: string;
}

export interface WithdrawResponse {
  id: number;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

const useWithdrawService = () => {
  const httpClient = useHttpClient();

  /** POST /withdraw-requests — Tạo yêu cầu rút tiền */
  const createWithdrawRequest = (data: WithdrawRequest): Promise<any> =>
    httpClient.post(APP_CONFIG.WITHDRAW.CREATE, data);

  /** GET /withdraw-requests/my — Lấy danh sách yêu cầu rút tiền của mình */
  const getMyWithdrawRequests = (): Promise<any> =>
    httpClient.get(APP_CONFIG.WITHDRAW.MY);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ({ createWithdrawRequest, getMyWithdrawRequests }), [httpClient]);
};

export default useWithdrawService;
