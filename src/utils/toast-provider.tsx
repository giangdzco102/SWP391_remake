/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="toast-container"
        style={{ top: "70px", right: "20px", width: "320px" }}
        toastStyle={{
          borderRadius: "12px",
          boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
          fontSize: "13px",
          fontWeight: 500,
          padding: "12px 16px",
          border: "1.5px solid #ece6dc",
        }}
      />
    </>
  );
}

// Export toast utilities
export { toast };

// Custom toast utilities
export const toastUtils = {
  success: (message: string, options?: any) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      ...options,
    });
  },

  error: (message: string, options?: any) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      ...options,
    });
  },

  warning: (message: string, options?: any) => {
    toast.warning(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      ...options,
    });
  },

  info: (message: string, options?: any) => {
    toast.info(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      ...options,
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      position: "top-right",
    });
  },

  update: (toastId: any, options: any) => {
    toast.update(toastId, options);
  },

  dismiss: (toastId?: any) => {
    toast.dismiss(toastId);
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      pending,
      success,
      error,
    }: {
      pending: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, {
      pending,
      success,
      error,
    });
  },
};
