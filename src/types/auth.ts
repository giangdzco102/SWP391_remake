export type RequestSignup = {
  email: string | null;
  password: string | null;
  confirmPassword: string | null;
  fullName: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  location: string;
};

export interface PayloadForgotPassword {
  email: string;
}

export interface PayloadResetPassword {
  email: string;
  otp: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface PayloadChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export type verifyOtp = {
  email: string;
  otp: string;
};

export type PayloadSignup = {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  location: string;
};

export type PayloadSignin = {
  email: string;
  password: string;
};

export type PayloadLogout = {
  refreshToken: string;
};

export interface PayloadUpdateProfile {
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  dateOfBirth?: string; // yyyy-MM-dd
  gender?: "MALE" | "FEMALE" | "OTHER";
  location?: string;
}

export type RequestSignin = {
  email: string;
  password: string;
};

export type DataSignin = {
  accessToken: string;
  refreshToken: string;
};

export interface DataGetMe {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
  provider: string;
  enabled: boolean;
  avatarUrl: string | null;
  bio: string | null;
  phone: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | string;
  location: string;
  walletBalance: number;
  totalFollowedStories: number;
  totalPurchasedChapters: number;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  is_active: boolean;
  bs_code: string;
  created_at: string;
  updated_at: string;
  name: string;
  role_permission: RolePermission[];
}

export interface RolePermission {
  is_active: boolean;
  permission: Permission;
}

export interface Permission {
  id: number;
  bs_code: string;
  is_active: boolean;
  permission_name: string;
}
