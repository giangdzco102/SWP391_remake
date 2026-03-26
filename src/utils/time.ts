import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale("vi");

const VN_TZ = "Asia/Ho_Chi_Minh";

/**
 * Chuyển chuỗi thời gian UTC (dù có hay không có chữ Z) sang giờ Việt Nam
 * rồi format theo pattern truyền vào.
 * Mặc định: 'HH:mm DD/MM/YYYY'
 */
export const formatVNTime = (
  raw: string | null | undefined,
  pattern = "HH:mm DD/MM/YYYY"
): string => {
  if (!raw) return "—";
  return dayjs.utc(raw).tz(VN_TZ).format(pattern);
};

/** Format chỉ ngày: DD/MM/YYYY */
export const formatVNDate = (raw: string | null | undefined) =>
  formatVNTime(raw, "DD/MM/YYYY");

/** Format đầy đủ: HH:mm:ss DD/MM/YYYY */
export const formatVNDateTime = (raw: string | null | undefined) =>
  formatVNTime(raw, "HH:mm:ss DD/MM/YYYY");

export const timeStartToNow = (createAt: string | Date) => {
  const created = dayjs.utc(createAt as string).tz(VN_TZ);
  const now = dayjs().tz(VN_TZ);
  const diffInMinutes = now.diff(created, "minute");

  if (diffInMinutes < 1440) {
    // < 1 ngày
    return created.fromNow();
  } else if (diffInMinutes < 2880) {
    // < 2 ngày
    return "Hôm qua";
  } else {
    return created.format("DD/MM/YYYY");
  }
};

export function getGreeting() {
  // Return default greeting on server-side rendering
  if (typeof window === "undefined") {
    return "Chào bạn";
  }

  const currentHour = new Date().getHours();
  if (currentHour >= 5 && currentHour < 12) {
    return "Chào buổi sáng";
  } else if (currentHour >= 12 && currentHour < 18) {
    return "Chào buổi chiều";
  } else {
    return "Chào buổi tối";
  }
}

/**
 * Khởi tạo theme mode dựa theo thời gian trong ngày.
 * Trả về 'dark' nếu từ 18h đến 6h sáng, ngược lại trả về 'light'.
 */
export function initThemeModeByTime(): "dark" | "light" {
  // Always return 'light' on server-side rendering
  if (typeof window === "undefined") {
    return "light";
  }

  const hour = new Date().getHours();
  if (hour >= 18 || hour < 6) {
    return "dark";
  }
  return "light";
}

export const showTimeStart1 = (createAt: string) => {
  const d = dayjs.utc(createAt).tz(VN_TZ);
  const now = dayjs().tz(VN_TZ);
  const c = now.diff(d, "minute");
  if (c < 1440) return d.fromNow();
  if (c < 2880) return "Hôm qua";
  return d.format("D/M/YYYY");
};

type DateFormat =
  | "YYYY"
  | "YYYYMM"
  | "DDMMYY"
  | "YYYYMMDD"
  | "DDMMYYYYvsHHMM"
  | "DDMM"
  | "YYYYMMDDvsHHMM"
  | "DDMMYYYY"
  | "HHMM";

export function formatDate(date: string | Date, format: DateFormat): string {
  const regex = /^\d{2}:\d{2}$/;
  const d =
    typeof date == "string" && regex.test(date)
      ? new Date(`1970-01-01 ${date}`)
      : new Date(date);

  // Use a default date for server-side rendering to avoid hydration mismatch
  const nowDate =
    typeof window !== "undefined"
      ? new Date()
      : new Date("2024-01-01T00:00:00Z");

  const year = d.getFullYear().toString() ?? nowDate.getFullYear().toString();
  const month =
    (d.getMonth() + 1).toString().padStart(2, "0") ??
    (nowDate.getMonth() + 1).toString().padStart(2, "0");
  const day =
    d.getDate().toString().padStart(2, "0") ??
    nowDate.getDate().toString().padStart(2, "0");
  const hours =
    d.getHours().toString().padStart(2, "0") ??
    nowDate.getHours().toString().padStart(2, "0");
  const minutes =
    d.getMinutes().toString().padStart(2, "0") ??
    nowDate.getMinutes().toString().padStart(2, "0");
  switch (format) {
    case "YYYY":
      return `${year}`;
    case "YYYYMM":
      return `Tháng ${month}/${year}`;
    case "YYYYMMDD":
      return `${year}-${month}-${day}`;
    case "DDMMYYYYvsHHMM":
      return `${day}/${month}/${year}, ${hours}:${minutes}`;
    case "DDMMYYYY":
      return `${day}/${month}/${year}`;
    case "DDMMYY":
      return `${day}/${month}/${year.slice(2, 4)}, ${hours}:${minutes}`;
    case "DDMM":
      return `${day}/${month}`;
    case "YYYYMMDDvsHHMM":
      return `${year}-${month}-${day}, ${hours}:${minutes}`;
    case "HHMM":
      return `${hours}:${minutes}`;
    default:
      throw new Error("Invalid format type");
  }
}
