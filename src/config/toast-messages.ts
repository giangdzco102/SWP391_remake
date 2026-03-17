// Toast message configuration
export interface ToastConfig {
  type: "success" | "error" | "warning" | "info";
  message: string;
  title?: string;
}

export interface ToastMessages {
  [key: string]: {
    [errorCode: string]: ToastConfig;
  };
}

// Constants for easy usage
export const TOAST_KEYS = {
  LOGIN: "login",
  ACCOUNT_LOCKED: "account_locked",
} as const;

export const TOAST_CODES = {
  SUCCESS: "200",
  CREATED: "201",
  BAD_REQUEST: "400",
  UNAUTHORIZED: "401",
  FORBIDDEN: "403",
  NOT_FOUND: "404",
  CONFLICT: "409",
  UNPROCESSABLE: "422",
  TOO_MANY_REQUESTS: "429",
  SERVER_ERROR: "500",
  SERVICE_UNAVAILABLE: "503",
  // Form specific codes
  REQUIRED: "required",
  INVALID_EMAIL: "invalid_email",
  WEAK_PASSWORD: "password_weak",
  PASSWORD_MISMATCH: "password_mismatch",
} as const;

// Configuration for toast messages based on key and error code
export const toastMessages: ToastMessages = {
  // Authentication related messages
  [TOAST_KEYS.LOGIN]: {
    [TOAST_CODES.SUCCESS]: {
      type: "success",
      message: "Đăng nhập thành công",
      title: "Thành công",
    },
    [TOAST_CODES.UNAUTHORIZED]: {
      type: "error",
      message: "Thông tin đăng nhập không chính xác",
      title: "Lỗi xác thực",
    },
    [TOAST_CODES.FORBIDDEN]: {
      type: "error",
      message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
      title: "Tài khoản bị khóa",
    },
    [TOAST_CODES.NOT_FOUND]: {
      type: "error",
      message: "Tài khoản không tồn tại",
      title: "Không tìm thấy",
    },
    [TOAST_CODES.UNPROCESSABLE]: {
      type: "error",
      message: "Dữ liệu đầu vào không hợp lệ",
      title: "Lỗi dữ liệu",
    },
    [TOAST_CODES.SERVER_ERROR]: {
      type: "error",
      message: "Lỗi hệ thống, vui lòng thử lại sau",
      title: "Lỗi server",
    },
  },
  [TOAST_KEYS.ACCOUNT_LOCKED]: {
    "default": {
      type: "error",
      message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.",
      title: "🚫 Tài khoản bị khóa",
    },
  },
};

// Default fallback message
export const defaultToastMessage: ToastConfig = {
  type: "error",
  message: "Đã có lỗi xảy ra, vui lòng thử lại",
  title: "Lỗi",
};

// Helper function to get toast message by key and error code
export function getToastMessage(key: string, errorCode: string): ToastConfig {
  const keyMessages = toastMessages[key];
  if (keyMessages && keyMessages[errorCode]) {
    return keyMessages[errorCode];
  }

  // Fallback to default message
  return {
    ...defaultToastMessage,
    message: `${defaultToastMessage.message} (${key}:${errorCode})`,
  };
}
