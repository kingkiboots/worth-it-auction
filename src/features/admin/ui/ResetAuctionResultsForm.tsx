"use client";

import {
  resetAuctionResults,
  type AdminActionResult,
} from "@/features/admin/api/actions";
import { Button } from "@/shared/ui/Button";
import { SubmitButton } from "@/shared/ui/SubmitButton";
import { SyntheticEvent, useActionState, useState } from "react";

// 되돌릴 수 없는 작업이라 실행 전 확인을 받고 처리 결과 메시지를 보여줘야 해서,
// 다른 통제 버튼과 달리 별도의 클라이언트 컴포넌트로 분리했습니다.
export function ResetAuctionResultsForm() {
  const [result, formAction, isPending] =
    useActionState<AdminActionResult | null>(resetAuctionResults, null);
  const [isConfirming, setIsConfirming] = useState(false);

  // 처리 결과가 오면 확인 영역을 닫고 결과 메시지만 남깁니다.
  const [prevResult, setPrevResult] = useState(result);
  if (result !== prevResult) {
    setPrevResult(result);
    setIsConfirming(false);
  }

  // 💡 확인은 window.confirm 대신 화면 안의 확인 영역으로 받습니다.
  // window.confirm은 확인창이 떠 있는 동안 메인 스레드를 멈춰서, 브라우저/측정 도구에 따라
  // 사용자가 확인창을 읽는 시간까지 클릭 → 다음 화면 그리기 시간(INP)으로 잡히기 때문입니다.
  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    if (isConfirming) return;

    // 첫 클릭은 실행하지 않고 확인 영역만 엽니다.
    // (onSubmit에서 기본 동작을 막으면 React가 form action(서버 액션)을 실행하지 않습니다.)
    e.preventDefault();
    setIsConfirming(true);
  };

  return (
    <form action={formAction} onSubmit={handleSubmit}>
      {isConfirming ? (
        <div className="p-4 rounded-2xl border-2 border-red-200 bg-red-50">
          <p className="text-sm font-bold text-red-600 text-center break-keep">
            모든 물품의 낙찰자·낙찰가, 모든 유저의 크레딧과 입찰 이력을
            초기화합니다.
            <br />
            되돌릴 수 없습니다. 진행하시겠습니까?
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              // 실수로 실행하지 않도록 키보드 포커스는 '취소'에 둡니다.
              autoFocus
              disabled={isPending}
              onClick={() => setIsConfirming(false)}
              className="flex-1 py-3 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-2xl hover:bg-gray-50 disabled:opacity-70"
            >
              취소
            </Button>
            <div className="flex-1">
              <SubmitButton
                text="초기화"
                loadingText="초기화 중..."
                className="bg-red-500 hover:bg-red-600 text-white py-3 text-sm"
              />
            </div>
          </div>
        </div>
      ) : (
        <SubmitButton
          text="🧹 경매 결과 초기화"
          loadingText="결과 초기화 중..."
          // 데이터를 지우는 작업이라 리셋 버튼과 같은 모양에 붉은색으로 구분
          className="bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 py-3 text-sm"
          spinnerColor="text-red-500"
        />
      )}
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
