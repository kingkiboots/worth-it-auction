"use server";

import { createServerSideClient } from "@/shared/db/server";
import { revalidatePath } from "next/cache";

// 🔒 Server Action은 페이지 UI와 무관하게 직접 호출 가능한 엔드포인트이므로,
// 페이지의 권한 체크와 별개로 액션 내부에서도 반드시 master 권한을 재검증합니다.
async function assertMasterAndGetClient() {
  const supabase = await createServerSideClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다.");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "master") {
    throw new Error("권한이 없습니다.");
  }

  return supabase;
}

// 💡 경매 시작 액션: 시작 시간을 현재로, 종료 시간을 넉넉히(예: 4시간 뒤) 설정합니다.
export async function startAuction() {
  const supabase = await assertMasterAndGetClient();
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
  const supabase = await assertMasterAndGetClient();
  const now = new Date();

  await supabase
    .from("global_settings")
    .upsert({ id: "auction_end_time", value: now.toISOString() });

  revalidatePath("/admin");
  revalidatePath("/");
}

// 💡 경매 대기 상태로 초기화 (테스트용 리셋)
export async function resetAuction() {
  const supabase = await assertMasterAndGetClient();
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

// 화면에 보여줄 관리자 액션 처리 결과 (place_bid RPC와 동일한 { success, message } 형태)
export type AdminActionResult = { success: boolean; message: string };

// 💡 경매 결과 초기화 액션: 모든 물품의 낙찰자·낙찰가와 모든 유저의 크레딧을 초기값으로 되돌리고 입찰 이력을 비웁니다.
// 여러 테이블을 한 트랜잭션으로 갱신하면서 RLS도 우회해야 하므로, 실제 초기화와
// '경매 종료 여부' 검증은 DB 함수(reset_auction_results RPC)가 담당합니다.
export async function resetAuctionResults(): Promise<AdminActionResult> {
  const supabase = await assertMasterAndGetClient();

  const { data, error } = await supabase.rpc("reset_auction_results");

  if (error) {
    return {
      success: false,
      message: `초기화에 실패했습니다. (${error.message})`,
    };
  }

  const result = data as AdminActionResult;

  if (result.success) {
    // 낙찰 정보와 크레딧은 경매장·내 입찰 목록·헤더 등 여러 화면에서 쓰이므로 전체 경로를 갱신합니다.
    revalidatePath("/", "layout");
  }

  return result;
}
