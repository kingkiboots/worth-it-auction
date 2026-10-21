"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/shared/ui/Avatar";
import { WinnerProfile } from "../types/acution-items.types";

interface Props {
  hasWinner: boolean;
  profile: WinnerProfile | null; // 낙찰자 프로필 (불러오는 중이면 null)
  isAuctionClosed: boolean;
}

// 💡 낙찰자 프사 + 툴팁
// - 낙찰자 없음: 기본 이미지 + "아직 낙찰자가 없어요ㅠㅠ" 툴팁
// - 낙찰자 있음: 스포 방지를 위해 프사는 경매 종료 후에도 항상 블러 처리
//   · 경매 진행 중: 이름은 DOM에도 넣지 않음 (툴팁 없음)
//   · 경매 종료 후: 닉네임 툴팁 표시
// 마우스는 올리면 툴팁을 띄우고, 클릭은 행 클릭(상세 모달)으로 그대로 넘깁니다.
// 터치(태블릿 등)는 hover가 없으므로 탭하면 툴팁을 열고, 다른 곳을 탭하면 닫습니다.
export function WinnerAvatar({ hasWinner, profile, isAuctionClosed }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // click 이벤트만으로는 마우스인지 터치인지 알 수 없어서, 직전 pointerdown의 입력 종류를 기억합니다.
  const pointerTypeRef = useRef("mouse");

  // 탭으로 연 툴팁은 바깥을 탭하면 닫습니다.
  useEffect(() => {
    if (!isTapped) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsTapped(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isTapped]);

  const isSpoilerHidden = hasWinner;
  const nickname = profile?.nickname ?? "예배자";

  const tooltip = !hasWinner
    ? "아직 낙찰자가 없어요ㅠㅠ"
    : isAuctionClosed && profile
      ? nickname
      : null;

  const avatar = (
    <Avatar
      src={hasWinner ? (profile?.profile_image ?? null) : null}
      alt={
        !hasWinner
          ? "아직 낙찰자가 없어요"
          : isAuctionClosed
            ? nickname
            : "낙찰자 프로필"
      }
      isBlurred={isSpoilerHidden}
      className="w-8 h-8 border border-gray-200"
    />
  );

  // 보여줄 툴팁이 없으면(경매 진행 중인 낙찰자) 프사도 행의 일부처럼 클릭이 그대로 행으로 전달됩니다.
  if (!tooltip) return avatar;

  return (
    <div
      ref={containerRef}
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setIsHovered(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setIsHovered(false);
      }}
      onPointerDown={(e) => {
        pointerTypeRef.current = e.pointerType;
      }}
      onClick={(e) => {
        if (pointerTypeRef.current === "mouse") return;
        e.stopPropagation(); // 터치는 상세 모달을 여는 대신 툴팁만 토글
        setIsTapped((tapped) => !tapped);
      }}
    >
      {avatar}
      {/* 이웃 행에 가려지지 않도록 위쪽으로 띄우고, 화면 오른쪽 끝을 넘지 않도록 오른쪽 정렬 */}
      <span
        aria-hidden
        className={`pointer-events-none absolute bottom-full right-0 mb-2 px-2.5 py-1 text-xs font-bold text-white whitespace-nowrap bg-gray-900 rounded-lg shadow-lg transition-opacity duration-150 ${
          isHovered || isTapped ? "opacity-100" : "opacity-0"
        }`}
      >
        {tooltip}
        {/* 말풍선 꼬리: 프사 가운데를 가리키도록 위치 */}
        <span className="absolute top-full right-3 -mt-1 w-2 h-2 rotate-45 bg-gray-900" />
      </span>
    </div>
  );
}
