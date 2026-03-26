export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export type TabKey = "info" | "stories" | "reviews" | "coins" | "withdraw";
