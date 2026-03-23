/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import useHttpClient from "./useHttpClient";
import { useMemo } from "react";

export type PayloadRoleChangeRequest = {
  requestedRole: "AUTHOR" | "REVIEWER" | "EDITOR";
  reason?: string;
};

export type ResultRoleChangeService = {
  /** POST /api/role-change-requests */
  createRequest: (payload: PayloadRoleChangeRequest) => Promise<any>;
  /** GET /api/role-change-requests/my */
  getMyRequests: () => Promise<any>;
};

const useRoleChangeService = (): ResultRoleChangeService => {
  const httpClient = useHttpClient();

  const createRequest = (payload: PayloadRoleChangeRequest): Promise<any> =>
    httpClient.post(APP_CONFIG.ROLE_CHANGE.CREATE, payload);

  const getMyRequests = (): Promise<any> =>
    httpClient.get(APP_CONFIG.ROLE_CHANGE.MY);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ({ createRequest, getMyRequests }), [httpClient]);
};

export default useRoleChangeService;
