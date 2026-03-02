/* eslint-disable @typescript-eslint/no-explicit-any */
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
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  location: string;
}

const Auth = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isLogin = searchParams.get("login") !== null;
  const isRegister = searchParams.get("register") !== null;
  const [step, setStep] = React.useState<"register" | "verify">("register");
  const [registerEmail, setRegisterEmail] = React.useState<string>("");
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
          {isLogin && <LoginForm />}

          {isRegister && step === "register" && (
            <RegisterForm
              onSuccess={(email) => {
                console.log("SWITCH TO VERIFY");
                setRegisterEmail(email);
                setStep("verify");
              }}
            />
          )}

          {isRegister && step === "verify" && (
            <VerifyOtpForm email={registerEmail} />
          )}
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
      password: "Giangdzco102@",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await login(data);
      toast.showByCode(TOAST_KEYS.LOGIN, TOAST_CODES.SUCCESS);
      router.push("/");
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

const RegisterForm = ({
  onSuccess,
}: {
  onSuccess: (email: string) => void;
}) => {
  const { signup } = useAuthService();
  const { setLoading } = useAppStore();
  const toast = useToast();
  const router = useRouter();
  const [serverError, setServerError] = React.useState("");
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      location: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const response = await signup({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        fullName: data.fullName,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        location: data.location,
      });

      if (response.email) {
        toast.success(response.message);
        onSuccess(data.email);
        console.log("Signup successful, email:", data.email);
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Đăng ký thất bại";
      setServerError(message);
      toast.error(message);
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
        {/* Họ tên */}
        <div className="form-group">
          <label className="form-label-bold">Họ và tên</label>
          <Controller
            name="fullName"
            control={control}
            rules={{ required: "Họ và tên là bắt buộc" }}
            render={({ field }) => (
              <input
                {...field}
                className="form-input"
                placeholder="Nguyễn Văn A"
              />
            )}
          />
          {errors.fullName && (
            <p className="error">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
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
                type="email"
                className="form-input"
                placeholder="email@example.com"
              />
            )}
          />
          {errors.email && <p className="error">{errors.email.message}</p>}
        </div>

        {/* SĐT */}
        <div className="form-group">
          <label className="form-label-bold">Số điện thoại</label>
          <Controller
            name="phone"
            control={control}
            rules={{ required: "Số điện thoại là bắt buộc" }}
            render={({ field }) => (
              <input
                {...field}
                className="form-input"
                placeholder="0886xxxxxx"
              />
            )}
          />
          {errors.phone && <p className="error">{errors.phone.message}</p>}
        </div>

        {/* Ngày sinh */}
        <div className="form-group">
          <label className="form-label-bold">Ngày sinh</label>
          <Controller
            name="dateOfBirth"
            control={control}
            rules={{ required: "Ngày sinh là bắt buộc" }}
            render={({ field }) => (
              <input {...field} type="date" className="form-input" />
            )}
          />
          {errors.dateOfBirth && (
            <p className="error">{errors.dateOfBirth.message}</p>
          )}
        </div>

        {/* Giới tính */}
        <div className="form-group">
          <label className="form-label-bold">Giới tính</label>
          <Controller
            name="gender"
            control={control}
            rules={{ required: "Vui lòng chọn giới tính" }}
            render={({ field }) => (
              <select {...field} className="form-input">
                <option value="">-- Chọn giới tính --</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
              </select>
            )}
          />
          {errors.gender && <p className="error">{errors.gender.message}</p>}
        </div>

        {/* Địa chỉ */}
        <div className="form-group">
          <label className="form-label-bold">Địa chỉ</label>
          <Controller
            name="location"
            control={control}
            rules={{ required: "Địa chỉ là bắt buộc" }}
            render={({ field }) => (
              <input {...field} className="form-input" placeholder="Hà Nội" />
            )}
          />
          {errors.location && (
            <p className="error">{errors.location.message}</p>
          )}
        </div>

        {/* Mật khẩu */}
        <div className="form-group">
          <label className="form-label-bold">Mật khẩu</label>
          <Controller
            name="password"
            control={control}
            rules={{
              required: "Mật khẩu là bắt buộc",
              minLength: { value: 6, message: "Ít nhất 6 ký tự" },
            }}
            render={({ field }) => (
              <input {...field} type="password" className="form-input" />
            )}
          />
          {errors.password && (
            <p className="error">{errors.password.message}</p>
          )}
        </div>

        {/* Xác nhận mật khẩu */}
        <div className="form-group">
          <label className="form-label-bold">Xác nhận mật khẩu</label>
          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: "Vui lòng xác nhận mật khẩu",
              validate: (value) =>
                value === watch("password") || "Mật khẩu không khớp",
            }}
            render={({ field }) => (
              <input {...field} type="password" className="form-input" />
            )}
          />
          {errors.confirmPassword && (
            <p className="error">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button type="submit" className="btn-full btn-red-full mt-4">
          Đăng ký
        </button>
      </form>
      {serverError && (
        <p style={{ color: "#c23d3f", marginTop: 8 }}>{serverError}</p>
      )}

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

const VerifyOtpForm = ({ email }: { email: string }) => {
  const { verifyOtp } = useAuthService();
  const { setLoading } = useAppStore();
  const toast = useToast();
  const router = useRouter();
  const [serverError, setServerError] = React.useState("");

  const { control, handleSubmit } = useForm<{ otp: string }>();

  const onSubmit = async (data: { otp: string }) => {
    setLoading(true);
    setServerError("");

    try {
      const response = await verifyOtp({
        email,
        otp: data.otp,
      });

      if (response.enabled) {
        toast.success("Đăng ký thành công!");
        router.push("/");
      }
    } catch (error: any) {
      setServerError(
        error?.response?.data?.message || "OTP không hợp lệ hoặc đã hết hạn",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Email hiển thị nhưng không cho sửa */}
      <div className="form-group">
        <label className="form-label-bold">Email</label>
        <input value={email} disabled className="form-input" />
      </div>

      {/* Nhập OTP */}
      <div className="form-group">
        <label className="form-label-bold">Mã OTP</label>
        <Controller
          name="otp"
          control={control}
          rules={{
            required: "Vui lòng nhập OTP",
            minLength: { value: 6, message: "OTP phải đủ 6 số" },
            maxLength: { value: 6, message: "OTP phải đủ 6 số" },
          }}
          render={({ field }) => (
            <input
              {...field}
              className="form-input"
              placeholder="Nhập 6 số OTP"
            />
          )}
        />
      </div>

      {serverError && (
        <p className="error" style={{ marginTop: 8 }}>
          {serverError}
        </p>
      )}

      <button type="submit" className="btn-full btn-red-full mt-4">
        Xác nhận OTP
      </button>
    </form>
  );
};
