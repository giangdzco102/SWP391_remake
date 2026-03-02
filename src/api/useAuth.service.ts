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
} from "@/types/auth";
import { Response } from "@/types/global";
import useHttpClient from "./useHttpClient";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/config/firebase";
// Định nghĩa kiểu dữ liệu trả về cho các hàm conversation

export type ResultAuthService = {
  signin: (payload: PayloadSignin) => Promise<Response<any>>;
  signup: (payload: PayloadSignup) => Promise<any>;
  signout: (payload: PayloadLogout) => Promise<any>;
  getMe: () => Promise<any>;
  siginWithGoogle: () => Promise<any>;
  login: (payload: PayloadSignin) => Promise<DataSignin | undefined>;
  logout: (payload: PayloadLogout) => void;
}; 

const useAuthService = (): ResultAuthService => {
  const { setUser } = useAuthStore();
  const httpClient = useHttpClient();

  const signin = (payload: PayloadSignin): Promise<Response<DataSignin>> => {
    const requestBody: RequestSignin = {
      email: payload.email,
      password: payload.password,
    };
    return httpClient.post(APP_CONFIG.AUTH.SIGNIN, requestBody);
  };

  const signup = (payload: PayloadSignup) => {
    const { email, password: hashed_password, full_name } = payload;
    const requestBody: RequestSignup = {
      user_name: email,
      hashed_password,
      full_name,
      avatar: null,
      date_of_birth: null,
      email,
      phone_number: null,
      address: null,
      role_id: null,
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
        // localStorage.setItem("user_info", JSON.stringify(responseGetMe.data));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error; // Rethrow the error to be handled by the caller
    }
  };

  const siginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const response = await httpClient.post<Response<DataSignin>>(
        APP_CONFIG.AUTH.SIGNIN_WITH_GOOGLE,
        {
          email: user.email || "",
          full_name: user.displayName || "",
        },
      );
      if (response && response.data && response.status) {
        // Lưu token vào localStorage hoặc cookie
        if (typeof window !== "undefined") {
          localStorage.setItem(
            APP_CONFIG.ACCESS_TOKEN,
            response.data.accessToken,
          );
          localStorage.setItem(
            APP_CONFIG.REFRESH_TOKEN,
            response.data.refreshToken,
          );
        }
        const responseGetMe = await getMe();
        return responseGetMe; // Trả về thông tin người dùng
      }
    } catch (error) {
      console.error("Google login error:", error);
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
            responseSigin.accessToken,
          );
          localStorage.setItem(
            APP_CONFIG.REFRESH_TOKEN,
            responseSigin.refreshToken,
          );
        }
        setUser(responseSigin);
        return responseSigin; // Trả về thông tin người dùng
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
    siginWithGoogle,
    login,
    logout,
  };
};

export default useAuthService;
