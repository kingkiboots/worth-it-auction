import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "상황 경매장",
  description: "당신의 가치를 증명할 치열한 눈치 싸움",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
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
      </body>
    </html>
  );
}
