export default class APP_CONFIG {
  static ACCESS_TOKEN = "access_token";
  static REFRESH_TOKEN = "refresh_token";
  static API_URL = process.env.NEXT_PUBLIC_BASE_URL;
  static FIREBASE = {
    APIKEY: "AIzaSyDxto9TSGB6gyLIrO_TPNUj671ajdi5SHg",
    AUTH_DOMAIN: "affiliate-e80ad.firebaseapp.com",
    PROJECT_ID: "affiliate-e80ad",
    STORAGE_BUCKET: "affiliate-e80ad.firebasestorage.app",
    MESSAGING_SENDER_ID: "450519252584",
    APP_ID: "1:450519252584:web:76292245d3cf8652cdc5dd",
    MEASUREMENT_ID: "G-KN34PM1725",
  };

  static AUTH = {
    SIGNUP: "/account",
    SIGNIN: "/auth/login",
    GETME: "/account/me",
    SIGNIN_WITH_GOOGLE: "/authorization/system/google/login",
    LOGOUT: "/auth/logout",
  };

  static CONVERSATION = {
    END_POINT: "/conversation",
    GET: (param: string) => `/conversation${param}`,
  };

  static TOPIC = {
    END_POINT: "/topic",
    GET: (param: string) => `/topic${param}`,
  };
  static TOOLS = {
    SEARCH_RENT_HOUSE: "/agent-tool/search-rent-house",
    SEARCH_BUY_HOUSE: "/agent-tool/search-buy-house",
  };

  static BLOG = {
    END_POINT: "/blog",
    GET: (param: string) => `/blog${param}`,
    GET_DETAIL: (id: string) => `/blog/${id}`,
  };
}
