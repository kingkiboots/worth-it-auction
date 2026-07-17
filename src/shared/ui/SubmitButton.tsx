"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/shared/ui/Button";

interface Props {
  text: string; // 평소 텍스트 (예: ▶️ 경매 시작하기)
  loadingText: string; // 로딩 중 텍스트 (예: 시작 설정 중...)
  className: string; // 배경색 등 커스텀 스타일
  spinnerColor?: string; // 스피너 색상 (기본 흰색)
}

// form action(Server Action)의 pending 상태는 폼 내부의 클라이언트 컴포넌트에서만
// useFormStatus()로 읽을 수 있어서, 이 얇은 어댑터가 그 값을 Button의 isSubmitting으로 넘겨줍니다.
export function SubmitButton({
  text,
  loadingText,
  className,
  spinnerColor = "text-white",
}: Props) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      isSubmitting={pending}
      loadingText={loadingText}
      spinnerColor={spinnerColor}
      className={`relative flex items-center justify-center w-full py-4 text-lg font-black rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-70 ${className}`}
    >
      {text}
    </Button>
  );
}
