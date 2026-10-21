-- 💡 경매 마감 실시간 반영: 관리자가 마감 시각(global_settings.auction_end_time)을 바꾸면(즉시 종료/재시작/리셋)
--    접속 중인 모든 화면이 Realtime(postgres_changes)으로 바로 받아 입찰 폼을 닫거나 다시 엽니다.
--    이를 위해 global_settings를 Realtime publication에 추가합니다. (이미 추가돼 있으면 아무것도 하지 않음)
--    적용: Supabase 대시보드 SQL Editor에서 이 파일 내용을 실행하세요.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'global_settings'
  ) then
    alter publication supabase_realtime add table public.global_settings;
  end if;
end;
$$;
