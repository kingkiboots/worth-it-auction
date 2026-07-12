export function UserMenuSkeleton() {
  return (
    <div className="flex items-center gap-2 animate-pulse">
      {/* 닉네임 텍스트 자리 */}
      <div className="h-4 w-20 bg-gray-200 rounded"></div>
      {/* 프로필 이미지 동그라미 자리 */}
      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
    </div>
  );
}
