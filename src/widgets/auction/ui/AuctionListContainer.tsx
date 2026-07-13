import { createServerSideClient } from "@/shared/db/server";
import { getCurrentUser } from "@/shared/db/dal";
import { RealtimeAuctionList } from "./RealtimeAuctionList";

// 이 컴포넌트는 오직 데이터를 가져오는 역할만 합니다.
export async function AuctionListContainer() {
  const supabase = await createServerSideClient();
  const user = await getCurrentUser();

  // 경매목록 조회
  const { data: auctionItems } = await supabase
    .from("auction_items")
    .select("id,title,current_price,winner_id,rank_color,description")
    .order("current_price", { ascending: false });

  // 전역 설정에서 경매 종료 시간 가져오기
  const { data: settings } = await supabase
    .from("global_settings")
    .select("id, value")
    .in("id", ["auction_end_time"]);

  const endTimeStr = settings?.find((s) => s.id === "auction_end_time")?.value;

  // 현재 시간과 비교하여 종료 여부(isClosed) 판별
  const isClosed = endTimeStr ? new Date() > new Date(endTimeStr) : false;

  const items = auctionItems ?? [];

  return (
    <RealtimeAuctionList
      initialItems={items}
      userId={user?.id}
      isAuctionClosed={isClosed}
    />
  );
}
