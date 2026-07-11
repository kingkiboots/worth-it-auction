/**
 * 특정 경로와 파라미터 세트를 받아 쿼리 스트링이 결합된 URL을 안전하게 반환합니다.
 */
export function createUrlWithParams(
  path: string,
  params: Record<string, string>,
): string {
  const searchParams = new URLSearchParams();

  // 넘겨받은 파라미터 객체를 순회하며 셋팅
  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, value);
  });

  const queryString = searchParams.toString();
  return queryString ? `${path}?${queryString}` : path;
}
