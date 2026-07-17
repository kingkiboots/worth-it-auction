"use client";

import { ButtonHTMLAttributes } from "react";
import { ButtonSpinner } from "@/shared/ui/ButtonSpinner";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  isSubmitting?: boolean;
  loadingText?: string;
  spinnerColor?: string;
}

// 제출/비동기 액션 버튼의 최소 공통 동작(cursor-pointer, 제출 중 스피너 표시 + 비활성화)만
// 담당합니다. 색상, 크기, 폰트 같은 나머지 스타일은 전부 className으로 호출부가 결정합니다.
export function Button({
  isSubmitting = false,
  loadingText,
  spinnerColor = "text-white",
  className = "",
  disabled,
  type = "button",
  children,
  ...rest
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || isSubmitting}
      className={`cursor-pointer disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      {isSubmitting ? (
        <span className="flex items-center justify-center gap-2">
          <ButtonSpinner className={`w-5 h-5 ${spinnerColor}`} />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
