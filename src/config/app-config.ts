export default class APP_CONFIG {
  static ACCESS_TOKEN = "access_token";
  static REFRESH_TOKEN = "refresh_token";
  static API_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // ── Auth ─────────────────────────────────────────────────────────────────
  static AUTH = {
    SIGNIN:              "/auth/login",
    SIGNUP:              "/auth/sign-up",
    VERIFY_OTP:          "/auth/sign-up/verify-otp",
    RESEND_OTP:          "/auth/sign-up/resend-otp",
    RESEND_VERIFICATION: "/auth/resend-verification",
    LOGOUT:              "/auth/logout",
    REFRESH:             "/auth/refresh",
    FORGOT_PASSWORD:     "/auth/forgot-password",
    RESET_PASSWORD:      "/auth/reset-password",
    VERIFY_EMAIL:        "/auth/verify",
    OAUTH2_VERIFY_OTP:   "/auth/oauth2/verify-otp",
  };

  // ── User ──────────────────────────────────────────────────────────────────
  static USER = {
    GETME:           "/users/me",
    UPDATE_PROFILE:  "/users/me",
    UPLOAD_AVATAR:   "/users/me/avatar",
    CHANGE_PASSWORD: "/users/me/change-password",
    BLOCK:           "/users/blocks",
    UNBLOCK:         (userId: string | number) => `/users/blocks/${userId}`,
    BLOCK_LIST:      "/users/blocks",
  };

  // ── Story ─────────────────────────────────────────────────────────────────
  static STORY = {
    LIST:           "/stories",
    MY:             "/stories/my",
    SEARCH:         "/stories/search",
    CREATE:         "/stories",
    GET:            (id: string | number) => `/stories/${id}`,
    UPDATE:         (id: string | number) => `/stories/${id}`,
    DELETE:         (id: string | number) => `/stories/${id}`,
    DETAIL:         (id: string | number) => `/stories/${id}/detail`,
    SUBMIT:         (id: string | number) => `/stories/${id}/submit`,
    SET_COMPLETION: (id: string | number) => `/stories/${id}/completion-status`,
    RANKINGS:       "/stories/rankings",
    TOP_RATED:      "/stories/top-rated",
    COMPLETED:      "/stories/completed",
    BY_CATEGORY:    (categoryId: string | number) => `/stories/category/${categoryId}`,
  };

  // ── Bookmark ──────────────────────────────────────────────────────────────
  static BOOKMARK = {
    UPSERT:    (storyId: string | number, chapterId: string | number) => `/bookmarks/story/${storyId}/chapter/${chapterId}`,
    DELETE:    (storyId: string | number) => `/bookmarks/story/${storyId}`,
    LIST:      "/bookmarks",
    GET_STORY: (storyId: string | number) => `/bookmarks/story/${storyId}`,
  };

  // ── Chapter ───────────────────────────────────────────────────────────────
  static CHAPTER = {
    BY_STORY:  (storyId: string | number) => `/chapters/story/${storyId}`,
    CREATE:    (storyId: string | number) => `/chapters/story/${storyId}`,
    GET:       (id: string | number) => `/chapters/${id}`,
    UPDATE:    (id: string | number) => `/chapters/${id}`,
    DELETE:    (id: string | number) => `/chapters/${id}`,
    PURCHASE:  (id: string | number) => `/chapters/${id}/purchase`,
    SUBMIT:    (id: string | number) => `/chapters/${id}/submit`,   // DRAFT/EDITED → PENDING_REVIEW
    PUBLISH:   (id: string | number) => `/chapters/${id}/publish`,  // APPROVED → PUBLISHED
    SCHEDULE:  (id: string | number) => `/chapters/${id}/schedule`, // APPROVED → SCHEDULED
  };

  // ── Category ──────────────────────────────────────────────────────────────
  static CATEGORY = {
    LIST:   "/categories",
    CREATE: "/categories",
    UPDATE: (id: string | number) => `/categories/${id}`,
    DELETE: (id: string | number) => `/categories/${id}`,
  };

  // ── Follow ────────────────────────────────────────────────────────────────
  static FOLLOW = {
    LIST:   "/follows",
    TOGGLE: (storyId: string | number) => `/follows/${storyId}`,
    STATUS: (storyId: string | number) => `/follows/${storyId}/status`,
  };

  // ── Comment ───────────────────────────────────────────────────────────────
  static COMMENT = {
    CREATE:      "/comments",
    BY_CHAPTER:  (chapterId: string | number) => `/comments/chapter/${chapterId}`,
    DELETE:      (id: string | number) => `/comments/${id}`,
  };

  // ── Report ────────────────────────────────────────────────────────────────
  static REPORT = {
    CREATE: "/reports",
    MY:     "/reports/my",
  };

  // ── Notification ──────────────────────────────────────────────────────────
  static NOTIFICATION = {
    LIST:         "/notifications",
    UNREAD_COUNT: "/notifications/unread-count",
    MARK_ALL:     "/notifications/mark-all-read",
    MARK_ONE:     (id: number | string) => `/notifications/${id}/read`,
    DELETE:       (id: number | string) => `/notifications/${id}`,
  };

  // ── Mission ───────────────────────────────────────────────────────────────
  static MISSION = {
    LIST:     "/missions",
    MY:       "/missions/my",
    CLAIM:    (missionId: string | number) => `/missions/${missionId}/claim`,
    COMPLETE: (missionId: string | number) => `/missions/${missionId}/complete`,
  };

  // ── Streak ────────────────────────────────────────────────────────────────
  static STREAK = {
    STATUS:   "/streak/status",
    CHECK_IN: "/streak/check-in",
  };

  // ── Role Change Request ───────────────────────────────────────────────────
  static ROLE_CHANGE = {
    CREATE: "/role-change-requests",
    MY:     "/role-change-requests/my",
  };

  // ── Withdraw Request ──────────────────────────────────────────────────────
  static WITHDRAW = {
    CREATE: "/withdraw-requests",
    MY:     "/withdraw-requests/my",
  };

  // ── Wallet ────────────────────────────────────────────────────────────────
  static WALLET = {
    GET:          "/wallet",
    TOPUP:        "/wallet/topup",
    TRANSACTIONS: "/wallet/transactions",
  };

  // ── Payment (PayOS) ───────────────────────────────────────────────────────
  static PAYMENT = {
    PACKAGES:    "/payment/packages",
    CREATE_LINK: "/payment/create-link",
    HISTORY:     "/payment/history",
    VERIFY:      (orderCode: string | number) => `/payment/verify/${orderCode}`,
    RECOVER:     "/payment/recover",
  };

  // ── Gift ──────────────────────────────────────────────────────────────────
  static GIFT = {
    SEND:     "/gifts",
    BY_STORY: (storyId: string | number) => `/gifts/story/${storyId}`,
    SENT:     "/gifts/sent",
    RECEIVED: "/gifts/received",
  };

  // ── Reviewer ──────────────────────────────────────────────────────────────
  static REVIEWER = {
    PENDING_STORIES:    "/reviewer/stories/pending",
    PENDING_CHAPTERS:   "/reviewer/chapters/pending",
    STORY_DETAIL:       (id: string | number) => `/reviewer/stories/${id}/detail`,
    CHAPTER_DETAIL:     (id: string | number) => `/reviewer/chapters/${id}`,
    REVIEW_STORY:       (id: string | number) => `/reviewer/stories/${id}/review`,
    REVIEW_CHAPTER:     (id: string | number) => `/reviewer/chapters/${id}/review`,
    REVIEW_HISTORY:     "/reviewer/history",
    HISTORY_STORIES:    "/reviewer/history/stories",
    HISTORY_CHAPTERS:   "/reviewer/history/chapters",
    HISTORY_BY_STORY:   (storyId: string | number) => `/reviewer/history/story/${storyId}`,
    HISTORY_BY_CHAPTER: (chapterId: string | number) => `/reviewer/history/chapter/${chapterId}`,
  };

  // ── Editor ─────────────────────────────────────────────────────────────────
  static EDITOR = {
    CHAPTER_VERSIONS: (chapterId: string | number) => `/editor/chapters/${chapterId}/versions`,
  };

  // ── Edit Request Marketplace ───────────────────────────────────────────────
  static EDIT_REQUEST = {
    // Author side
    CREATE:   "/edit-requests",
    MY:       "/edit-requests/my",
    APPROVE:  (id: string | number) => `/edit-requests/${id}/approve`,
    REJECT:   (id: string | number) => `/edit-requests/${id}/reject`,
    CANCEL:   (id: string | number) => `/edit-requests/${id}/cancel`,
    // Editor side
    OPEN:     "/edit-requests/open",
    ASSIGNED: "/edit-requests/assigned",
    ASSIGN:   (id: string | number) => `/edit-requests/${id}/assign`,
    SUBMIT:   (id: string | number) => `/edit-requests/${id}/submit`,
    WITHDRAW: (id: string | number) => `/edit-requests/${id}/withdraw`,
  };

  // ── Admin ─────────────────────────────────────────────────────────────────
  static ADMIN = {
    DASHBOARD:               "/admin/dashboard",
    USERS:                   "/admin/users",
    UPDATE_USER_ROLES:       "/admin/users/roles",
    PENDING_STORIES:         "/admin/stories/pending",
    REVIEW_STORY:            (id: string | number) => `/admin/stories/${id}/review`,
    ALL_REPORTS:             "/admin/reports",
    PENDING_REPORTS:         "/admin/reports/pending",
    RESOLVE_REPORT:          (id: string | number) => `/admin/reports/${id}/resolve`,
    ALL_ROLE_REQUESTS:       "/admin/role-change-requests",
    PENDING_ROLE_REQUESTS:   "/admin/role-change-requests/pending",
    REVIEW_ROLE_REQUEST:     "/admin/role-change-requests/review",
    ALL_WITHDRAW_REQUESTS:   "/admin/withdraw-requests",
    PENDING_WITHDRAW:        "/admin/withdraw-requests/pending",
    APPROVE_WITHDRAW:        (id: string | number) => `/admin/withdraw-requests/${id}/approve`,
    REJECT_WITHDRAW:         (id: string | number) => `/admin/withdraw-requests/${id}/reject`,
    TOGGLE_USER_STATUS:      (id: string | number) => `/admin/users/${id}/toggle-status`,
    CREATE_MISSION:          "/admin/missions",
    UPDATE_MISSION:          (id: string | number) => `/admin/missions/${id}`,
    DELETE_MISSION:          (id: string | number) => `/admin/missions/${id}`,

    // System Ops & Coin Monitoring
    SYSTEM_STATS:            "/admin/system/stats",
    SYSTEM_LOGS:             "/admin/system/logs",
    SYSTEM_ALERTS:           "/admin/system/alerts",
    RUN_STATS_JOB:           "/admin/jobs/stats-aggregator",
    COIN_STATS_DAILY:        "/admin/coins/stats-daily",
    RUN_SETTLEMENT_JOB:      "/admin/jobs/monthly-settlement",
  };
}

