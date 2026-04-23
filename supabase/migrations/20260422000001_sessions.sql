-- tic tac toe gameboy — sessions table
-- each row is one multiplayer session, keyed by a 6-char code.
-- both clients subscribe to their row via postgres realtime.

create table if not exists public.sessions (
  code              text primary key,
  player1_name      text,
  player2_name      text,
  current_turn      text not null default 'X' check (current_turn in ('X','O')),
  board_state       jsonb not null,               -- 9x9 array of null|'X'|'O'
  sub_results       jsonb not null,               -- length-9 array of null|'X'|'O'|'tie'
  score_x           integer not null default 0 check (score_x >= 0),
  score_o           integer not null default 0 check (score_o >= 0),
  status            text not null default 'waiting' check (status in ('waiting','active','finished')),
  match_result      text check (match_result is null or match_result in ('X','O','tie')),
  just_resolved_sub integer check (just_resolved_sub is null or (just_resolved_sub between 0 and 8)),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- keep updated_at fresh on any row write
create or replace function public.sessions_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

drop trigger if exists sessions_touch_updated_at on public.sessions;
create trigger sessions_touch_updated_at
  before update on public.sessions
  for each row execute function public.sessions_touch_updated_at();

-- expose the table to postgres realtime
alter publication supabase_realtime add table public.sessions;

-- RLS: anon can do everything on sessions. this is a kids' game between
-- friends — the six-char code IS the access control. if we ever care
-- about preventing grief-play we'd move move-validation into an edge
-- function and tighten these to "only players in this session may write".
alter table public.sessions enable row level security;

drop policy if exists anon_read_all on public.sessions;
create policy anon_read_all on public.sessions
  for select to anon, authenticated using (true);

drop policy if exists anon_insert_all on public.sessions;
create policy anon_insert_all on public.sessions
  for insert to anon, authenticated with check (true);

drop policy if exists anon_update_all on public.sessions;
create policy anon_update_all on public.sessions
  for update to anon, authenticated using (true) with check (true);

drop policy if exists anon_delete_all on public.sessions;
create policy anon_delete_all on public.sessions
  for delete to anon, authenticated using (true);

-- sweep old/abandoned sessions after ~24 hours (run via pg_cron or manually)
-- left commented out for now — add once we see how usage plays out.
-- create extension if not exists pg_cron;
-- select cron.schedule(
--   'cleanup_old_sessions',
--   '0 3 * * *',
--   $$ delete from public.sessions where updated_at < now() - interval '24 hours' $$
-- );
