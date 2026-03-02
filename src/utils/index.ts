import APP_CONFIG from "@/config/app-config";

// Lay access token tu localStorage
// Kiem tra typeof window de tranh loi khi chay tren server
export const getAccessToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(APP_CONFIG.ACCESS_TOKEN);
  }
  return null;
};

export default class Utils {
  static API_REPORT_QUERY_KEY = "tab";
  static API_DEMO_QUERY_KEY = "tab";
  static MANAGE_SDK_QUERY_KEY = "tab";
  static API_SETTINGS_QUERY_KEY = "tab";
  static DOWNLOAD_SDK_QUERY_KEY = "tab";
  static SESSION_QUERY_KEY = "tab";

  static REDIRECT_QUERY_KEY = "redirect";
  static SDK_PLATFORMS: any[] = ["android", "ios", "web"];
  static emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  static DOCUMENT_TYPES: any[] = [
    {
      label: "id",
      key: "idr",
      countries: ["vn", "idn"],
    },
    {
      label: "passport",
      key: "passport",
      countries: ["vn", "fil", "idn"],
    },
    {
      label: "dlr",
      key: "dlr",
      countries: ["vn", "fil", "idn"],
    },
  ];

  static DOCUMENT_COUNTRIES: any[] = ["vn", "fil", "idn"];

  // Chuyen doi object thanh query string
  static parseObjectToParam(object: Record<string, string | number>): string {
    return Object.entries(object).reduce(
      (p, c) =>
        p +
        `${
          c[1]
            ? `${p !== "?" ? "&" : ""}${
                Array.isArray(c[1])
                  ? c[1].map((v) => `${c[0]}=${v}`).join("&")
                  : `${c[0]}=${encodeURIComponent(c[1])}`
              }`
            : ""
        }`,
      "?"
    );
  }

  // Chuyen kich thuoc file (bytes) thanh chuoi de doc
  static formatSize(size: number) {
    const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    let i = 0;
    while (size >= 1024) {
      size /= 1024;
      ++i;
    }
    return `${size.toFixed(1)} ${units[i]}`;
  }

  // Them dau phay vao so
  static formatNumber(str: string | number) {
    return `${str}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}

// Ham loai bo dau tieng viet
export function removeVietnameseTones(str: string) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str.replace(/ + /g, " ");
  str = str.trim();
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    ""
  );
  return str;
}

export function formatString(input: string): string {
  return input
    .toLowerCase() // Chuyển thành chữ thường
    .trim() // Xoá khoảng trắng đầu/cuối
    .replace(/\s+/g, "-"); // Thay thế khoảng trắng bằng dấu gạch ngang
}

export function convertMarkerLinks(input: string): string {
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

  return input.replace(regex, (_, text, link) => {
    return `<a href="${link}" class="marker-link" target="_blank" rel="noopener noreferrer">${text}</a>`;
  });
}
