-- Create table to store magic link tokens and metadata
create extension if not exists "pgcrypto";

create table if not exists public.magic_links (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token text not null,
  purpose text not null default 'dashboard',
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  metadata jsonb default '{}'::jsonb
);

create index if not exists magic_links_email_idx on public.magic_links (email);
create index if not exists magic_links_token_idx on public.magic_links (token);
