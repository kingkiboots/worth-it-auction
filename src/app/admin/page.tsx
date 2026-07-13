import { redirect } from "next/navigation";
import { ROUTES } from "@/shared/config/routes";
import {
  startAuction,
  endAuction,
  resetAuction,
} from "@/features/admin/api/actions";
import { createServerSideClient } from "@/shared/db/server";
import { getCurrentUser } from "@/shared/db/dal";
import { AdminSubmitButton } from "@/features/admin/ui/AdminSubmitButton";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(ROUTES.AUCTION);
  }

  const supabase = await createServerSideClient();

  // 💡 [변경]: 이메일 상수가 아닌 DB에서 유저의 role을 조회합니다.
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  // 마스터 권한이 없다면 퇴출
  if (!profile || profile.role !== "master") {
    redirect(ROUTES.AUCTION);
  }

  // 기존 설정 데이터 페칭 및 JSX 렌더링 로직 동일...
  const { data: settings } = await supabase
    .from("global_settings")
    .select("id, value");
  const startTimeStr = settings?.find(
    (s) => s.id === "auction_start_time",
  )?.value;
  const endTimeStr = settings?.find((s) => s.id === "auction_end_time")?.value;

  const now = new Date();
  const startTime = startTimeStr ? new Date(startTimeStr) : new Date(0);
  const endTime = endTimeStr ? new Date(endTimeStr) : new Date(0);

  let currentStatus = "알 수 없음";
  let statusColor = "text-gray-500 bg-gray-100";

  if (now < startTime) {
    currentStatus = "대기 중 (시작 전)";
    statusColor = "text-blue-700 bg-blue-100 border-blue-200";
  } else if (now >= startTime && now <= endTime) {
    currentStatus = "🔥 실시간 경매 진행 중";
    statusColor = "text-red-700 bg-red-100 border-red-200 animate-pulse";
  } else if (now > endTime) {
    currentStatus = "경매 종료됨";
    statusColor = "text-gray-700 bg-gray-200 border-gray-300";
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-6">
      {/* 기존 UI와 동일 */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-black px-6 py-6 text-center">
          <h1 className="text-2xl font-black text-white tracking-tight">
            전시회 상황 경매 통제실
          </h1>
          <p className="text-gray-400 text-sm mt-1">마스터 계정 전용</p>
        </div>
        <div className="p-8 text-center border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-500 mb-3">
            현재 시스템 상태
          </h2>
          <div
            className={`inline-block px-6 py-3 rounded-full border-2 text-xl font-extrabold ${statusColor}`}
          >
            {currentStatus}
          </div>
        </div>
        <div className="p-8 flex flex-col gap-4">
          <form action={startAuction}>
            <AdminSubmitButton
              text="▶️ 경매 시작하기 (오픈)"
              loadingText="시작 시간 설정 중..."
              className="bg-blue-600 hover:bg-blue-700 text-white"
            />
          </form>

          <form action={endAuction}>
            <AdminSubmitButton
              text="⏹️ 경매 즉시 종료 (마감)"
              loadingText="마감 처리 중..."
              className="bg-red-500 hover:bg-red-600 text-white"
            />
          </form>

          <div className="h-px bg-gray-100 my-4"></div>

          <form action={resetAuction}>
            <AdminSubmitButton
              text="🔄 대기 상태로 초기화 (리셋)"
              loadingText="초기화 진행 중..."
              // 하얀 버튼이라 텍스트와 스피너를 어두운 색으로 지정
              className="bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 py-3 text-sm"
              spinnerColor="text-gray-500"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
