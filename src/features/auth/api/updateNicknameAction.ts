"use server";

import { redirect } from "next/navigation";
import { ROUTES } from "@/shared/config/routes";
import { createServerSideClient } from "@/shared/db/server";

export async function updateNicknameAction(formData: FormData) {
  const rawNickname = formData.get("nickname");
  const nickname =
    typeof rawNickname === "string" ? rawNickname.trim() : "";

  // 🔒 클라이언트의 minLength는 우회 가능하므로 서버에서도 반드시 재검증합니다.
  if (nickname.length < 2 || nickname.length > 20) {
    throw new Error("닉네임은 2~20자로 입력해 주세요.");
  }

  const supabase = await createServerSideClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  // 닉네임 업데이트와 동시에 온보딩 완료(true) 처리
  const { error } = await supabase
    .from("users")
    .update({
      nickname: nickname,
      is_setup_completed: true,
    })
    .eq("id", user.id);

  if (error) throw new Error("프로필 설정에 실패했습니다.");

  redirect(ROUTES.AUCTION);
}
