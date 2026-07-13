import { createServerSideClient } from "@/shared/db/server";
import { RealtimeAuctionList } from "./RealtimeAuctionList";

// 이 컴포넌트는 오직 데이터를 가져오는 역할만 합니다.
export async function AuctionListContainer() {
  const supabase = await createServerSideClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: auctionItems } = await supabase
    .from("auction_items")
    .select("id,title,current_price,winner_id,rank_color,description")
    .order("current_price", { ascending: false });

  const items = auctionItems ?? [];

  return <RealtimeAuctionList initialItems={items} userId={user?.id} />;
}
