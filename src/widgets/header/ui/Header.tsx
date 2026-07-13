import { Suspense } from "react";
import Link from "next/link";
import { ROUTES } from "@/shared/config/routes";
import { UserArea } from "./UserArea";
import { UserMenuSkeleton } from "./UserMenuSkeleton";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
        {/* 로고는 고정 (바로 보여줌) */}
        <div className="flex items-center flex-1">
          <Link
            href={ROUTES.AUCTION}
            className="text-md sm:text-lg font-bold text-gray-900 tracking-tight"
          >
            삶으로 쓰는 예배{" "}
            <span className="font-light text-gray-500">전(展)</span>
          </Link>
        </div>

        {/* 유저 영역만 비동기로 로딩! */}
        <div className="flex justify-end flex-1">
          <Suspense fallback={<UserMenuSkeleton />}>
            <UserArea />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
