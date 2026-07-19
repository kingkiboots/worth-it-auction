"use client";

import { AuctionItem } from "@/entities/auction/types/acution-items.types";
import { ROUTES } from "@/shared/config/routes";
import { createClientSideClient } from "@/shared/db/client";
import { Button } from "@/shared/ui/Button";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface Props {
  item: AuctionItem;
  userId: string | undefined;
  onClose: () => void;
  onBidSuccess: (itemId: number, newPrice: number, winnerId: string) => void;
}

export function AuctionBidForm({ item, userId, onClose, onBidSuccess }: Props) {
  const router = useRouter();

  const minBidAmount = item.current_price + 10000;
  const [bidAmount, setBidAmount] = useState<number>(minBidAmount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // 💡 흔들림 애니메이션을 제어할 상태 추가
  const [isShaking, setIsShaking] = useState(false);
  // 연속 클릭 시 타이머 충돌을 방지하기 위한 Ref
  const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const supabase = createClientSideClient();

  /**
   * 에러 메시지 세팅과 동시에 흔들림 애니메이션을 트리거하는 헬퍼 함수
   * @param msg
   */
  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setIsShaking(true);

    // 이전 타이머가 있다면 클리어 (연속 클릭 방지)
    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);

    // 0.4초 뒤에 흔들림 상태 해제
    shakeTimeoutRef.current = setTimeout(() => {
      setIsShaking(false);
    }, 400);
  };

  const handleQuickAdd = (amount: number) => {
    setBidAmount((prev) => prev + amount);
    setErrorMsg(""); // 값 변경 시 에러 초기화 (붉은 테두리 해제)
  };

  const handleSubmit = async () => {
    //NOTE - 로그인 검증
    if (!userId) {
      const confirmLogin = window.confirm(
        "경매에 참여하려면 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?",
      );

      if (confirmLogin) {
        onClose(); // 열려있는 입찰 모달 닫기
        router.push(ROUTES.LOGIN); // 로그인 페이지로 튕겨주기
      }
      return; // 더 이상 아래의 입찰 로직(RPC 통신)이 실행되지 않도록 강제 종료
    }

    //NOTE - 최소 입찰금액 검증
    if (bidAmount < minBidAmount) {
      setErrorMsg(
        `최소 ${minBidAmount.toLocaleString()}원 이상 입찰해야 합니다.`,
      );
      return;
    }
    if (bidAmount % 10000 !== 0) {
      setErrorMsg("입찰 금액은 1만 원 단위로 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.rpc("place_bid", {
        p_item_id: item.id,
        p_bid_amount: bidAmount,
      });

      if (error) {
        triggerError(error.message);
        return;
      }

      const result = data as { success: boolean; message: string };

      if (!result.success) {
        triggerError(result.message);
      } else {
        // 🚀 웹소켓 브로드캐스트를 기다리지 않고, RPC 성공 즉시 로컬 상태를 먼저 갱신합니다.
        onBidSuccess(item.id, bidAmount, userId);
        onClose();
      }
    } catch (_err) {
      triggerError("입찰 처리 중 서버 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 💡 흔들림(Shake) 효과를 위한 인라인 CSS 정의 */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>

      {/* 금액 입력 영역  */}
      <div className="mb-2">
        <label className="block text-xs font-bold text-gray-500 mb-2">
          입찰할 금액
        </label>
        <div className="relative">
          <input
            type="number"
            value={bidAmount ?? ""}
            onChange={(e) => {
              setBidAmount(Number(e.target.value));
              setErrorMsg(""); // 타이핑 시 즉각적으로 에러 상태(붉은 테두리) 해제
            }}
            disabled={isSubmitting}
            className={`w-full p-4 text-2xl font-black text-gray-900 bg-white border-2 rounded-2xl focus:ring-0 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400 ${
              errorMsg
                ? "border-red-500 focus:border-red-500 text-red-500" // 💡 에러 시: 테두리와 포커스 색상을 에러 텍스트와 동일한 붉은색(red-500)으로
                : "border-gray-200 focus:border-black" // 평상시: 회색 테두리, 검은색 포커스
            } ${isShaking ? "animate-shake" : ""}`} // 💡 흔들림 상태일 때 클래스 부착
          />
          <span
            className={`absolute right-5 top-1/2 -translate-y-1/2 font-bold transition-colors ${
              errorMsg ? "text-red-500" : "text-gray-400"
            }`}
          >
            원
          </span>
        </div>

        {/* 에러 메시지 출력 영역 */}
        <div className="h-5 mt-1">
          {errorMsg && (
            <p className="text-sm font-bold text-red-500 pl-1">{errorMsg}</p>
          )}
        </div>
      </div>

      {/* 모바일 친화적인 빠른 금액 추가 버튼 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleQuickAdd(10000)}
          disabled={isSubmitting}
          className="flex-1 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
        >
          +1만
        </button>
        <button
          onClick={() => handleQuickAdd(50000)}
          disabled={isSubmitting}
          className="flex-1 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
        >
          +5만
        </button>
        <button
          onClick={() => handleQuickAdd(100000)}
          disabled={isSubmitting}
          className="flex-1 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
        >
          +10만
        </button>
      </div>

      {/* 최종 입찰 버튼 */}
      <Button
        onClick={handleSubmit}
        isSubmitting={isSubmitting}
        loadingText="입찰 진행 중..."
        className="relative w-full py-4 text-lg font-bold text-white bg-[#171717] rounded-2xl hover:bg-gray-800 active:scale-95 transition-all disabled:bg-gray-400 overflow-hidden"
      >
        {`${bidAmount.toLocaleString()}원 입찰하기`}
      </Button>
    </>
  );
}
