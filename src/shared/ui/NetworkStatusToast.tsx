"use client";

interface Props {
  isOffline: boolean;
}

export function NetworkStatusToast({ isOffline }: Props) {
  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${
        isOffline
          ? "translate-y-0 opacity-100"
          : "-translate-y-10 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3 px-5 py-3 bg-gray-900/90 backdrop-blur-md text-white text-sm font-bold rounded-2xl shadow-xl border border-gray-700">
        <span className="flex w-3 h-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full w-3 h-3 bg-red-500"></span>
        </span>
        연결이 불안정합니다. 실시간 데이터를 재동기화 중입니다...
      </div>
    </div>
  );
}
