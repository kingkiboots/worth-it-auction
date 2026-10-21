import { createServerSideClient } from "@/shared/db/server";
import { getCurrentUser } from "@/shared/db/dal";
import { WinnerProfiles } from "@/entities/auction/types/acution-items.types";
import { RealtimeAuctionList } from "./RealtimeAuctionList";

// 이 컴포넌트는 오직 데이터를 가져오는 역할만 합니다.
export async function AuctionListContainer() {
  const supabase = await createServerSideClient();
  const user = await getCurrentUser();

  // 경매목록 조회 (낙찰자 프로필은 users를 조인해서 한 번에 가져옵니다)
  const { data: auctionItems } = await supabase
    .from("auction_items")
    .select(
      "id,title,current_price,winner_id,rank_color,description,winner:users(nickname,profile_image)",
    )
    .order("current_price", { ascending: false });

  // 전역 설정에서 경매 종료 시간 가져오기
  const { data: settings } = await supabase
    .from("global_settings")
    .select("id, value")
    .in("id", ["auction_end_time"]);

  const endTimeStr = settings?.find((s) => s.id === "auction_end_time")?.value;

  // 현재 시간과 비교하여 종료 여부(isClosed) 판별
  const isClosed = endTimeStr ? new Date() > new Date(endTimeStr) : false;

  // 💡 낙찰자 프로필은 Realtime으로 바뀌는 winner_id와 따로 캐시하기 위해 winner_id → 프로필 맵으로 분리합니다.
  const winnerProfiles: WinnerProfiles = {};
  const items = (auctionItems ?? []).map(({ winner, ...item }) => {
    if (item.winner_id && winner) winnerProfiles[item.winner_id] = winner;
    return item;
  });

  return (
    <RealtimeAuctionList
      initialItems={items}
      initialWinnerProfiles={winnerProfiles}
      userId={user?.id}
      isAuctionClosed={isClosed}
    />
  );
}
