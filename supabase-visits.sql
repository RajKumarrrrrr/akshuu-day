create table if not exists public.birthday_visits (
  id bigint generated always as identity primary key,
  visited_at timestamptz not null default now()
);

create table if not exists public.birthday_visit_count (
  singleton boolean primary key default true check (singleton),
  total_visits bigint not null default 0 check (total_visits >= 0),
  last_visited_at timestamptz
);

insert into public.birthday_visit_count (singleton, total_visits)
values (true, 0)
on conflict (singleton) do nothing;

alter table public.birthday_visits enable row level security;
alter table public.birthday_visit_count enable row level security;

create or replace function public.record_birthday_visit()
returns table (total_visits bigint, visited_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_visited_at timestamptz := now();
  v_total bigint;
begin
  insert into public.birthday_visits (visited_at) values (v_visited_at);
  update public.birthday_visit_count
  set total_visits = total_visits + 1,
      last_visited_at = v_visited_at
  where singleton = true
  returning total_visits into v_total;
  return query select v_total, v_visited_at;
end;
$$;

revoke all on function public.record_birthday_visit() from public;
grant usage on schema public to anon;
grant execute on function public.record_birthday_visit() to anon;
grant select on public.birthday_visit_count to anon;
grant select on public.birthday_visits to anon;
