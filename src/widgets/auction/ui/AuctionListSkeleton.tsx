export function AuctionListSkeleton() {
  return (
    // animate-pulse 클래스로 부드럽게 깜빡이는 효과를 줍니다.
    <div className="flex flex-col mt-2 pb-20 animate-pulse">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 ${i % 2 === 1 ? "bg-gray-50/50" : "bg-white"}`}
        >
          <div className="flex items-center flex-1 gap-4">
            {/* 순위 박스 스켈레톤 */}
            <div className="w-8 h-8 bg-gray-200 rounded-lg shrink-0"></div>
            {/* 제목 스켈레톤 */}
            <div className="h-5 bg-gray-200 rounded-md w-3/4 max-w-[250px]"></div>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-6 w-28 justify-end">
            {/* 동그라미 아이콘 스켈레톤 */}
            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
            {/* 가격 텍스트 스켈레톤 */}
            <div className="h-5 bg-gray-200 rounded-md w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
