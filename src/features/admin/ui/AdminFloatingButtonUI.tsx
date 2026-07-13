"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/shared/config/routes";

export function AdminFloatingButtonUI() {
  const pathname = usePathname();

  // 💡 현재 페이지가 /admin 인지 확인
  const isAdminPage = pathname === "/admin";

  return (
    <Link
      href={isAdminPage ? ROUTES.AUCTION : "/admin"}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-black text-white font-black text-base rounded-full shadow-2xl border border-gray-800 hover:bg-gray-900 hover:scale-110 active:scale-95 transition-all duration-300"
      title={isAdminPage ? "경매장으로 돌아가기" : "통제실 바로가기"}
    >
      {isAdminPage ? "🏠" : "(A)"}
    </Link>
  );
}
