import { useEffect, useRef, useState } from "react";
import {
  AuctionItem,
  WinnerProfiles,
} from "@/entities/auction/types/acution-items.types";
import { createClientSideClient } from "@/shared/db/client";

/**
 * 낙찰자 프로필(닉네임·프사) 캐시 훅
 * * Q. 프로필을 왜 아이템과 따로 관리할까요?
 * A. Supabase Realtime은 auction_items의 '바뀐 한 줄(winner_id 포함)'만 보내 주고 users 정보는 주지 않습니다.
 * 아이템에 프로필을 같이 넣어 두면 낙찰자가 바뀌어도 이전 사람의 프로필이 남게 되므로,
 * 프로필은 winner_id를 키로 따로 캐시해 두고 처음 보는 낙찰자가 생겼을 때 그 유저만 추가로 조회합니다.
 * @param items 현재 경매 물품 목록 (Realtime/낙관적 업데이트가 반영된 상태)
 * @param initialWinnerProfiles 서버에서 조인해 온 낙찰자 프로필
 * @returns winner_id → 낙찰자 프로필
 */
export function useWinnerProfiles(
  items: AuctionItem[],
  initialWinnerProfiles: WinnerProfiles,
): WinnerProfiles {
  const supabase = createClientSideClient();
  const [winnerProfiles, setWinnerProfiles] = useState(initialWinnerProfiles);
  // 응답이 오기 전에 Realtime 이벤트가 또 와도 같은 유저를 중복 조회하지 않도록 요청한 ID를 기억합니다.
  const requestedIdsRef = useRef(new Set<string>());

  // router.refresh()로 서버 데이터가 새로 내려오면 최신 프로필로 덮어씁니다. (Activity로 상태가 보존되므로 직접 맞춤)
  const [prevInitialWinnerProfiles, setPrevInitialWinnerProfiles] = useState(
    initialWinnerProfiles,
  );
  if (initialWinnerProfiles !== prevInitialWinnerProfiles) {
    setPrevInitialWinnerProfiles(initialWinnerProfiles);
    setWinnerProfiles((prev) => ({ ...prev, ...initialWinnerProfiles }));
  }

  useEffect(() => {
    const missingIds = Array.from(
      new Set(items.map((item) => item.winner_id)),
    ).filter(
      (id): id is string =>
        !!id && !(id in winnerProfiles) && !requestedIdsRef.current.has(id),
    );
    if (missingIds.length === 0) return;

    missingIds.forEach((id) => requestedIdsRef.current.add(id));
    supabase
      .from("users")
      .select("id,nickname,profile_image")
      .in("id", missingIds)
      .then(({ data }) => {
        if (!data) return;
        setWinnerProfiles((prev) => ({
          ...prev,
          ...Object.fromEntries(data.map(({ id, ...profile }) => [id, profile])),
        }));
      });
  }, [items, winnerProfiles, supabase]);

  return winnerProfiles;
}
