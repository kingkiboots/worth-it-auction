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
  // 모달에 띄울 아이템 상태
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
          const isWinner = item.winner_id === userId;

          // 1순위: 마감된 경우 (낙찰 or 유찰)
          const isClosedWon = isAuctionClosed && isWinner;
          const isClosedLost = isAuctionClosed && !isWinner;

          // 2순위: 진행 중인데 뺏긴 경우
          const isOngoingLost = !isAuctionClosed && !isWinner;

          return (
            <div
              key={item.id}
              className={`flex flex-col p-6 rounded-3xl shadow-sm border relative overflow-hidden transition-all duration-500 ${
                isClosedWon
                  ? // 🎉 낙찰 성공: 금빛 그라데이션 + 테두리 + 빛나는 엠비언트 글로우(shadow) + 살짝 커지는 효과
                    "bg-gradient-to-br from-yellow-50 via-amber-100 to-yellow-50 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.5)] ring-2 ring-amber-400 scale-[1.02] z-10"
                  : isClosedLost
                    ? // 😢 낙찰 실패 (마감): 완전한 흑백 + 투명도 조절
                      "bg-gray-200 border-gray-300 grayscale opacity-60"
                    : isOngoingLost
                      ? // ⚔️ 진행 중 뺏김: 약간의 회색 + 덮개 버튼 노출
                        "bg-gray-100 border-gray-200 grayscale opacity-70"
                      : // 🔥 진행 중 1등 유지: 기본 화이트 카드
                        "bg-white border-gray-100 shadow-sm"
              }`}
            >
              {/* ... (카드 상단 디자인 기존과 동일) ... */}

              {/* 상단 데코 바 */}
              <div
                className={`absolute top-0 left-0 w-full h-2 ${
                  isClosedWon
                    ? "bg-gradient-to-r from-amber-300 to-yellow-500"
                    : isClosedLost || isOngoingLost
                      ? "bg-gray-400"
                      : item.rank_color?.split(" ")[0]
                }`}
              ></div>

              <div className="flex justify-between items-start mb-4 mt-2">
                {/* 상태를 알려주는 뱃지 */}
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-lg ${
                    isClosedWon
                      ? "bg-amber-500 text-white shadow-md animate-pulse"
                      : isClosedLost
                        ? "bg-gray-500 text-white"
                        : isOngoingLost
                          ? "bg-gray-200 text-gray-500"
                          : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {isClosedWon
                    ? "🎉 최종 낙찰!"
                    : isClosedLost
                      ? "경매 종료"
                      : `상황 #${item.id}`}
                </span>

                <div className="flex flex-col items-end">
                  <span
                    className={`text-lg font-black ${
                      isClosedWon
                        ? "text-amber-600 drop-shadow-sm text-xl"
                        : isOngoingLost || isClosedLost
                          ? "text-gray-400 line-through"
                          : "text-gray-900"
                    }`}
                  >
                    {item.current_price.toLocaleString()}원
                  </span>
                  {isOngoingLost && (
                    <span className="text-xs font-extrabold text-red-500 animate-pulse mt-1">
                      🔥 누군가 상향 입찰함!
                    </span>
                  )}
                  {isClosedWon && (
                    <span className="text-xs font-extrabold text-amber-600 mt-1">
                      낙찰 하셨습니다 ✨
                    </span>
                  )}
                </div>
              </div>

              <h2
                className={`text-xl font-extrabold mb-3 break-keep leading-snug ${
                  isOngoingLost || isClosedLost
                    ? "text-gray-500"
                    : "text-gray-900"
                }`}
              >
                {item.title}
              </h2>

              <div
                className={`mt-auto p-4 rounded-2xl border ${
                  isClosedWon
                    ? "bg-amber-50/50 border-amber-200"
                    : isOngoingLost || isClosedLost
                      ? "bg-gray-200/50 border-gray-200"
                      : "bg-gray-50 border-gray-100"
                }`}
              >
                <p
                  className={`text-xs font-bold mb-1 ${isClosedWon ? "text-amber-500" : "text-gray-400"}`}
                >
                  낙찰 이유
                </p>
                <p
                  className={`text-sm leading-relaxed ${
                    isOngoingLost || isClosedLost
                      ? "text-gray-500"
                      : "text-gray-700"
                  }`}
                >
                  {item.description}
                </p>
              </div>

              {/* 💡 오버레이 1: 진행 중인데 뺏긴 경우 */}
              {isOngoingLost && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="px-6 py-3 font-black text-white bg-red-500 rounded-xl shadow-lg hover:bg-red-600 active:scale-95 transition-all"
                  >
                    되찾으러 가기 ⚔️
                  </button>
                </div>
              )}

              {/* 💡 오버레이 2: 마감되었고 나는 진 경우 (버튼 없음, 안내 문구만 노출) */}
              {isClosedLost && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/60 backdrop-blur-[2px]">
                  <span className="text-4xl mb-2">😢</span>
                  <p className="text-white font-bold text-lg drop-shadow-md">
                    경매가 마감되었습니다
                  </p>
                  <p className="text-gray-200 text-sm mt-1">
                    다른 분에게 낙찰된 물품입니다
                  </p>
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
