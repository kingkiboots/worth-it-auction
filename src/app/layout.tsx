import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { AdminFloatingButton } from "@/features/admin/ui/AdminFloatingButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "상황 경매장",
  description: "당신의 가치를 증명할 치열한 눈치 싸움",
};

// 🔧 이 Next.js 버전은 viewport를 metadata에 넣는 방식을 지원하지 않아
// 별도의 viewport export로 분리해야 실제로 meta 태그에 반영됩니다.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      {/* 배경을 밝은 회색으로 고정하고, 텍스트는 짙은 색으로 */}
      <body className={`${inter.className} text-gray-900 antialiased`}>
        {/* max-w-md (모바일 고정) 삭제! 화면 전체(w-full)를 쓰도록 변경 */}
        <main className="relative flex flex-col w-full min-h-screen">
          {children}
        </main>
        <Suspense fallback={null}>
          <AdminFloatingButton />
        </Suspense>
      </body>
    </html>
  );
}
