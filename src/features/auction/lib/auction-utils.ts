import { AuctionItem } from "@/entities/auction/types/acution-items.types";

/**
 * 실시간 경매 물품 정렬 함수
 * * Q. 처음 로드할 때 DB에서 정렬해서 내려주는데 왜 이 함수가 또 필요할까요?
 * A. Supabase Realtime(웹소켓)은 데이터 변경 시 '전체 리스트'가 아닌 '바뀐 한 줄(Row)'만 쏴줍니다.
 * 따라서 한 물품의 가격이 오르면 프론트엔드 메모리 상의 배열 값만 바뀔 뿐, 순서는 그대로 고정됩니다.
 * 이 함수를 통해 값이 바뀔 때마다 배열을 다시 정렬(Re-sort)해 주어야 랭킹 순위가 붕괴되지 않으며,
 * 순서가 재배치되는 순간 GSAP FLIP이 이를 감지하여 쫘라라락 이동하는 애니메이션을 정상적으로 수행합니다.
 * * @param items 정렬할 경매 물품 배열
 * @returns 가격 내림차순(비싼 순), 가격이 같다면 ID 오름차순으로 정렬된 새 배열
 */
export const sortAuctionItems = (items: AuctionItem[]): AuctionItem[] => {
  return [...items].sort((a, b) => {
    // 1. 현재 최고 입찰가가 더 높은 물품을 위로 올립니다.
    if (b.current_price !== a.current_price) {
      return b.current_price - a.current_price;
    }
    // 2. 입찰가가 완벽히 같다면 기본 고유 ID 순서(기본 배치 순서)를 유지합니다.
    return a.id - b.id;
  });
};

/**
 * [상세 모달 상태 실시간 업데이트 함수
 * * Q. 이 처리가 왜 필요할까요?
 * A. 유저가 특정 물품의 상세 모달창을 열어놓고 입찰 금액을 고민하는 사이, 다른 사람이 선수를 쳐서
 * 가격을 더 높게 올릴 수 있습니다. 이 상태에서 유저가 이전 가격 정보를 토대로 입찰을 시도하면
 * DB 트랜잭션(RPC) 단에서 거절당해 튕기게 되므로, 심리스한 UX를 방해합니다.
 * 웹소켓 업데이트가 수신되었을 때 이 함수를 실행하여 현재 열려있는 모달 속 아이템의 ID와
 * 변경된 아이템의 ID를 비교하고, 일치할 경우 모달 내부 상태까지 최신 가격으로 즉시 갱신합니다.
 * * @param currentSelected 현재 모달에 선택되어 있는 아이템 상태
 * @param updatedItem 웹소켓으로 수신된 변경된 아이템 데이터
 * @returns 최신 정보로 동기화된 상태 값 또는 기존 상태 값
 */
export const syncSelectedModalItem = (
  currentSelected: AuctionItem | null,
  updatedItem: AuctionItem,
): AuctionItem | null => {
  if (!currentSelected) return null;

  // 현재 유저가 열어놓은 모달의 물품 ID와 실시간으로 바뀐 물품 ID가 같으면 동기화
  return currentSelected.id === updatedItem.id
    ? { ...currentSelected, ...updatedItem }
    : currentSelected;
};
