"use client";

import { ButtonSpinner } from "@/shared/ui/ButtonSpinner";
import { useFormStatus } from "react-dom";

interface Props {
  text: string; // 평소 텍스트 (예: ▶️ 경매 시작하기)
  loadingText: string; // 로딩 중 텍스트 (예: 시작 설정 중...)
  className: string; // 배경색 등 커스텀 스타일
  spinnerColor?: string; // 스피너 색상 (기본 흰색)
}

export function AdminSubmitButton({
  text,
  loadingText,
  className,
  spinnerColor = "text-white",
}: Props) {
  // 💡 form 액션이 실행 중인지(pending)를 자동으로 감지합니다!
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`relative flex items-center justify-center w-full py-4 text-lg font-black rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <ButtonSpinner className={`w-5 h-5 ${spinnerColor}`} />
          {loadingText}
        </span>
      ) : (
        text
      )}
    </button>
  );
}
