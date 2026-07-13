"use client";

import { AuctionItem } from "@/entities/auction/types/acution-items.types";
import { useEffect } from "react";
import { AuctionBidForm } from "./AuctionBidForm";
import { AuctionClosedMessage } from "./AuctionClosedMessage";

interface Props {
  item: AuctionItem | null;
  userId: string | undefined;
  isOpen: boolean;
  isAuctionClosed: boolean;
  onClose: () => void;
}

export function AuctionDetailModal({
  item,
  isOpen,
  isAuctionClosed,
  userId,
  onClose,
}: Props) {
  // ESC 키를 누르면 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!isOpen || !item) return null;

  const isWinner = (userId && item.winner_id === userId) as boolean;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* 공통 헤더 */}
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

          {/* 공통 본문 */}
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

          {/* 💡 핵심 분기 처리: 알맹이만 스위칭 */}
          {isAuctionClosed ? (
            <AuctionClosedMessage isWinner={isWinner} onClose={onClose} />
          ) : (
            <AuctionBidForm
              key={item.id}
              item={item}
              userId={userId}
              onClose={onClose}
            />
          )}

          {/* 공통 푸터 (현재가) */}
          <p className="text-center text-xs text-gray-400 mt-4 font-medium">
            현재가: {item.current_price.toLocaleString()}원
          </p>
        </div>
      </div>
    </div>
  );
}
