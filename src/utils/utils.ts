type DocumentTypeDefine = {
  label: string;
  key: any;
  countries: any[];
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
  static DOCUMENT_TYPES: DocumentTypeDefine[] = [
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

  static formatSize(size: number) {
    const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    let i = 0;
    while (size >= 1024) {
      size /= 1024;
      ++i;
    }
    return `${size.toFixed(1)} ${units[i]}`;
  }

  //   static getColorFromStatus(status: any) {
  //     switch (status) {
  //       case SesssionStatusEnum.SUCCESS: {
  //         return "success";
  //       }
  //       case SesssionStatusEnum.NOT_COMPLETE: {
  //         return "warning";
  //       }
  //       case SesssionStatusEnum.TIME_OUT: {
  //         return "timeout";
  //       }
  //       default: {
  //         return "danger";
  //       }
  //     }
  //   }

  static formatNumber(str: string | number) {
    return `${str}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  static downloadFileFromBlob(data: string, fileName: string, type?: string) {
    const blob = new Blob(["\ufeff", data], {
      type: type ? type : "text/plain",
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
    anchor.remove();
  }
}
export const convertLocaltimeToUTC = (
  dateString: string,
  timeString: string
): string => {
  const localDate = new Date(`${dateString}T${timeString}`);
  return localDate.toISOString();
};

export const checkImage = (fileName: string): boolean => {
  const regex = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i;
  return regex.test(fileName);
};
