"use client";

import { AuctionItem } from "../types/acution-items.types";

interface Props {
  item: AuctionItem;
  index: number;
  onClick: () => void;
}

export function DefaultAuctionItemRow({ item, index, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors ${
        index % 2 === 1 ? "bg-gray-50/50" : "bg-white"
      }`}
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
          className={`flex items-center justify-center w-5 h-5 rounded-full border-2 ${item.current_price > 0 ? "border-orange-400" : "border-gray-200"}`}
        >
          <div
            className={`w-2 h-2 rounded-full ${item.current_price > 0 ? "bg-orange-400" : "bg-transparent"}`}
          ></div>
        </div>
        <span
          className={`text-sm md:text-base font-extrabold ${item.current_price > 0 ? "text-gray-900" : "text-gray-400"}`}
        >
          {item.current_price === 0
            ? "0만 원"
            : `${item.current_price / 10000}만 원`}
        </span>
      </div>
    </div>
  );
}
