"use server";

import { createServerSideClient } from "@/shared/db/server";
import { revalidatePath } from "next/cache";

// 💡 경매 시작 액션: 시작 시간을 현재로, 종료 시간을 넉넉히(예: 4시간 뒤) 설정합니다.
export async function startAuction() {
  const supabase = await createServerSideClient();
  const now = new Date();
  const future = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4시간 뒤

  await supabase
    .from("global_settings")
    .upsert({ id: "auction_start_time", value: now.toISOString() });
  await supabase
    .from("global_settings")
    .upsert({ id: "auction_end_time", value: future.toISOString() });

  revalidatePath("/admin"); // 어드민 페이지 새로고침
  revalidatePath("/"); // 메인 페이지 새로고침 (유저들에게도 상태 갱신)
}

// 💡 경매 즉시 종료 액션: 종료 시간을 현재 시간으로 덮어버립니다.
export async function endAuction() {
  const supabase = await createServerSideClient();
  const now = new Date();

  await supabase
    .from("global_settings")
    .upsert({ id: "auction_end_time", value: now.toISOString() });

  revalidatePath("/admin");
  revalidatePath("/");
}

// 💡 경매 대기 상태로 초기화 (테스트용 리셋)
export async function resetAuction() {
  const supabase = await createServerSideClient();
  const futureStart = new Date(Date.now() + 24 * 60 * 60 * 1000); // 내일 시작하는 걸로 세팅
  const futureEnd = new Date(Date.now() + 48 * 60 * 60 * 1000);

  await supabase
    .from("global_settings")
    .upsert({ id: "auction_start_time", value: futureStart.toISOString() });
  await supabase
    .from("global_settings")
    .upsert({ id: "auction_end_time", value: futureEnd.toISOString() });

  revalidatePath("/admin");
  revalidatePath("/");
}
