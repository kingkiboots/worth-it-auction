"use client";

import { useEffect, useState } from "react";
import { createClientSideClient } from "@/shared/db/client";
import { AuctionDetailModal } from "@/features/auction/ui/AuctionDetailModal";
import { AuctionItem } from "@/entities/auction/types/acution-items.types";
import { WinningAuctionItemRow } from "@/entities/auction/ui/WinningAuctionItemRow";
import { DefaultAuctionItemRow } from "@/entities/auction/ui/DefaultAuctionItemRow";

interface Props {
  initialItems: AuctionItem[];
  userId: string | undefined;
}

export function RealtimeAuctionList({ initialItems, userId }: Props) {
  // 💡 서버에서 받아온 초기 데이터를 기본값으로 세팅
  const [items, setItems] = useState<AuctionItem[]>(initialItems);
  const [selectedItem, setSelectedItem] = useState<AuctionItem | null>(null); // 💡 모달 상태
  const supabase = createClientSideClient();

  useEffect(() => {
    // 💡 초기 페칭(fetch) 로직 삭제. 바로 실시간 구독만 연결합니다.
    const channel = supabase
      .channel("realtime_auction_items")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "auction_items" },
        (payload) => {
          setItems((currentItems) =>
            currentItems.map((item) =>
              item.id === payload.new.id
                ? { ...item, ...(payload.new as AuctionItem) }
                : item,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // 로딩 중일 때 (스켈레톤이나 빈 화면 처리)
  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        경매 물품을 준비 중입니다...
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col mt-2 pb-20">
        {items.map((item, index) => {
          const isMyWinningItem = userId && item.winner_id === userId;
          const handleRowClick = () => setSelectedItem(item);

          // 💡 복잡한 분기 싹 지우고 레고 블록 갈아끼우듯 처리
          if (isMyWinningItem) {
            return (
              <WinningAuctionItemRow
                key={item.id}
                item={item}
                index={index}
                onClick={handleRowClick}
              />
            );
          }

          return (
            <DefaultAuctionItemRow
              key={item.id}
              item={item}
              index={index}
              onClick={handleRowClick}
            />
          );
        })}
      </div>
      <AuctionDetailModal
        key={selectedItem?.id}
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}
