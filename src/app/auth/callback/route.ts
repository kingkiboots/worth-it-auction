import { ROUTES } from "@/shared/config/routes";
import { createServerSideClient } from "@/shared/db/server";
import { createUrlWithParams } from "@/shared/utils/api-utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get(ROUTES.PARAMS.CODE); // OAuth 기본 스펙 키값
  // 로그인이 끝나고 돌아갈 목적지 (기본값은 메인 랭킹보드)
  const next = searchParams.get(ROUTES.PARAMS.NEXT) ?? ROUTES.HOME;

  if (code) {
    const supabase = await createServerSideClient();
    // 카카오가 준 code를 진짜 로그인 세션(쿠키)으로 교환
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // 💡 닉네임 대신 is_setup_completed 상태를 조회합니다.
      const { data: userProfile } = await supabase
        .from("users")
        .select("is_setup_completed")
        .eq("id", data.user.id)
        .single();

      // 온보딩(설정)을 완료하지 않은 유저라면 무조건 설정 화면으로!
      if (!userProfile?.is_setup_completed) {
        return NextResponse.redirect(`${origin}${ROUTES.SETUP_PROFILE}`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const failureUrl = createUrlWithParams(ROUTES.LOGIN, {
    [ROUTES.PARAMS.ERROR]: "auth-failed",
  });

  return NextResponse.redirect(`${origin}${failureUrl}`);
}
