"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores";
import useAuthService from "@/api/useAuth.service";
import APP_CONFIG from "@/config/app-config";

/**
 * Hook để check token ở localStorage và gọi API getMe
 */
export function useCheckAuth() {
  const { user, setLoading } = useAuthStore();
  const { getMe } = useAuthService();

  useEffect(() => {
    const checkAuth = async () => {
      if (user) {
        return;
      }

      // Check token trong localStorage
      if (typeof window !== "undefined") {
        const token = localStorage.getItem(APP_CONFIG.ACCESS_TOKEN);

        if (token) {
          setLoading(true);
          try {
            await getMe();
          } catch (error: any) {
            // Không văng lỗi đỏ lóe lên màn hình Next.js (overlay) khi hết hạn token (401)
            if (error?.response?.status !== 401) {
              console.error("Failed to get user info:", error);
            }
            // Nếu lỗi (kể cả 401), xóa token không hợp lệ
            localStorage.removeItem(APP_CONFIG.ACCESS_TOKEN);
            localStorage.removeItem(APP_CONFIG.REFRESH_TOKEN);
          } finally {
            setLoading(false);
          }
        }
      }
    };

    checkAuth();
  }, [user]);
}
