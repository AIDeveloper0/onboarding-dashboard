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
  image1_path text,
  image2_path text,
  image3_path text,
  image4_path text,
  image5_path text,
  image6_path text,
  image7_path text,
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

-- Add image path columns on existing tables if they are missing
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users_custom' and column_name = 'image1_path'
  ) then
    alter table public.users_custom add column image1_path text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users_custom' and column_name = 'image2_path'
  ) then
    alter table public.users_custom add column image2_path text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users_custom' and column_name = 'image3_path'
  ) then
    alter table public.users_custom add column image3_path text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users_custom' and column_name = 'image4_path'
  ) then
    alter table public.users_custom add column image4_path text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users_custom' and column_name = 'image5_path'
  ) then
    alter table public.users_custom add column image5_path text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users_custom' and column_name = 'image6_path'
  ) then
    alter table public.users_custom add column image6_path text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users_custom' and column_name = 'image7_path'
  ) then
    alter table public.users_custom add column image7_path text;
  end if;
end$$;
