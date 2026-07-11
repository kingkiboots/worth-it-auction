import Link from "next/link";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
}

export function Header({
  title = "상황 경매장",
  showBackButton = false,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      {/* 💡 내용물만 max-w-5xl로 제한해서 대형 모니터에서도 예쁘게 보이게 함 */}
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
        <div className="flex items-center flex-1">
          {showBackButton && (
            <button className="p-2 -ml-2 text-gray-600 hover:text-black">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
        </div>

        <h1 className="text-lg font-bold text-center flex-[2] truncate">
          {title}
        </h1>

        <div className="flex justify-end flex-1">
          {/* <span className="text-sm font-semibold text-blue-600">300만 C</span> */}
        </div>
      </div>
    </header>
  );
}
