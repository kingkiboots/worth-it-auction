import { createErrorResponse, createSuccessResponse } from "@/shared/api/utils";
import { createServerSideClient } from "@/shared/db/server";

export async function GET() {
  try {
    const supabase = await createServerSideClient();
    const { count, error } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true });

    if (error) throw error;

    // 공통 헬퍼 함수 사용! 코드가 훨씬 깔끔해집니다.
    return createSuccessResponse(
      {
        totalUsers: count,
        timestamp: new Date().toISOString(),
      },
      "DB 연결 상태가 아주 좋습니다!",
    );
  } catch (error) {
    console.error("DB 연결 실패:", error);
    return createErrorResponse("DB 연결에 실패했습니다.", error);
  }
}
