import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TOAST_KEYS, TOAST_CODES } from "@/config/toast-messages";
import { useForm, Controller } from "react-hook-form";
import useAuthService from "@/api/useAuth.service";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/stores";
import { Ico } from "../Icons";

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

const Auth = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isLogin = searchParams.get("login") !== null;
  const isRegister = searchParams.get("register") !== null;

  const handleClose = () => {
    router.push("/");
  };

  if (!isLogin && !isRegister) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {isLogin ? "Đăng nhập" : "Tạo tài khoản"}
          </div>
          <button className="modal-close" onClick={handleClose}>
            <Ico.X />
          </button>
        </div>
        <div className="modal-body">
          <p className="modal-desc">
            {isLogin
              ? "Chào mừng quay lại!"
              : "Tham gia cộng đồng — sau khi đăng ký, chọn vai trò Tác giả, Reviewer hoặc Editor."}
          </p>
          {isRegister ? <RegisterForm /> : <LoginForm />}
        </div>
      </div>
    </div>
  );
};

export default Auth;

// render content login
const LoginForm = () => {
  const { login } = useAuthService();
  const { setLoading } = useAppStore();
  const toast = useToast();
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "giangxauzai0303@gmail.com",
      password: "Giangdzco1023@",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      console.log("DATA SUBMIT:", data);
      const response = await login(data);
      if (response) {
        toast.showByCode(TOAST_KEYS.LOGIN, TOAST_CODES.SUCCESS);
        router.push("/");
      } else {
        toast.showByCode(TOAST_KEYS.LOGIN, TOAST_CODES.UNPROCESSABLE);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.showByCode(TOAST_KEYS.LOGIN, TOAST_CODES.UNPROCESSABLE);
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push("?register");
  };

  return (
    <div className="modal-sections">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label className="form-label-bold">Email</label>
          <Controller
            name="email"
            control={control}
            rules={{ required: "Email là bắt buộc" }}
            render={({ field }) => (
              <input
                {...field}
                className="form-input"
                placeholder="email@example.com"
                type="email"
              />
            )}
          />
          {errors.email && (
            <div style={{ color: "#c23d3f", fontSize: 13, marginTop: 4 }}>
              {errors.email.message}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label-bold">Mật khẩu</label>
          <Controller
            name="password"
            control={control}
            rules={{
              required: "Mật khẩu là bắt buộc",
              minLength: {
                value: 1,
                message: "Mật khẩu phải có ít nhất 6 ký tự",
              },
            }}
            render={({ field }) => (
              <input
                {...field}
                className="form-input"
                placeholder="Mật khẩu"
                type="password"
              />
            )}
          />
          {errors.password && (
            <div style={{ color: "#c23d3f", fontSize: 13, marginTop: 4 }}>
              {errors.password.message}
            </div>
          )}
        </div>

        <button type="submit" className="btn-full btn-red-full mt-4">
          Đăng nhập
        </button>
      </form>

      <div
        style={{
          textAlign: "center",
          marginTop: 16,
          fontSize: 13,
          color: "#6b5a4e",
        }}
      >
        Chưa có tài khoản?{" "}
        <span
          style={{ color: "#c23d3f", cursor: "pointer", fontWeight: 600 }}
          onClick={navigateToRegister}
        >
          Đăng ký ngay
        </span>
      </div>
    </div>
  );
};

// render content register
const RegisterForm = () => {
  const { signup, login } = useAuthService();
  const { setLoading } = useAppStore();
  const toast = useToast();
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const response = await signup({
        full_name: data.name || data.email,
        email: data.email,
        password: data.password,
      });

      if (response.statusCode === 200) {
        login({ email: data.email, password: data.password });
        toast.showByCode(TOAST_KEYS.LOGIN, TOAST_CODES.SUCCESS);
        router.push("/");
      } else {
        toast.showByCode(TOAST_KEYS.LOGIN, TOAST_CODES.SUCCESS);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.showByCode(TOAST_KEYS.LOGIN, TOAST_CODES.UNPROCESSABLE);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push("?login");
  };

  return (
    <div className="modal-sections">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label className="form-label-bold">Họ và tên</label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                className="form-input"
                placeholder="Nguyễn Văn A"
                type="text"
              />
            )}
          />
        </div>

        <div className="form-group">
          <label className="form-label-bold">Email</label>
          <Controller
            name="email"
            control={control}
            rules={{
              required: "Email là bắt buộc",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Email không hợp lệ",
              },
            }}
            render={({ field }) => (
              <input
                {...field}
                className="form-input"
                placeholder="email@example.com"
                type="email"
              />
            )}
          />
          {errors.email && (
            <div style={{ color: "#c23d3f", fontSize: 13, marginTop: 4 }}>
              {errors.email.message}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label-bold">Mật khẩu</label>
          <Controller
            name="password"
            control={control}
            rules={{
              required: "Mật khẩu là bắt buộc",
              minLength: {
                value: 6,
                message: "Mật khẩu phải có ít nhất 6 ký tự",
              },
            }}
            render={({ field }) => (
              <input
                {...field}
                className="form-input"
                placeholder="Ít nhất 6 ký tự"
                type="password"
              />
            )}
          />
          {errors.password && (
            <div style={{ color: "#c23d3f", fontSize: 13, marginTop: 4 }}>
              {errors.password.message}
            </div>
          )}
        </div>

        <button type="submit" className="btn-full btn-red-full mt-4">
          Đăng ký
        </button>
      </form>

      <div
        style={{
          textAlign: "center",
          marginTop: 16,
          fontSize: 13,
          color: "#6b5a4e",
        }}
      >
        Đã có tài khoản?{" "}
        <span
          style={{ color: "#c23d3f", cursor: "pointer", fontWeight: 600 }}
          onClick={navigateToLogin}
        >
          Đăng nhập
        </span>
      </div>
    </div>
  );
};
