/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import useHttpClient from "./useHttpClient";

export type AdminDashboardStats = {
  totalUsers: number;
  totalStories: number;
  totalChapters: number;
  totalReports: number;
  pendingStories: number;
  pendingReports: number;
  pendingRoleRequests: number;
  pendingWithdrawRequests: number;
};

export type AdminUser = {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
  enabled: boolean;
  avatarUrl: string | null;
  walletBalance: number;
  createdAt: string;
};

export type AdminStory = {
  id: number;
  title: string;
  authorName: string;
  status: string;
  coverUrl: string | null;
  categories: { id: number; name: string }[];
  createdAt: string;
  submittedAt: string;
};

export type AdminReport = {
  id: number;
  reporterName: string;
  targetType: string;
  targetId: number;
  reason: string;
  status: string;
  createdAt: string;
};

export type AdminRoleRequest = {
  id: number;
  requesterName: string;
  requestedRole: string;
  status: string;
  message: string;
  createdAt: string;
};

export type AdminWithdrawRequest = {
  id: number;
  requesterName: string;
  amount: number;
  bankAccount: string;
  bankName: string;
  status: string;
  createdAt: string;
};

export type AdminMission = {
  id: number;
  title: string;
  description: string;
  coinReward: number;
  requiredCount: number;
  missionType: string;
};

export type ResultAdminService = {
  // Dashboard
  getDashboard: () => Promise<AdminDashboardStats>;

  // Users
  getAllUsers: () => Promise<any>;
  updateUserRoles: (userId: number, roles: string[]) => Promise<any>;

  // Stories
  getPendingStories: () => Promise<any>;
  reviewStory: (
    id: number,
    payload: { status: "APPROVED" | "REJECTED"; reviewNote?: string }
  ) => Promise<any>;

  // Reports
  getAllReports: () => Promise<any>;
  getPendingReports: () => Promise<any>;
  resolveReport: (
    id: number,
    payload: { action: string; note?: string }
  ) => Promise<any>;

  // Role change requests
  getAllRoleRequests: () => Promise<any>;
  getPendingRoleRequests: () => Promise<any>;
  reviewRoleRequest: (payload: {
    requestId: number;
    action: "APPROVE" | "REJECT";
    adminNote?: string;
  }) => Promise<any>;

  // Missions (list)
  getMissions: () => Promise<any>;

  // Withdraw requests
  getAllWithdrawRequests: () => Promise<any>;
  getPendingWithdrawRequests: () => Promise<any>;
  approveWithdraw: (id: number) => Promise<any>;
  rejectWithdraw: (id: number, reason?: string) => Promise<any>;

  // Missions
  createMission: (payload: Omit<AdminMission, "id">) => Promise<any>;
  updateMission: (id: number, payload: Partial<AdminMission>) => Promise<any>;
  deleteMission: (id: number) => Promise<any>;
};

const useAdminService = (): ResultAdminService => {
  const httpClient = useHttpClient();

  const getDashboard = (): Promise<AdminDashboardStats> =>
    httpClient.get(APP_CONFIG.ADMIN.DASHBOARD);

  const getAllUsers = (): Promise<any> =>
    httpClient.get(APP_CONFIG.ADMIN.USERS);

  const updateUserRoles = (userId: number, roles: string[]): Promise<any> =>
    httpClient.put(APP_CONFIG.ADMIN.UPDATE_USER_ROLES, { userId, roles });

  const getPendingStories = (): Promise<any> =>
    httpClient.get(APP_CONFIG.ADMIN.PENDING_STORIES);

  const reviewStory = (
    id: number,
    payload: { status: "APPROVED" | "REJECTED"; reviewNote?: string }
  ): Promise<any> =>
    httpClient.post(APP_CONFIG.ADMIN.REVIEW_STORY(id), payload);

  const getAllReports = (): Promise<any> =>
    httpClient.get(APP_CONFIG.ADMIN.ALL_REPORTS);

  const getPendingReports = (): Promise<any> =>
    httpClient.get(APP_CONFIG.ADMIN.PENDING_REPORTS);

  const resolveReport = (
    id: number,
    payload: { action: string; note?: string }
  ): Promise<any> =>
    httpClient.post(APP_CONFIG.ADMIN.RESOLVE_REPORT(id), payload);

  const getAllRoleRequests = (): Promise<any> =>
    httpClient.get(APP_CONFIG.ADMIN.ALL_ROLE_REQUESTS);

  const getPendingRoleRequests = (): Promise<any> =>
    httpClient.get(APP_CONFIG.ADMIN.PENDING_ROLE_REQUESTS);

  const reviewRoleRequest = (payload: {
    requestId: number;
    action: "APPROVE" | "REJECT";
    adminNote?: string;
  }): Promise<any> =>
    httpClient.post(APP_CONFIG.ADMIN.REVIEW_ROLE_REQUEST, payload);

  const getMissions = (): Promise<any> =>
    httpClient.get(APP_CONFIG.MISSION.LIST);

  const getAllWithdrawRequests = (): Promise<any> =>
    httpClient.get(APP_CONFIG.ADMIN.ALL_WITHDRAW_REQUESTS);

  const getPendingWithdrawRequests = (): Promise<any> =>
    httpClient.get(APP_CONFIG.ADMIN.PENDING_WITHDRAW);

  const approveWithdraw = (id: number): Promise<any> =>
    httpClient.post(APP_CONFIG.ADMIN.APPROVE_WITHDRAW(id), {});

  const rejectWithdraw = (id: number, reason?: string): Promise<any> =>
    httpClient.post(APP_CONFIG.ADMIN.REJECT_WITHDRAW(id), { reason });

  const createMission = (payload: Omit<AdminMission, "id">): Promise<any> =>
    httpClient.post(APP_CONFIG.ADMIN.CREATE_MISSION, payload);

  const updateMission = (
    id: number,
    payload: Partial<AdminMission>
  ): Promise<any> =>
    httpClient.put(APP_CONFIG.ADMIN.UPDATE_MISSION(id), payload);

  const deleteMission = (id: number): Promise<any> =>
    httpClient.delete(APP_CONFIG.ADMIN.DELETE_MISSION(id), {});

  return {
    getDashboard,
    getAllUsers,
    updateUserRoles,
    getPendingStories,
    reviewStory,
    getAllReports,
    getPendingReports,
    resolveReport,
    getAllRoleRequests,
    getPendingRoleRequests,
    reviewRoleRequest,
    getAllWithdrawRequests,
    getPendingWithdrawRequests,
    approveWithdraw,
    rejectWithdraw,
    getMissions,
    createMission,
    updateMission,
    deleteMission,
  };
};

export default useAdminService;
