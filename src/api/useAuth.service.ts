/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuthStore } from "@/stores";
import APP_CONFIG from "@/config/app-config";
import {
  PayloadSignin,
  PayloadSignup,
  RequestSignup,
  RequestSignin,
  DataSignin,
  DataGetMe,
  PayloadLogout,
  verifyOtp,
} from "@/types/auth";
import { Response } from "@/types/global";
import useHttpClient from "./useHttpClient";
// Định nghĩa kiểu dữ liệu trả về cho các hàm conversation

export type ResultAuthService = {
  signin: (payload: PayloadSignin) => Promise<Response<any>>;
  signup: (payload: PayloadSignup) => Promise<any>;
  signout: (payload: PayloadLogout) => Promise<any>;
  getMe: () => Promise<any>;
  login: (payload: PayloadSignin) => Promise<DataGetMe | undefined>;
  logout: (payload: PayloadLogout) => void;
  verifyOtp?: (payload: verifyOtp) => Promise<any>;
};

const useAuthService = (): ResultAuthService => {
  const { setUser } = useAuthStore();
  const httpClient = useHttpClient();

  const verifyOtp = (payload: verifyOtp): Promise<any> => {
    return httpClient.post(APP_CONFIG.AUTH.VERIFY_OTP, payload);
  };

  const signin = (payload: PayloadSignin): Promise<Response<DataSignin>> => {
    const requestBody: RequestSignin = {
      email: payload.email,
      password: payload.password,
    };
    return httpClient.post(APP_CONFIG.AUTH.SIGNIN, requestBody);
  };

  const signup = (payload: PayloadSignup) => {
    const {
      email,
      password,
      confirmPassword,
      fullName,
      phone,
      dateOfBirth,
      gender,
      location,
    } = payload;
    const requestBody: RequestSignup = {
      email,
      password,
      confirmPassword,
      fullName,
      phone,
      dateOfBirth,
      gender,
      location,
    };

    return httpClient.post(APP_CONFIG.AUTH.SIGNUP, requestBody);
  };

  const signout = (payload: PayloadLogout) => {
    return httpClient.post(APP_CONFIG.AUTH.LOGOUT, undefined, {
      params: {
        refreshToken: payload.refreshToken,
      },
    });
  };

  const getMe = async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem(APP_CONFIG.ACCESS_TOKEN)
          : null;
      const responseGetMe = await httpClient.get<Response<DataGetMe>>(
        APP_CONFIG.AUTH.GETME,
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      );

      if (responseGetMe && responseGetMe.data && responseGetMe.status) {
        // Lưu thông tin người dùng vào localStorage hoặc cookie
        setUser(responseGetMe.data);
        return responseGetMe.data;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error; // Rethrow the error to be handled by the caller
    }
  };

  const login = async (payload: PayloadSignin) => {
    try {
      const responseSigin = await signin({ ...payload });
      if (responseSigin) {
        // Lưu token vào localStorage hoặc cookie
        if (typeof window !== "undefined") {
          localStorage.setItem(
            APP_CONFIG.ACCESS_TOKEN,
            responseSigin.data.accessToken,
          );
          localStorage.setItem(
            APP_CONFIG.REFRESH_TOKEN,
            responseSigin.data.refreshToken,
          );
        }
        const responseGetMe = await getMe();
        setUser(responseGetMe); // Cập nhật thông tin người dùng vào store
        return responseGetMe; // Trả về thông tin người dùng
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Rethrow the error to be handled by the caller
    }
  };

  const logout = async (payload: PayloadLogout) => {
    try {
      await signout(payload);
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem(APP_CONFIG.ACCESS_TOKEN);
        localStorage.removeItem(APP_CONFIG.REFRESH_TOKEN);
      }
    }
  };

  return {
    signout,
    signin,
    signup,
    getMe,
    login,
    logout,
    verifyOtp,
  };
};

export default useAuthService;
