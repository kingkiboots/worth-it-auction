"use client";

import { ROUTES } from "@/shared/config/routes";
import { createClientSideClient } from "@/shared/db/client";
import { createUrlWithParams } from "@/shared/utils/api-utils";

export function KakaoLoginButton() {
  const supabase = createClientSideClient();

  const handleKakaoLogin = async () => {
    const redirectToUrl = createUrlWithParams(ROUTES.API.AUTH_CALLBACK, {
      [ROUTES.PARAMS.NEXT]: ROUTES.AUCTION,
    });

    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}${redirectToUrl}`,
      },
    });
  };

  return (
    <button
      onClick={handleKakaoLogin}
      className="flex items-center justify-center w-full py-3 bg-[#FEE500] text-black font-semibold rounded-lg hover:bg-[#FDD800] transition-colors"
    >
      <svg className="w-5 h-5 mr-2" /* 카카오 아이콘 SVG */ viewBox="0 0 24 24">
        <path
          d="M12 3c-5.5 0-10 3.5-10 7.8 0 2.8 1.8 5.2 4.4 6.6-.2.8-.7 2.6-.8 3-.1.4.1.4.3.3.3-.2 3.6-2.4 4.1-2.8.6.1 1.3.1 2 .1 5.5 0 10-3.5 10-7.8S17.5 3 12 3z"
          fill="currentColor"
        />
      </svg>
      카카오로 시작하기
    </button>
  );
}
