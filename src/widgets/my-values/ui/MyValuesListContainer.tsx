import { createServerSideClient } from "@/shared/db/server";
import { RealtimeMyValuesList } from "./RealtimeMyValuesList";

interface Props {
  userId: string;
}

export async function MyValuesListContainer({ userId }: Props) {
  const supabase = await createServerSideClient();

  const { data: myItems } = await supabase
    .from("auction_items")
    .select("id,title,current_price,winner_id,rank_color,description")
    .eq("winner_id", userId)
    .order("updated_at", { ascending: false });

  // 전역 설정에서 경매 종료 시간 가져오기
  const { data: settings } = await supabase
    .from("global_settings")
    .select("id, value")
    .in("id", ["auction_end_time"]);

  const endTimeStr = settings?.find((s) => s.id === "auction_end_time")?.value;

  // 현재 시간과 비교하여 종료 여부(isClosed) 판별
  const isClosed = endTimeStr ? new Date() > new Date(endTimeStr) : false;

  const items = myItems ?? [];

  return (
    <RealtimeMyValuesList
      initialItems={items}
      userId={userId}
      isAuctionClosed={isClosed}
    />
  );
}
