-- 💡 입찰 로그 영구 보존 + 중복 입찰 방지
--    행사 종료 후 초기화 때 운영 데이터(bids, 유저)는 지워도 분석/포트폴리오용 입찰 지표는 남도록
--    별도의 로그 테이블(bid_logs)에 쌓고, 입찰 RPC(place_bid)에 중복 입찰 방지를 추가합니다.
--    적용: Supabase 대시보드 SQL Editor에서 이 파일 내용을 실행하세요. (다시 실행해도 안전)

-- ==========================================================
-- 1. 입찰 로그 테이블
-- ==========================================================
-- 🚨 user_id에는 외래키(FK)를 걸지 않습니다. 유저를 지울 때 로그까지 연쇄 삭제(Cascade)되면 안 되기 때문입니다.
create table if not exists public.bid_logs (
  id serial primary key,
  user_id uuid,
  item_id int,
  bid_amount int,
  created_at timestamp with time zone default now()
);

comment on table public.bid_logs is
  '운영 데이터 초기화(bids 삭제, 유저 삭제)와 무관하게 영구 보존하는 입찰 로그. user_id에는 FK를 두지 않음';

-- 🔒 Supabase는 public 스키마의 새 테이블을 공개 API(anon/authenticated)로 읽고 쓸 수 있게 열어 두므로,
--    RLS를 켜고 권한도 회수해서 로그를 조작·삭제할 수 없게 합니다.
--    (적재는 security definer인 place_bid만 하고, 조회는 대시보드/service role로 합니다.)
alter table public.bid_logs enable row level security;
revoke all on table public.bid_logs from anon, authenticated;

-- ==========================================================
-- 2. 입찰 함수
-- ==========================================================
create or replace function public.place_bid(
  p_item_id bigint,
  p_bid_amount bigint
)
returns jsonb
language plpgsql
security definer
-- security definer 함수는 호출자가 search_path를 바꿔 다른 객체를 끼워 넣을 수 없도록 비워 둡니다. (모든 이름은 스키마까지 명시)
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_start_time timestamptz;
  v_end_time timestamptz;
  v_current_price bigint;
  v_user_credit bigint;
  v_old_winner_id uuid;
begin
  -- ==========================================================
  -- 🕒 [방어벽 1]: 경매 진행 시간 검증
  -- ==========================================================
  select value::timestamptz into v_start_time from public.global_settings where id = 'auction_start_time';
  select value::timestamptz into v_end_time from public.global_settings where id = 'auction_end_time';

  if now() < v_start_time then
    return jsonb_build_object('success', false, 'message', '아직 경매가 시작되지 않았습니다.');
  end if;

  if now() > v_end_time then
    return jsonb_build_object('success', false, 'message', '경매가 이미 종료되었습니다.');
  end if;

  -- 👤 [방어벽 2]: 로그인 검증
  -- 클라이언트가 보낸 유저 정보가 아니라 세션(auth.uid())으로만 입찰자를 식별합니다.
  v_user_id := auth.uid();
  if v_user_id is null then
    return jsonb_build_object('success', false, 'message', '로그인이 필요합니다.');
  end if;

  -- ==========================================================
  -- 🔒 트랜잭션 락 (Lock) 시작 구간
  -- ==========================================================
  -- FOR UPDATE: 이 행을 읽는 순간 다른 사람의 입찰 트랜잭션은 대기 상태에 빠집니다.
  select current_price, winner_id into v_current_price, v_old_winner_id
  from public.auction_items
  where id = p_item_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'message', '존재하지 않는 물품입니다.');
  end if;

  -- ==========================================================
  -- 🙅 [방어벽 3]: 중복 입찰 방지
  -- ==========================================================
  -- 이미 이 물품의 최고가 입찰자라면 다시 입찰할 수 없습니다. (내 가격 올리기·연타 방지)
  -- 다른 사람에게 최고가를 뺏긴 뒤 '되찾으러 가기'로 다시 입찰하는 것은 허용합니다.
  -- 💡 물품 행을 FOR UPDATE로 잠근 뒤에 검사해야, 같은 유저가 동시에 보낸 요청도 순서대로 걸러집니다.
  if v_old_winner_id = v_user_id then
    return jsonb_build_object('success', false, 'message', '이미 최고가로 입찰 중인 물품입니다.');
  end if;

  -- ==========================================================
  -- 🛡️ [방어벽 4]: 최고가 방어 로직 (동시성 제어의 핵심)
  -- ==========================================================
  -- 누군가 0.1초 차이로 먼저 락을 풀고 가격을 올렸다면, v_current_price가 높아져 있으므로 여기서 튕겨냅니다.
  if p_bid_amount <= v_current_price then
    return jsonb_build_object(
      'success', false,
      'message', '입찰 실패! 누군가 먼저 높은 가격에 입찰했습니다. 최소 ' || (v_current_price + 10000)::text || '원 이상으로 다시 시도해 주세요.'
    );
  end if;

  -- (옵션) 1만 원 단위 상향 조건 검증
  if (p_bid_amount - v_current_price) < 10000 then
    return jsonb_build_object('success', false, 'message', '현재 최고가보다 최소 1만 원 이상 높게 입찰해야 합니다.');
  end if;

  -- 💳 [방어벽 5]: 잔액 검증
  select credit into v_user_credit from public.users where id = v_user_id for update;

  if v_user_credit < p_bid_amount then
    return jsonb_build_object('success', false, 'message', '보유하신 크레딧이 부족합니다.');
  end if;

  -- ==========================================================
  -- 💰 입찰 성공 시 데이터 업데이트 처리
  -- ==========================================================

  -- 1. 기존 낙찰자가 있었다면 환불 처리 (본인 재입찰은 방어벽 3에서 막으므로 항상 다른 사람)
  if v_old_winner_id is not null then
    update public.users set credit = credit + v_current_price where id = v_old_winner_id;
  end if;

  -- 2. 물품의 최고가와 낙찰자 갱신
  update public.auction_items
  set current_price = p_bid_amount, winner_id = v_user_id, updated_at = now()
  where id = p_item_id;

  -- 3. 새로운 낙찰자의 금액 차감
  update public.users set credit = credit - p_bid_amount where id = v_user_id;

  -- 4. 입찰 이력 적재 (운영용: 행사 종료 후 초기화 때 삭제됨)
  insert into public.bids (item_id, user_id, bid_amount)
  values (p_item_id, v_user_id, p_bid_amount);

  -- 5. 입찰 로그 적재 (영구 보존용: 같은 트랜잭션이라 입찰이 실패·롤백되면 로그도 남지 않음)
  insert into public.bid_logs (item_id, user_id, bid_amount)
  values (p_item_id, v_user_id, p_bid_amount);

  -- 6. 성공 메시지 반환
  return jsonb_build_object('success', true, 'message', '입찰이 성공적으로 완료되었습니다.');
end;
$$;
