"use client";

import { Database } from "@/shared/db/database.types";
import { useState } from "react";

type AuctionItem = Pick<
  Database["public"]["Tables"]["auction_items"]["Row"],
  "id" | "title" | "current_price" | "winner_id" | "rank_color" | "description"
>;

interface Props {
  item: AuctionItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuctionDetailModal({ item, isOpen, onClose }: Props) {
  const [bidAmount, setBidAmount] = useState<number>(
    item ? item.current_price + 10000 : 0,
  );

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      {/* 모달 박스 */}
      <div className="w-full max-w-sm p-6 bg-white rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* 헤더 */}
        <div className="flex justify-between items-start mb-4">
          <span
            className={`px-3 py-1 font-bold rounded-lg ${item.rank_color?.split(" ")[0]} text-white`}
          >
            상황 #{item.id}
          </span>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            ✕
          </button>
        </div>

        {/* 내용 */}
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">
          {item.title}
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
          {item.description || "이 상황에 대한 낙찰 이유가 없습니다."}
        </p>

        {/* 가격 정보 */}
        <div className="mb-6">
          <p className="text-xs text-gray-400 font-medium">현재 최고가</p>
          <p className="text-3xl font-black text-gray-900">
            {item.current_price === 0
              ? "0만 원"
              : `${item.current_price / 10000}만 원`}
          </p>
        </div>

        <div className="mb-6 space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            입찰할 금액 (단위: 원)
          </label>
          <div className="relative">
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              className="w-full p-4 text-xl font-bold bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-black focus:outline-none transition-colors"
              min={item.current_price + 10000}
              step={10000}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
              원
            </span>
          </div>
          <p className="text-xs text-gray-400">
            최소 입찰 가능 금액: {(item.current_price + 10000).toLocaleString()}
            원
          </p>
        </div>

        {/* 액션 버튼 */}
        <button className="w-full py-4 text-lg font-bold text-white bg-black rounded-2xl hover:bg-gray-800 active:scale-95 transition-all">
          입찰하기
        </button>
      </div>
    </div>
  );
}
