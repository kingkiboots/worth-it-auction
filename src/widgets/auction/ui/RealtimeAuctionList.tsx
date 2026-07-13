"use client";

import { useEffect, useRef, useState } from "react";
import { createClientSideClient } from "@/shared/db/client";
import { AuctionDetailModal } from "@/features/auction/ui/AuctionDetailModal";
import { AuctionItem } from "@/entities/auction/types/acution-items.types";
import { WinningAuctionItemRow } from "@/entities/auction/ui/WinningAuctionItemRow";
import { DefaultAuctionItemRow } from "@/entities/auction/ui/DefaultAuctionItemRow";
import {
  sortAuctionItems,
  syncSelectedModalItem,
} from "@/features/auction/lib/auction-utils";
import { NetworkStatusToast } from "@/shared/ui/NetworkStatusToast";

import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";
import { useRouter } from "next/navigation";

gsap.registerPlugin(Flip, useGSAP);

interface Props {
  initialItems: AuctionItem[];
  userId: string | undefined;
}

export function RealtimeAuctionList({ initialItems, userId }: Props) {
  const router = useRouter();

  // 서버에서 받아온 초기 데이터를 기본값으로 세팅
  const [items, setItems] = useState<AuctionItem[]>(
    sortAuctionItems(initialItems),
  );
  const [selectedItem, setSelectedItem] = useState<AuctionItem | null>(null); // 모달 상태

  const [isOffline, setIsOffline] = useState(false);

  // GSAP FLIP을 위한 Ref 세팅
  const containerRef = useRef<HTMLDivElement>(null);
  const flipState = useRef<ReturnType<typeof Flip.getState> | null>(null);

  const supabase = createClientSideClient();

  // React 렌더링 직후에 FLIP 애니메이션 실행!
  useGSAP(
    () => {
      if (flipState.current && containerRef.current) {
        Flip.from(flipState.current, {
          duration: 0.6,
          ease: "power3.inOut",
          absolute: true, // 요소들이 겹치면서 스무스하게 이동하도록 만듦
          stagger: 0.05, // 순차적으로 촤라락 움직이는 딜레이 효과
        });
        flipState.current = null; // 실행 후 초기화
      }
    },
    { dependencies: [items], scope: containerRef },
  );

  useEffect(() => {
    const channel = supabase
      .channel("realtime_auction_items")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "auction_items" },
        (payload) => {
          const updatedData = payload.new as AuctionItem;

          // 화면 갱신 전 현재 엘리먼트 위치 사진 찍기
          if (containerRef.current) {
            flipState.current = Flip.getState(".auction-item-row");
          }

          // 실시간 반영 후 최신 가격순 재정렬 유틸리티 적용
          setItems((currentItems) => {
            const nextItems = currentItems.map((item) =>
              item.id === updatedData.id ? { ...item, ...updatedData } : item,
            );
            return sortAuctionItems(nextItems);
          });

          // 모달창을 열어둔 상태에서도 가격이 멈추지 않고 실시간으로 동기화되도록
          setSelectedItem((currentSelected) =>
            syncSelectedModalItem(currentSelected, updatedData),
          );
        },
      )
      // subscribe()에 콜백을 넣어서 연결 상태를 모니터링
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // 재연결(Re-connect) 성공 시!
          setIsOffline((prevIsOffline) => {
            if (prevIsOffline) {
              // 오프라인이었다가 다시 연결된 경우, 놓친 데이터를 가져오기 위해 서버 컴포넌트 강제 리프레시
              router.refresh();
              console.log("🔄 네트워크 재연결됨: 누락된 최신 DB 동기화 완료");
            }
            return false;
          });
        } else if (
          status === "TIMED_OUT" ||
          status === "CLOSED" ||
          status === "CHANNEL_ERROR"
        ) {
          // 커넥션이 끊어지면 토스트를 띄웁니다.
          setIsOffline(true);
        }
      });

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
      <NetworkStatusToast isOffline={isOffline} />
      <div ref={containerRef} className="flex flex-col mt-2 pb-20">
        {items.map((item, index) => {
          const isMyWinningItem = userId && item.winner_id === userId;
          const handleRowClick = () => setSelectedItem(item);

          return (
            // FLIP이 추적할 수 있도록 공통 클래스(.auction-item-row)가 부여된 div로 감싸기
            <div
              key={item.id}
              className="auction-item-row w-full z-10 bg-white"
            >
              {isMyWinningItem ? (
                <WinningAuctionItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  onClick={handleRowClick}
                />
              ) : (
                <DefaultAuctionItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  onClick={handleRowClick}
                />
              )}
            </div>
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
