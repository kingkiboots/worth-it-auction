// src/features/auction/ui/AuctionBidForm.tsx
"use client";

import { AuctionItem } from "@/entities/auction/types/acution-items.types";
import { ROUTES } from "@/shared/config/routes";
import { createClientSideClient } from "@/shared/db/client";
import { ButtonSpinner } from "@/shared/ui/ButtonSpinner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  item: AuctionItem;
  userId: string | undefined;
  onClose: () => void;
  onBidSuccess: (itemId: number, newPrice: number, winnerId: string) => void;
}

export function AuctionBidForm({
  item,
  userId,
  onClose,
  onBidSuccess,
}: Props) {
  const router = useRouter();

  const minBidAmount = item.current_price + 10000;
  const [bidAmount, setBidAmount] = useState<number>(minBidAmount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const supabase = createClientSideClient();

  const handleQuickAdd = (amount: number) => {
    setBidAmount((prev) => prev + amount);
    setErrorMsg("");
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
        setErrorMsg(error.message);
        return;
      }

      const result = data as { success: boolean; message: string };

      if (!result.success) {
        setErrorMsg(result.message);
      } else {
        // 🚀 웹소켓 브로드캐스트를 기다리지 않고, RPC 성공 즉시 로컬 상태를 먼저 갱신합니다.
        onBidSuccess(item.id, bidAmount, userId);
        onClose();
      }
    } catch (_err) {
      setErrorMsg("입찰 처리 중 서버 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 금액 입력 영역  */}
      <div className="mb-2">
        <label className="block text-xs font-bold text-gray-500 mb-2">
          입찰할 금액
        </label>
        <div className="relative">
          <input
            type="number"
            value={bidAmount || ""}
            onChange={(e) => {
              setBidAmount(Number(e.target.value));
              setErrorMsg("");
            }}
            disabled={isSubmitting}
            className="w-full p-4 text-2xl font-black text-gray-900 bg-white border-2 border-gray-200 rounded-2xl focus:border-black focus:ring-0 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
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
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="relative w-full py-4 text-lg font-bold text-white bg-[#171717] rounded-2xl hover:bg-gray-800 active:scale-95 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed overflow-hidden cursor-pointer"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <ButtonSpinner className="w-5 h-5 text-white" />
            입찰 진행 중...
          </span>
        ) : (
          `${bidAmount.toLocaleString()}원 입찰하기`
        )}
      </button>
    </>
  );
}
