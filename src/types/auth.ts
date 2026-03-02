export type RequestSignup = {
  user_name: string;
  hashed_password: string;
  full_name: string | null;
  date_of_birth: string | null;
  email: string;
  phone_number: string | null;
  avatar: string | null;
  role_id: number | null;
  address?: string | null;
};

export type PayloadSignup = {
  email: string;
  password: string;
  full_name: string;
};

export type PayloadSignin = {
  email: string;
  password: string;
};

export type PayloadLogout = {
  refreshToken: string;
};

export type RequestSignin = {
  email: string;
  password: string;
};

export type DataSignin = {
  accessToken: string;
  refreshToken: string;
};

export interface DataGetMe {
  // id: number;
  // is_active: boolean;
  // bs_code: string;
  // created_at: string;
  // updated_at: string;
  // user_name: string;
  // full_name: string;
  // date_of_birth: string;
  // email_address: string;
  // phone_number: string;
  // avatar: string;
  // role: Role;
  accessToken: string;
  refreshToken: string;
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
