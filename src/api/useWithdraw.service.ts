import useHttpClient from "./useHttpClient";
import { WithdrawRequest, WithdrawResponse } from "@/types/auth";
import { useMemo } from "react";

const useWithdrawService = () => {
  const httpClient = useHttpClient();

  const createWithdrawRequest = async (payload: WithdrawRequest): Promise<WithdrawResponse> => {
    const response: any = await httpClient.post("/withdraw-requests", payload);
    return response.data;
  };

  const getMyWithdrawRequests = async (): Promise<WithdrawResponse[]> => {
    const response: any = await httpClient.get("/withdraw-requests/my");
    return response.data;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ({
    createWithdrawRequest,
    getMyWithdrawRequests,
  }), [httpClient]);
};

export default useWithdrawService;
