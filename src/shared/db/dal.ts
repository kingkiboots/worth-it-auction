import { cache } from "react";
import { createServerSideClient } from "./server";

// React cache()로 감싸서 같은 렌더링 패스(한 요청) 안에서는 auth.getUser()의
// Supabase Auth 서버 왕복 검증이 한 번만 일어나도록 메모이즈합니다.
// (Header, 각 페이지, AdminFloatingButton 등 여러 서버 컴포넌트가 동시에
// 로그인 유저 정보를 필요로 해도 중복 네트워크 호출이 발생하지 않습니다.)
export const getCurrentUser = cache(async () => {
  const supabase = await createServerSideClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});
