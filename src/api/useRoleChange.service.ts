/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import useHttpClient from "./useHttpClient";

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

  return { createRequest, getMyRequests };
};

export default useRoleChangeService;
