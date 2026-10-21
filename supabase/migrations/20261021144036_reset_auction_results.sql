-- 💡 경매 결과 초기화 RPC: 모든 물품의 낙찰자·낙찰가와 모든 유저의 크레딧을 초기값으로 되돌리고, 입찰 이력을 비웁니다.
--    관리자 페이지(/admin)의 '경매 결과 초기화' 버튼 → resetAuctionResults 서버 액션에서 호출합니다.
--    함수 본문은 하나의 트랜잭션으로 실행되므로, 중간에 하나라도 실패하면 전부 롤백됩니다.
--    적용: Supabase 대시보드 SQL Editor에서 이 파일 내용을 실행하세요. (다시 실행해도 create or replace로 덮어씁니다.)
create or replace function public.reset_auction_results()
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text;
  v_end_time timestamptz;
begin
  -- 🔒 security definer 함수는 RLS를 우회하고 PostgREST로 직접 호출할 수도 있으므로,
  --    함수 안에서 반드시 master 권한을 검증합니다.
  select role into v_role
  from public.users
  where id = auth.uid();

  if v_role is distinct from 'master' then
    return json_build_object('success', false, 'message', '권한이 없습니다.');
  end if;

  -- 진행 중인 경매의 입찰 결과가 날아가지 않도록, 경매가 종료된 뒤에만 초기화합니다.
  select value::timestamptz into v_end_time
  from public.global_settings
  where id = 'auction_end_time';

  if v_end_time is null or now() <= v_end_time then
    return json_build_object('success', false, 'message', '경매가 종료된 뒤에만 초기화할 수 있습니다.');
  end if;

  -- 이미 초기값인 행은 건드리지 않아 불필요한 Realtime 이벤트를 줄입니다.
  -- (WHERE 절이 있으므로 WHERE 없는 UPDATE를 막는 pg_safeupdate가 켜져 있어도 동작합니다.)
  update public.auction_items
  set
    winner_id = null,
    current_price = 0
  where winner_id is not null or current_price <> 0;

  update public.users
  set
    credit = 3000000
  where credit <> 3000000;

  -- 입찰 이력도 비워야 '내가 산 가치 목록'(bids 기준)에 이전 경매 물품이 남지 않습니다.
  -- 전체 삭제지만, pg_safeupdate가 켜져 있으면 WHERE 없는 DELETE가 막히므로 where true를 명시합니다.
  delete from public.bids
  where true;

  return json_build_object('success', true, 'message', '낙찰자·낙찰가, 유저 크레딧, 입찰 이력을 초기화했습니다.');
end;
$$;

-- 비로그인(anon) 호출은 아예 막고 로그인 유저만 실행할 수 있게 합니다. (master 여부는 함수 안에서 검증)
revoke execute on function public.reset_auction_results() from public, anon;
grant execute on function public.reset_auction_results() to authenticated;
