/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { getAccessToken } from "@/utils/index";

const createBaseInstance = (baseURL?: string): AxiosInstance => {
  const axiosInstance = axios.create({
    baseURL: baseURL || APP_CONFIG.API_URL,
  });

  return axiosInstance;
};

const getRefreshToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(APP_CONFIG.REFRESH_TOKEN);
  }
  return null;
};

const setTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(APP_CONFIG.ACCESS_TOKEN, accessToken);
    localStorage.setItem(APP_CONFIG.REFRESH_TOKEN, refreshToken);
  }
};

const clearTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(APP_CONFIG.ACCESS_TOKEN);
    localStorage.removeItem(APP_CONFIG.REFRESH_TOKEN);
  }
};

const refreshAuthToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  try {
    const response = await axios.post(`${APP_CONFIG.API_URL}/auth/refresh`, {
      refreshToken,
    });
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    setTokens(accessToken, newRefreshToken);
    return accessToken;
  } catch (error) {
    clearTokens();
    throw new Error("Failed to refresh token");
  }
};

export type ResultHttpClient = {
  get: <T>(
    url: string,
    options?: Record<string, string>,
    requestOptions?: AxiosRequestConfig<any>,
  ) => Promise<T>;
  post: <T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig<any>,
  ) => Promise<T>;
  put: <T>(
    url: string,
    data: any,
    options?: Record<string, string>,
  ) => Promise<T>;
  patch: <T>(
    url: string,
    data: any,
    options?: Record<string, string>,
  ) => Promise<T>;
  delete: <T>(
    url: string,
    data: any,
    options?: Record<string, string>,
  ) => Promise<T>;
  axiosBase: AxiosInstance;
};

const handleSuccess = (response: any) => {
  const status = response?.status;
  if (
    (status >= 200 && status < 300) ||
    response?.data?.code === "200" ||
    response?.code === "200"
  ) {
    return response.data;
  }
  throw new Error("Request failed");
};

export default function useHttpClient(
  baseURL?: string,
  isConvert?: boolean,
): ResultHttpClient {
  const router = useRouter();
  const axiosBaseRef = useRef<AxiosInstance>(createBaseInstance(baseURL));
  const axiosAuthRef = useRef<AxiosInstance>(createBaseInstance(baseURL));
  const axiosBase = axiosBaseRef.current;
  const axiosAuth = axiosAuthRef.current;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pathname = window.location.pathname;
    const asPath = window.location.href;
    const queryString = asPath?.split("?")[1] ? `?${asPath.split("?")[1]}` : "";

    const requestInterceptor = axiosAuth.interceptors.request.use(
      async (config: InternalAxiosRequestConfig<any>) => {
        const token = getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        config.headers["ngrok-skip-browser-warning"] = "true";

        return config;
      },
      (error) => Promise.reject(error),
    );

    const responseInterceptor = axiosAuth.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest =
          error.config as InternalAxiosRequestConfig<any> & {
            _retry?: boolean;
          };

        if (error?.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newAccessToken = await refreshAuthToken();
            axiosAuth.defaults.headers.common["Authorization"] =
              `Bearer ${newAccessToken}`;
            originalRequest.headers["Authorization"] =
              `Bearer ${newAccessToken}`;
            return axiosAuth(originalRequest);
          } catch (err) {
            clearTokens();
            if (typeof window !== "undefined" && pathname.includes("/")) {
              router.push(`/`);
            }
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      axiosAuth.interceptors.request.eject(requestInterceptor);
      axiosAuth.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const getAuth = <T>(
    url: string,
    headers: Record<string, string> = {},
    requestOptions?: AxiosRequestConfig<any>,
  ) => {
    return axiosAuth
      .request({
        url,
        method: "GET",
        headers: { ...headers },
        ...(requestOptions ?? {}),
      })
      .then((e) => {
        if (isConvert) return e as T;
        return handleSuccess(e) as T;
      });
  };

  const postAuth = <T>(
    url: string,
    data: any,
    config: AxiosRequestConfig<any> = {},
  ) => {
    return axiosAuth
      .request({
        url,
        method: "POST",
        data,
        ...config,
      })
      .then((e) => (isConvert ? e : handleSuccess(e)) as T);
  };

  const putAuth = <T>(
    url: string,
    data: any,
    headers: Record<string, string> = {},
  ) => {
    return axiosAuth
      .request({
        url,
        method: "PUT",
        data,
        headers: {
          ...headers, // ghi đè các headers khác, nhưng KHÔN truyền Authorization ở đây
        },
      })
      .then((e) => (isConvert ? e : handleSuccess(e)) as T);
  };

  const patchAuth = <T>(
    url: string,
    data: any,
    headers: Record<string, string> = {},
  ) => {
    return axiosAuth
      .request({
        url,
        method: "PATCH",
        data,
        headers: {
          ...headers, // ghi đè các headers khác, nhưng KHÔN truyền Authorization ở đây
        },
      })
      .then((e) => (isConvert ? e : handleSuccess(e)) as T);
  };

  const deleteAuth = <T>(
    url: string,
    data: any,
    options: Record<string, string> = {},
  ) => {
    return axiosAuth
      .request({
        url,
        method: "DELETE",
        data,
        headers: {
          ...options, // ghi đè các headers khác, nhưng KHÔN truyền Authorization ở đây
        },
      })
      .then((e) => (isConvert ? e : handleSuccess(e)) as T);
  };

  return {
    get: getAuth,
    post: postAuth,
    put: putAuth,
    patch: patchAuth,
    delete: deleteAuth,
    axiosBase,
  };
}
