-- Enable RLS and restrict access to service role (server-side)
alter table public.magic_links enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'magic_links'
      and policyname = 'Service role can manage magic_links'
  ) then
    create policy "Service role can manage magic_links"
    on public.magic_links
    for all
    to service_role
    using (true)
    with check (true);
  end if;
end$$;
