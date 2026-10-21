"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  src: string | null;
  alt: string;
  isBlurred?: boolean; // 스포 방지 등으로 누구인지 알아볼 수 없게 흐리게 가릴 때
  className?: string; // 크기, 테두리 등
}

// 프로필 이미지를 동그랗게 보여주고, 이미지가 없거나 깨지면 기본 실루엣으로 대체합니다.
// 작은 썸네일이라 Vercel 이미지 최적화(사용량 과금)를 거치지 않도록 unoptimized로 원본 URL을 그대로 씁니다.
export function Avatar({ src, alt, isBlurred = false, className = "" }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  // 테두리(원)는 선명하게 두고 안쪽만 흐리게 합니다.
  // 블러는 가장자리를 투명하게 번지게 하므로, 확대해서 번진 부분을 원 밖으로 밀어내 잘라냅니다.
  const contentClassName = `w-full h-full ${isBlurred ? "blur-sm scale-150" : ""}`;

  return (
    <div
      className={`overflow-hidden bg-gray-200 rounded-full shrink-0 ${className}`}
    >
      {src && src !== failedSrc ? (
        <Image
          src={src}
          alt={alt}
          width={32}
          height={32}
          unoptimized
          className={`${contentClassName} object-cover`}
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <svg
          className={`${contentClassName} text-gray-400`}
          fill="currentColor"
          viewBox="0 0 24 24"
          role="img"
          aria-label={alt}
        >
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </div>
  );
}
