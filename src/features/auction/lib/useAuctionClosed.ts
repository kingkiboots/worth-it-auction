import { useEffect, useId, useState } from "react";
import { Database } from "@/shared/db/database.types";
import { createClientSideClient } from "@/shared/db/client";

type GlobalSetting = Database["public"]["Tables"]["global_settings"]["Row"];

// setTimeout은 약 24.8일(2^31-1ms)보다 길게 걸면 즉시 실행되므로, 그보다 먼 마감은 나눠서 기다립니다.
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

/**
 * 경매 마감 여부 실시간 추적 훅
 * * Q. 서버에서 계산한 마감 여부만으로는 왜 부족할까요?
 * A. 서버 값은 페이지를 그린 순간의 스냅샷이라, 보고 있는 동안 마감 시각이 지나거나 관리자가 즉시 종료해도
 * 새로고침 전까지는 입찰 폼이 그대로 열려 있습니다.
 * 이 훅은 (1) 마감 시각에 맞춰 타이머로 상태를 바꾸고, (2) 관리자가 마감 시각을 바꾸면(즉시 종료/재시작/리셋)
 * global_settings의 Realtime 변경을 받아 바로 다시 계산합니다.
 * (페이지를 떠나 있는 동안 놓친 변경은 목록 컴포넌트의 router.refresh()로 새 initialEndTime이 내려와 맞춰집니다.)
 * @param initialEndTime 서버에서 읽은 마감 시각 (ISO 문자열)
 * @param initialIsClosed 서버에서 계산한 마감 여부 (서버와 첫 화면이 어긋나지 않도록 첫 렌더에 그대로 사용)
 * @returns 현재 마감 여부
 */
export function useAuctionClosed(
  initialEndTime: string | null,
  initialIsClosed: boolean,
): boolean {
  const supabase = createClientSideClient();
  // 경매장, 내 입찰 목록이 각각 구독하므로 채널 이름이 겹치지 않게 합니다.
  const channelId = useId();
  const [endTime, setEndTime] = useState(initialEndTime);
  const [isClosed, setIsClosed] = useState(initialIsClosed);

  // router.refresh()로 서버 데이터가 새로 내려오면 마감 시각도 다시 맞춥니다. (Activity로 상태가 보존되므로 직접 맞춤)
  const [prevInitialEndTime, setPrevInitialEndTime] = useState(initialEndTime);
  if (initialEndTime !== prevInitialEndTime) {
    setPrevInitialEndTime(initialEndTime);
    setEndTime(initialEndTime);
  }

  // 관리자가 마감 시각을 바꾸면(즉시 종료/재시작/대기 상태로 리셋) 바로 반영합니다.
  // 💡 경매 물품 구독과 채널을 분리해 둬야, 이 구독에 문제가 생겨도 입찰가 실시간 반영은 영향을 받지 않습니다.
  useEffect(() => {
    const channel = supabase
      .channel(`realtime_auction_end_time_${channelId}`)
      .on<GlobalSetting>(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "global_settings",
          filter: "id=eq.auction_end_time",
        },
        (payload) => {
          if ("value" in payload.new) setEndTime(payload.new.value);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, channelId]);

  // 마감 시각에 맞춰 마감 여부를 다시 계산합니다.
  // 마운트·화면 재표시·마감 시각 변경 직후에 한 번 맞추고, 아직 마감 전이면 마감 직후에 다시 확인합니다.
  useEffect(() => {
    const endAt = endTime ? Date.parse(endTime) : null;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const now = Date.now();
      setIsClosed(endAt !== null && now > endAt);
      if (endAt !== null && now <= endAt) {
        timer = setTimeout(tick, Math.min(endAt - now + 1, MAX_TIMEOUT_MS));
      }
    };
    timer = setTimeout(tick, 0);

    return () => clearTimeout(timer);
  }, [endTime]);

  return isClosed;
}
