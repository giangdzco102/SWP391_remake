/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import { toastUtils } from "@/utils/toast-provider";
import { useAppStore } from "@/stores";
import { getToastMessage, ToastConfig } from "@/config/toast-messages";

export function useToast() {
  const { addNotification } = useAppStore();

  const showToast = useCallback(
    (
      type: "success" | "error" | "warning" | "info",
      message: string,
      title?: string,
      options?: any
    ) => {
      // Show React Toastify toast
      toastUtils[type](message, options);

      // Also add to Zustand store for persistence
      if (title) {
        addNotification({
          type,
          title,
          message,
        });
      }
    },
    [addNotification]
  );

  const success = useCallback(
    (message: string, title?: string, options?: any) => {
      showToast("success", message, title, options);
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string, options?: any) => {
      showToast("error", message, title, options);
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string, options?: any) => {
      showToast("warning", message, title, options);
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string, options?: any) => {
      showToast("info", message, title, options);
    },
    [showToast]
  );

  const loading = useCallback((message: string) => {
    return toastUtils.loading(message);
  }, []);

  const update = useCallback((toastId: any, options: any) => {
    toastUtils.update(toastId, options);
  }, []);

  const dismiss = useCallback((toastId?: any) => {
    toastUtils.dismiss(toastId);
  }, []);

  const promise = useCallback(
    <T>(
      promise: Promise<T>,
      messages: {
        pending: string;
        success: string;
        error: string;
      }
    ) => {
      return toastUtils.promise(promise, messages);
    },
    []
  );

  // Method to show toast by key and error code
  const showByCode = useCallback(
    (key: string, errorCode: string, options?: any) => {
      const toastConfig: ToastConfig = getToastMessage(key, errorCode);

      // Show React Toastify toast
      toastUtils[toastConfig.type](toastConfig.message, options);

      // Also add to Zustand store for persistence
      if (toastConfig.title) {
        addNotification({
          type: toastConfig.type,
          title: toastConfig.title,
          message: toastConfig.message,
        });
      }
    },
    [addNotification]
  );

  return {
    success,
    error,
    warning,
    info,
    loading,
    update,
    dismiss,
    promise,
    // Method for showing toast by key and error code
    showByCode,
    // Direct access to toastUtils for advanced usage
    toast: toastUtils,
  };
}
