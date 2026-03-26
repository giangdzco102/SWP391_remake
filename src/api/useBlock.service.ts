/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import useHttpClient from "./useHttpClient";
import { useMemo } from "react";

const useBlockService = () => {
  const httpClient = useHttpClient();

  /** POST /users/blocks — Chặn người dùng */
  const blockUser = (userId: number | string, reason?: string): Promise<any> =>
    httpClient.post(APP_CONFIG.USER.BLOCK, { userId, reason });

  /** DELETE /users/blocks/{userId} — Bỏ chặn người dùng */
  const unblockUser = (userId: number | string): Promise<any> =>
    httpClient.delete(APP_CONFIG.USER.UNBLOCK(userId));

  /** GET /users/blocks — Danh sách người dùng đã chặn */
  const getBlockList = (): Promise<any> =>
    httpClient.get(APP_CONFIG.USER.BLOCK_LIST);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ({ blockUser, unblockUser, getBlockList }), [httpClient]);
};

export default useBlockService;
