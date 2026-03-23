/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import useHttpClient from "./useHttpClient";
import { useMemo } from "react";

export interface Mission {
  id: number;
  name: string;
  description: string;
  rewardCoin: number;
  type: "DAILY" | "READ";
  targetCount: number;
  icon?: string;
  displayOrder: number;
}

export interface UserMission {
  id: number;
  mission: Mission;
  completed: boolean;
  progress: number;
  completedAt?: string;
}

const useMissionService = () => {
  const httpClient = useHttpClient();

  /** GET /missions — Lấy tất cả nhiệm vụ công khai */
  const getAllMissions = (): Promise<any> =>
    httpClient.get(APP_CONFIG.MISSION.LIST);

  /** GET /missions/my — Lấy nhiệm vụ của tôi (kèm tiến độ) */
  const getMyMissions = (): Promise<any> =>
    httpClient.get(APP_CONFIG.MISSION.MY);

  /** POST /missions/{id}/complete — Hoàn thành nhiệm vụ và nhận thưởng */
  const completeMission = (missionId: number | string): Promise<any> =>
    httpClient.post(APP_CONFIG.MISSION.COMPLETE(missionId));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ({ getAllMissions, getMyMissions, completeMission }), [httpClient]);
};

export default useMissionService;
