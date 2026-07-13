export function MyValuesListSkeleton() {
  return (
    // 메인 페이지와 동일하게 2열 grid 크기를 유지하며 깜빡임 효과(animate-pulse) 적용
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col bg-white p-6 rounded-3xl border border-gray-100 h-[220px] relative overflow-hidden"
        >
          {/* 상단 뼈대 데코 바 */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gray-200"></div>

          {/* 상단 태그 및 가격 영역 뼈대 */}
          <div className="flex justify-between items-start mb-4 mt-2">
            <div className="h-6 w-16 bg-gray-200 rounded-lg"></div>
            <div className="h-6 w-24 bg-gray-200 rounded-md"></div>
          </div>

          {/* 제목 영역 뼈대 */}
          <div className="space-y-2 mb-4">
            <div className="h-6 bg-gray-200 rounded-md w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
          </div>

          {/* 하단 낙찰 이유 박스 뼈대 */}
          <div className="mt-auto bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50 h-[72px]">
            <div className="h-3 bg-gray-200 rounded w-12 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
