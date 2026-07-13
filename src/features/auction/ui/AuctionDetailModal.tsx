"use client";

import { useState, useEffect } from "react";
import { createClientSideClient } from "@/shared/db/client";
import { AuctionItem } from "../types/acution-items.types";

interface Props {
  item: AuctionItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuctionDetailModal({ item, isOpen, onClose }: Props) {
  const minBidAmount = item ? item.current_price + 10000 : 0;
  const [bidAmount, setBidAmount] = useState<number>(minBidAmount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const supabase = createClientSideClient();

  // ESC 키를 누르면 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!isOpen || !item) return null;

  // 빠른 금액 추가 핸들러
  const handleQuickAdd = (amount: number) => {
    setBidAmount((prev) => prev + amount);
    setErrorMsg(""); // 금액이 변경되면 에러 메시지 초기화
  };

  // 입찰 제출 핸들러 (추후 RPC 연동)
  const handleSubmit = async () => {
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
      // 💡 Supabase RPC 함수 호출 실행!
      const { data, error } = await supabase.rpc("place_bid", {
        p_item_id: item.id,
        p_bid_amount: bidAmount,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      // DB function에서 리턴한 객체 파싱
      const result = data as { success: boolean; message: string };

      if (!result.success) {
        setErrorMsg(result.message);
      } else {
        // 성공 시 팝업 닫기
        onClose();
      }
    } catch (_err) {
      setErrorMsg("입찰 처리 중 서버 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // 💡 배경 클릭 시 onClose 발동 (Backdrop)
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:px-4"
      onClick={onClose}
    >
      {/* 💡 e.stopPropagation()으로 모달 내부 클릭 시 닫히는 것 방지 */}
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex justify-between items-start mb-5">
            <span
              className={`px-3 py-1 font-bold rounded-lg text-sm ${item.rank_color?.split(" ")[0]} text-white`}
            >
              상황 #{item.id}
            </span>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-800 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 본문 (상황 및 이유) */}
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-3 leading-tight break-keep">
            {item.title}
          </h2>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
            <p className="text-sm font-semibold text-gray-500 mb-1">
              낙찰 이유
            </p>
            <p className="text-gray-700 leading-relaxed text-sm">
              {item.description || "이 상황에 대한 상세 설명이 없습니다."}
            </p>
          </div>

          {/* 금액 입력 영역 */}
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
                <p className="text-sm font-bold text-red-500 pl-1">
                  {errorMsg}
                </p>
              )}
            </div>
          </div>

          {/* 💡 모바일 친화적인 빠른 금액 추가 버튼 */}
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
            className="relative w-full py-4 text-lg font-bold text-white bg-[#171717] rounded-2xl hover:bg-gray-800 active:scale-95 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed overflow-hidden"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                입찰 진행 중...
              </span>
            ) : (
              `${bidAmount.toLocaleString()}원 입찰하기`
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4 font-medium">
            현재가: {item.current_price.toLocaleString()}원
          </p>
        </div>
      </div>
    </div>
  );
}
