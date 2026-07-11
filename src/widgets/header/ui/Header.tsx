import Link from "next/link";
import { ROUTES } from "@/shared/config/routes";
import { UserMenu } from "@/features/auth/ui/UserMenu";
import { createServerSideClient } from "@/shared/db/server";
import { createUrlWithParams } from "@/shared/utils/api-utils";

export async function Header() {
  const supabase = await createServerSideClient();

  // 1. 유저 세션 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. 유저 정보가 있다면 DB에서 닉네임과 프로필 사진 가져오기
  let userProfile = null;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("nickname, profile_image")
      .eq("id", user.id)
      .single();
    userProfile = data;
  }

  // 로그인 버튼 클릭 시 로그인 후 다시 현재 페이지(예: /auction)로 돌아오도록 설정
  const loginUrl = createUrlWithParams(ROUTES.LOGIN, {
    [ROUTES.PARAMS.NEXT]: ROUTES.AUCTION,
  });

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
        {/* 왼쪽: 전시회 타이틀 */}
        <div className="flex items-center flex-1">
          <Link
            href={ROUTES.AUCTION}
            className="text-lg font-bold text-gray-900 tracking-tight"
          >
            삶으로 쓰는 예배{" "}
            <span className="font-light text-gray-500">전(展)</span>
          </Link>
        </div>

        {/* 오른쪽: 로그인 상태에 따른 UI 분기 */}
        <div className="flex justify-end flex-1">
          {userProfile ? (
            // 로그인 O: 드롭다운 메뉴 렌더링
            <UserMenu
              nickname={userProfile?.nickname ?? "예배자"}
              profileImage={userProfile.profile_image}
            />
          ) : (
            // 로그인 X: 카카오톡 로그인 링크
            <Link
              href={loginUrl}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold text-[#391B1B] bg-[#FEE500] rounded-full hover:bg-[#FEE500]/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3c-5.523 0-10 3.535-10 7.896 0 2.825 1.83 5.308 4.606 6.643-.274 1.018-.99 3.673-1.025 3.818-.041.168.06.257.19.167.101-.07 3.235-2.222 4.542-3.13 1.135.253 2.366.398 3.687.398 5.523 0 10-3.535 10-7.896C22 6.535 17.523 3 12 3z" />
              </svg>
              로그인 하기
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
