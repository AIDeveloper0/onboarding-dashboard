-- Create users_custom table with unique email
create extension if not exists "pgcrypto";

create table if not exists public.users_custom (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  phone text,
  full_name text not null,
  q1 text, -- company name
  q2 text, -- website URL
  q3 text, -- services description
  latitude double precision,
  longitude double precision,
  elevation double precision,
  created_at timestamptz not null default now()
);

-- Ensure unique email constraint exists (Postgres does not support IF NOT EXISTS on constraints)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_custom_email_key'
  ) then
    alter table public.users_custom
      add constraint users_custom_email_key unique (email);
  end if;
end$$;
