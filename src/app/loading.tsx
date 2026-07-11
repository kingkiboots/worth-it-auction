// src/app/loading.tsx

export default function GlobalLoading() {
  return (
    // 레이아웃의 남은 공간을 꽉 채우고 가운데 정렬 (flex-1)
    <div className="flex flex-col items-center justify-center flex-1 w-full h-full min-h-[60vh] bg-transparent">
      <div className="flex flex-col items-center space-y-4">
        {/* 모바일 뷰에 어울리는 모던한 블랙 스피너 */}
        <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-gray-500 animate-pulse">
          불러오는 중...
        </p>
      </div>
    </div>
  );
}
