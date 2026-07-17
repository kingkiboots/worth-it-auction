import { createServerSideClient } from "@/shared/db/server";
import { RealtimeMyValuesList } from "./RealtimeMyValuesList";
import { EmptyState } from "@/shared/ui/EmtpyState";
import { ROUTES } from "@/shared/config/routes";

interface Props {
  userId: string;
}

export async function MyValuesListContainer({ userId }: Props) {
  const supabase = await createServerSideClient();

  // 1. 내가 한 번이라도 입찰했던 물품 ID 목록 가져오기
  const { data: myBids } = await supabase
    .from("bids")
    .select("item_id")
    .eq("user_id", userId);

  // 2. Set을 이용해 중복 item_id 제거 (한 물건에 여러 번 입찰했을 수 있으므로)
  const participatedItemIds = myBids
    ? Array.from(
        new Set<number>(
          myBids
            .map((bid) => bid.item_id)
            .filter((item_id) => item_id !== null),
        ),
      )
    : [];

  console.log("participatedItemIds", participatedItemIds);
  // 3. 만약 참여한 기록이 없다면 빈 배열 반환
  if (!participatedItemIds || participatedItemIds.length === 0) {
    <EmptyState
      icon="🏷️"
      title="아직 참여한 경매가 없습니다"
      description={
        <>
          마음에 드는 가치를 발견하고
          <br />첫 번째 입찰의 주인공이 되어보세요.
        </>
      }
      actionHref={ROUTES.AUCTION}
      actionText="경매장으로 이동하기"
    />;
  }

  // 4. 내가 참여했던 물품들의 최신 정보 가져오기 (.in() 필터 사용)
  const { data: myItems } = await supabase
    .from("auction_items")
    .select("id, title, current_price, winner_id, rank_color, description")
    .in("id", participatedItemIds)
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
