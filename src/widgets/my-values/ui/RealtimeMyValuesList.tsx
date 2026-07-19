"use client";

import { AuctionItem } from "@/entities/auction/types/acution-items.types";
import { applyBidUpdate } from "@/features/auction/lib/auction-utils";
import { AuctionDetailModal } from "@/features/auction/ui/AuctionDetailModal";
import { createClientSideClient } from "@/shared/db/client";
import { useEffect, useState } from "react";

interface Props {
  initialItems: AuctionItem[];
  userId: string;
  isAuctionClosed: boolean;
}

export function RealtimeMyValuesList({
  initialItems,
  userId,
  isAuctionClosed,
}: Props) {
  const [items, setItems] = useState<AuctionItem[]>(initialItems);
  // 모달에 띄울 아이템 상태 추가
  const [selectedItem, setSelectedItem] = useState<AuctionItem | null>(null);
  const supabase = createClientSideClient();

  useEffect(() => {
    const channel = supabase
      .channel("realtime_my_values")
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

          // 만약 모달이 열려있는 상태에서 누군가 또 입찰했다면?
          // 모달 안의 가격도 실시간으로 바뀌게 selectedItem을 업데이트해 줍니다!
          setSelectedItem((currentSelected) =>
            currentSelected?.id === payload.new.id
              ? { ...currentSelected, ...(payload.new as AuctionItem) }
              : currentSelected,
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // 🚀 입찰(재입찰) RPC 성공 시 웹소켓 브로드캐스트를 기다리지 않고 즉시 로컬 상태를 갱신
  const handleBidSuccess = (
    itemId: number,
    newPrice: number,
    winnerId: string,
  ) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? applyBidUpdate(item, newPrice, winnerId) : item,
      ),
    );

    setSelectedItem((currentSelected) =>
      currentSelected?.id === itemId
        ? applyBidUpdate(currentSelected, newPrice, winnerId)
        : currentSelected,
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6">
        {items.map((item) => {
          const isLost = item.winner_id !== userId;

          return (
            <div
              key={item.id}
              className={`flex flex-col p-6 rounded-3xl shadow-sm border relative overflow-hidden transition-all duration-500 ${
                isLost
                  ? "bg-gray-100 border-gray-200 grayscale opacity-70"
                  : "bg-white border-gray-100"
              }`}
            >
              {/* ... (카드 상단 디자인 기존과 동일) ... */}

              {/* 상단 데코 바 */}
              <div
                className={`absolute top-0 left-0 w-full h-2 ${isLost ? "bg-gray-400" : item.rank_color?.split(" ")[0]}`}
              ></div>

              <div className="flex justify-between items-start mb-4 mt-2">
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-lg ${isLost ? "bg-gray-200 text-gray-500" : "bg-gray-100 text-gray-600"}`}
                >
                  상황 #{item.id}
                </span>

                <div className="flex flex-col items-end">
                  <span
                    className={`text-lg font-black ${isLost ? "text-gray-400 line-through" : "text-gray-900"}`}
                  >
                    {item.current_price.toLocaleString()}원
                  </span>
                  {isLost && (
                    <span className="text-xs font-extrabold text-red-500 animate-pulse mt-1">
                      🔥 누군가 상향 입찰함!
                    </span>
                  )}
                </div>
              </div>

              <h2
                className={`text-xl font-extrabold mb-3 break-keep leading-snug ${isLost ? "text-gray-500" : "text-gray-900"}`}
              >
                {item.title}
              </h2>

              <div
                className={`mt-auto p-4 rounded-2xl border ${isLost ? "bg-gray-200/50 border-gray-200" : "bg-gray-50 border-gray-100"}`}
              >
                <p className="text-xs font-bold text-gray-400 mb-1">
                  낙찰 이유
                </p>
                <p
                  className={`text-sm leading-relaxed ${isLost ? "text-gray-500" : "text-gray-700"}`}
                >
                  {item.description}
                </p>
              </div>

              {/* Link 대신 button으로 변경하여 모달 띄우기! */}
              {isLost && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="px-6 py-3 font-black text-white bg-red-500 rounded-xl shadow-lg hover:bg-red-600 active:scale-95 transition-all"
                  >
                    되찾으러 가기 ⚔️
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 기존에 만든 모달 재사용! */}
      <AuctionDetailModal
        key={selectedItem?.id || "empty"}
        item={selectedItem}
        isOpen={!!selectedItem}
        userId={userId}
        isAuctionClosed={isAuctionClosed}
        onClose={() => setSelectedItem(null)}
        onBidSuccess={handleBidSuccess}
      />
    </>
  );
}
