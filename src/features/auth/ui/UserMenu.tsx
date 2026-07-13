"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientSideClient } from "@/shared/db/client";

interface UserMenuProps {
  userId: string;
  initialNickname: string;
  profileImage: string | null;
  initialCredit: number;
}

export function UserMenu({
  userId,
  initialNickname,
  profileImage,
  initialCredit,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [credit, setCredit] = useState<number>(initialCredit); // 💡 크레딧을 상태로 관리
  const [nickname, setNickname] = useState<string>(initialNickname); // 💡 닉네임도 상태로 관리

  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClientSideClient();

  // 외부 클릭 시 메뉴 닫기 및 ESC 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 내 정보(크레딧, 닉네임) 실시간 구독
  useEffect(() => {
    const channel = supabase
      .channel(`realtime_user_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${userId}`, // ⭐ 중요: 전체 유저가 아니라 '내 정보'의 변경사항만 필터링해서 구독합니다!
        },
        (payload) => {
          // 서버에서 내 정보가 바뀌면(입찰 성공or타인에 의한 환불) 즉시 UI 상태 갱신!
          if (payload.new.credit !== undefined) setCredit(payload.new.credit);
          if (payload.new.nickname !== undefined)
            setNickname(payload.new.nickname);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.refresh();
  };

  return (
    <div className="relative flex items-center" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 transition-colors rounded-full cursor-pointer"
      >
        <div className="flex items-center mr-1 gap-2">
          <span className="hidden sm:inline-block text-xs font-bold text-gray-400">
            보유 크레딧
          </span>
          <span className="text-sm font-extrabold text-orange-500">
            {credit.toLocaleString()}원
          </span>
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          <span className="font-bold text-gray-900">{nickname}</span>님
          반가워요!
        </span>

        <div className="w-8 h-8 overflow-hidden bg-gray-200 rounded-full shrink-0 border border-gray-200">
          {profileImage ? (
            <img
              src={profileImage}
              alt="프로필"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <svg
              className="w-full h-full text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-[36px] right-0 w-48 py-2 mt-2 bg-white border border-gray-100 shadow-xl rounded-xl z-50">
          <Link
            href="/setup-profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            닉네임 변경
          </Link>
          <Link
            href="/my-values"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            내가 산 가치 목록
          </Link>
          <div className="h-px my-2 bg-gray-100"></div>

          {/* 💡 button의 onClick 이벤트로 변경 */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
