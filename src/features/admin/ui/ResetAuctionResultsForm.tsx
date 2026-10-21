"use client";

import {
  resetAuctionResults,
  type AdminActionResult,
} from "@/features/admin/api/actions";
import { SubmitButton } from "@/shared/ui/SubmitButton";
import { SyntheticEvent, useActionState } from "react";

// 되돌릴 수 없는 작업이라 실행 전 확인창을 띄우고 처리 결과 메시지를 보여줘야 해서,
// 다른 통제 버튼과 달리 별도의 클라이언트 컴포넌트로 분리했습니다.
export function ResetAuctionResultsForm() {
  const [result, formAction] = useActionState<AdminActionResult | null>(
    resetAuctionResults,
    null,
  );

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    const confirmed = window.confirm(
      "모든 물품의 낙찰자·낙찰가, 모든 유저의 크레딧과 입찰 이력을 초기화합니다.\n되돌릴 수 없습니다. 진행하시겠습니까?",
    );

    // onSubmit에서 기본 동작을 막으면 React가 form action(서버 액션)을 실행하지 않습니다.
    if (!confirmed) e.preventDefault();
  };

  return (
    <form action={formAction} onSubmit={handleSubmit}>
      <SubmitButton
        text="🧹 경매 결과 초기화"
        loadingText="결과 초기화 중..."
        // 데이터를 지우는 작업이라 리셋 버튼과 같은 모양에 붉은색으로 구분
        className="bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 py-3 text-sm"
        spinnerColor="text-red-500"
      />
      {result && (
        <p
          className={`mt-2 text-sm font-bold text-center ${
            result.success ? "text-green-600" : "text-red-500"
          }`}
        >
          {result.message}
        </p>
      )}
    </form>
  );
}
