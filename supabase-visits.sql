create table if not exists public.birthday_visits (
  id uuid primary key default gen_random_uuid(),
  visitor_name text not null check (char_length(btrim(visitor_name)) between 1 and 60),
  visited_at timestamptz not null default now()
);

alter table public.birthday_visits
  add column if not exists visitor_name text;

update public.birthday_visits
set visitor_name = 'Previous anonymous visit'
where visitor_name is null;

alter table public.birthday_visits
  alter column visitor_name set not null;

alter table public.birthday_visits enable row level security;

drop policy if exists "Allow anonymous visit timestamp inserts" on public.birthday_visits;
drop policy if exists "Allow named visit inserts" on public.birthday_visits;

create policy "Allow named visit inserts"
  on public.birthday_visits
  for insert
  to anon
  with check (char_length(btrim(visitor_name)) between 1 and 60);

grant usage on schema public to anon;
grant insert on table public.birthday_visits to anon;

create or replace function public.set_birthday_visit_time()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.visited_at := pg_catalog.now();
  new.visitor_name := pg_catalog.left(pg_catalog.btrim(new.visitor_name), 60);
  return new;
end;
$$;

revoke all on function public.set_birthday_visit_time() from public;

drop trigger if exists set_birthday_visit_time_before_insert on public.birthday_visits;

create trigger set_birthday_visit_time_before_insert
  before insert on public.birthday_visits
  for each row
  execute function public.set_birthday_visit_time();
