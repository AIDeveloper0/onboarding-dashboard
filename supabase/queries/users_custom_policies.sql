-- Enable RLS and allow anon inserts for signup
alter table public.users_custom enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'users_custom'
      and policyname = 'Anon can insert users_custom'
  ) then
    create policy "Anon can insert users_custom"
    on public.users_custom
    for insert
    to anon
    with check (true);
  end if;
end$$;
