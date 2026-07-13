import { createServerSideClient } from "@/shared/db/server";
import { getCurrentUser } from "@/shared/db/dal";
import { AdminFloatingButtonUI } from "./AdminFloatingButtonUI"; // 💡 추가

export async function AdminFloatingButton() {
  const user = await getCurrentUser();

  if (!user) return null;

  const supabase = await createServerSideClient();
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  // 마스터 권한이 없으면 UI 자체를 브라우저에 내려보내지 않음 (철벽 방어)
  if (!profile || profile.role !== "master") return null;

  // 💡 권한이 확인된 마스터에게만 클라이언트 UI 렌더링
  return <AdminFloatingButtonUI />;
}
