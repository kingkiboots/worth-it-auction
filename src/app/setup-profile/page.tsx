import { redirect } from "next/navigation";
import { ROUTES } from "@/shared/config/routes";
import { createServerSideClient } from "@/shared/db/server";
import { updateNicknameAction } from "@/features/auth/api/update-nickname-action";
import { generateRandomNickname } from "@/features/auth/lib/nickname-generator";

export default async function SetupProfilePage() {
  // 1. 서버에서 현재 로그인한 유저 정보 확인
  const supabase = await createServerSideClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(ROUTES.LOGIN);

  // 2. 트리거가 넣어준 기본 닉네임 가져오기
  const { data: userProfile } = await supabase
    .from("users")
    .select("nickname")
    .eq("id", user.id)
    .single();

  const defaultNickname = userProfile?.nickname || generateRandomNickname();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">프로필 확인</h1>
          <p className="mt-2 text-sm text-gray-600">
            카카오톡 이름이 기본으로 설정되었습니다.
            <br />
            원하신다면 경매장 전용 닉네임으로 변경해 주세요!
          </p>
        </div>

        <form action={updateNicknameAction} className="space-y-4">
          <input
            type="text"
            name="nickname"
            required
            defaultValue={defaultNickname}
            minLength={2}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
          />
          <button
            type="submit"
            className="w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            이 이름으로 경매장 입장하기
          </button>
        </form>
      </div>
    </div>
  );
}
