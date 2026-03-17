/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import useHttpClient from "./useHttpClient";

export type ResultReportService = {
  /** POST /reports */
  createReport: (payload: { targetType: string; targetId: number; reason: string }) => Promise<any>;
};

const useReportService = (): ResultReportService => {
  const httpClient = useHttpClient();

  const createReport = (payload: { targetType: string; targetId: number; reason: string }): Promise<any> => {
    return httpClient.post(APP_CONFIG.REPORT.CREATE, payload);
  };

  return { createReport };
};

export default useReportService;
