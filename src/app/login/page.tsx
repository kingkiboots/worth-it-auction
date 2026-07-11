import { KakaoLoginButton } from "@/features/auth/ui/KakaoLoginButton";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            상황 경매 입장하기
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            당신의 가치를 찾을 준비가 되셨나요?
          </p>
        </div>

        <KakaoLoginButton />
      </div>
    </div>
  );
}
