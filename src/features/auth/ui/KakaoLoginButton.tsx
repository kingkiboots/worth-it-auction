// src/features/auth/ui/KakaoLoginButton.tsx (경로는 프로젝트에 맞게!)
"use client";

import { useState } from "react";
import { createClientSideClient } from "@/shared/db/client";
import { ButtonSpinner } from "@/shared/ui/ButtonSpinner";
import { createUrlWithParams } from "@/shared/utils/api-utils";
import { ROUTES } from "@/shared/config/routes";

export function KakaoLoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientSideClient();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const redirectToUrl = createUrlWithParams(ROUTES.API.AUTH_CALLBACK, {
        [ROUTES.PARAMS.NEXT]: ROUTES.AUCTION,
      });
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: `${window.location.origin}${redirectToUrl}`,
        },
      });

      if (error) throw error;
      // 성공 시 카카오 페이지로 리다이렉트 되므로 setIsLoading(false)를 생략
    } catch (error) {
      console.error("로그인 에러:", error);
      setIsLoading(false); // 에러가 났을 때만 버튼을 다시 풀어준다.
      alert("로그인 중 문제가 발생했습니다.");
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className="relative flex items-center justify-center w-full py-4 text-lg font-black text-black bg-[#FEE500] rounded-2xl hover:bg-[#FADA0A] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          {/* 카카오 노란 배경에 맞게 스피너 색상을 어둡게(text-black/30, text-black) 처리 */}
          <ButtonSpinner className="w-5 h-5 text-black" />
          카카오톡으로 이동 중...
        </span>
      ) : (
        "카카오로 1초 만에 시작하기"
      )}
    </button>
  );
}
