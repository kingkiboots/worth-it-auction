"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/shared/config/routes";

interface UserMenuProps {
  nickname: string;
  profileImage: string | null;
}

export function UserMenu({ nickname, profileImage }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 메뉴 바깥을 클릭하면 닫히도록 처리
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* 프로필 및 닉네임 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 transition-colors rounded-full hover:bg-gray-100"
      >
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          <span className="font-bold text-gray-900">{nickname}</span>님
          반가워요!
        </span>

        {/* 카카오 프로필 이미지 (없으면 기본 회색 동그라미) */}
        <div className="w-8 h-8 overflow-hidden bg-gray-200 rounded-full shrink-0 border border-gray-200">
          {profileImage ? (
            <img
              src={profileImage}
              alt="프로필"
              className="w-full h-full object-cover"
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

      {/* Context Menu (드롭다운) */}
      {isOpen && (
        <div className="absolute right-0 w-48 py-2 mt-2 bg-white border border-gray-100 shadow-xl rounded-xl z-50">
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
          {/* TODO: 로그아웃 로직 연결 */}
          <button className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50">
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
