"use client";

import { useEffect, useState } from "react";
import { createClientSideClient } from "@/shared/db/client";
import { AuctionDetailModal } from "@/features/auction/ui/AuctionDetailModal";
import { AuctionItem } from "@/features/auction/types/acution-items.types";

interface Props {
  initialItems: AuctionItem[];
}

export function RealtimeAuctionList({ initialItems }: Props) {
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
        {items.map((item, index) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className={`flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-white transition-colors border-b border-gray-100 ${index % 2 === 1 ? "bg-gray-50/50" : ""}`}
          >
            <div className="flex items-center flex-1 gap-4">
              <span
                className={`flex items-center justify-center w-8 h-8 font-bold rounded-lg shrink-0 ${item.rank_color}`}
              >
                {index + 1}
              </span>
              <h2 className="text-sm md:text-base font-bold text-gray-800 break-keep line-clamp-2 pr-4">
                {item.title}
              </h2>
              <svg
                className="w-4 h-4 text-gray-300 shrink-0 ml-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-6 w-28 justify-end">
              <div
                className={`flex items-center justify-center w-5 h-5 rounded-full border-2 ${(item.current_price || 0) > 0 ? "border-orange-400" : "border-gray-200"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${(item.current_price || 0) > 0 ? "bg-orange-400" : "bg-transparent"}`}
                ></div>
              </div>

              <span
                className={`text-sm md:text-base font-extrabold transition-colors duration-300 ${(item.current_price || 0) > 0 ? "text-gray-900" : "text-gray-400"}`}
              >
                {item.current_price === 0
                  ? "0만 원"
                  : `${(item.current_price || 0) / 10000}만 원`}
              </span>
            </div>
          </div>
        ))}
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
