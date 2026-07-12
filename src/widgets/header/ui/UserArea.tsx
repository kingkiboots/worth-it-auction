import { UserMenu } from "@/features/auth/ui/UserMenu";
import Link from "next/link";
import { ROUTES } from "@/shared/config/routes";
import { createServerSideClient } from "@/shared/db/server";
import { createUrlWithParams } from "@/shared/utils/api-utils";

export async function UserArea() {
  const supabase = await createServerSideClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userProfile = null;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("nickname, profile_image")
      .eq("id", user.id)
      .single();
    userProfile = data;
  }

  if (userProfile) {
    return (
      <UserMenu
        nickname={userProfile.nickname || "예배자"}
        profileImage={userProfile.profile_image}
      />
    );
  }

  // 로그인 안 했을 때
  const loginUrl = createUrlWithParams(ROUTES.LOGIN, {
    [ROUTES.PARAMS.NEXT]: ROUTES.AUCTION,
  });

  return (
    <Link
      href={loginUrl}
      className="px-4 py-1.5 text-sm font-bold text-[#391B1B] bg-[#FEE500] rounded-full hover:bg-[#FEE500]/90 transition-colors"
    >
      로그인
    </Link>
  );
}
