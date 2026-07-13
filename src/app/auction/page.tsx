import { CurrentDate } from "@/shared/ui/CurrentDate";
import { AuctionListContainer } from "@/widgets/auction/ui/AuctionListContainer";
import { AuctionListSkeleton } from "@/widgets/auction/ui/AuctionListSkeleton";
import { Header } from "@/widgets/header/ui/Header";
import { Suspense } from "react";

export default function AuctionRankingPage() {
  return (
    <>
      <Header />
      {/* 전체 배경을 밝은 톤으로 깔고 컨텐츠를 가운데 정렬 */}
      <div className="mx-auto min-h-screen">
        {/* 상단 헤더 영역 (이미지의 텍스트와 동전 일러스트) */}
        <div className="relative px-6 pt-8 pb-4">
          <div className="inline-block px-3 py-1 mb-4 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-full shadow-sm">
            <CurrentDate />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            경매 누적 랭킹 순위
          </h1>
          <p className="mt-2 text-sm md:text-base font-medium text-gray-500">
            물건 이름을 클릭하면,{" "}
            <span className="text-[#F25C54]">낙찰 이유</span>를 살펴볼 수
            있어요!
          </p>

          {/* 우측 동전 스택 일러스트 (Tailwind CSS로 간략히 구현) */}
          <div className="absolute right-6 top-6 flex flex-col items-center">
            <div className="w-16 h-4 bg-orange-300 rounded-full border-b-2 border-orange-400 mb-[-8px] z-10"></div>
            <div className="w-16 h-4 bg-orange-400 rounded-full border-b-2 border-orange-500 mb-[-8px] z-20"></div>
            <div className="w-16 h-4 bg-orange-500 rounded-full border-b-2 border-orange-600 mb-1 z-30"></div>
            <div className="flex items-center justify-center w-12 h-12 bg-orange-500 rounded-full shadow-lg border-2 border-orange-300 z-31 text-white font-bold text-xl">
              ₩
            </div>
          </div>
        </div>

        {/* 탭 메뉴 영역 */}
        {/* <div className="px-6 flex gap-4 border-b border-gray-200 pb-2 overflow-x-auto no-scrollbar">
          <button className="px-4 py-1 text-sm font-bold text-white bg-[#5D4037] rounded-md shrink-0">
            전체
          </button>
          {["10대", "20대", "30대", "40대", "50대~"].map((tab) => (
            <button
              key={tab}
              className="px-2 py-1 text-sm font-bold text-gray-300 hover:text-gray-500 shrink-0 transition-colors"
            >
              {tab}
            </button>
          ))}
        </div> */}

        {/* 랭킹 리스트 영역 */}

        <Suspense fallback={<AuctionListSkeleton />}>
          <AuctionListContainer />
        </Suspense>
      </div>
    </>
  );
}
