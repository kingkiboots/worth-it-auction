export const ROUTES = {
  // 1. 화면(Page) 경로
  HOME: "/",
  LOGIN: "/login",
  AUCTION: "/auction",

  // 2. API 및 콜백 경로
  API: {
    HEALTH: "/api/health",
    AUTH_CALLBACK: "/auth/callback",
    TEST_BID: "/api/test-bid",
  },

  // 3. Search Parameters Key 정의 (URL 세트)
  PARAMS: {
    CODE: "code", // OAuth 기본 스펙 키값
    NEXT: "next", // 로그인 후 리다이렉트 타겟 지정용 (?next=/...)
    ERROR: "error", // 인증 에러 전달용 (?error=auth-failed)
  },
} as const;
