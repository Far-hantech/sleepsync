-- ============================================================
-- SleepSync — Initial Schema Migration
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- users table (extends auth.users)
-- ============================================================
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  sleep_goal_time time,
  wake_goal_time time,
  timezone text not null default 'America/New_York',
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- sleep_entries table
-- ============================================================
create table if not exists public.sleep_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  date date not null,
  planned_sleep timestamptz,
  actual_sleep timestamptz,
  wake_time timestamptz,
  quality_rating int check (quality_rating between 1 and 5),
  notes text,
  streak_count int not null default 0,
  is_hit boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists sleep_entries_user_date_idx
  on public.sleep_entries(user_id, date);

-- ============================================================
-- accountability_pairs table
-- ============================================================
create table if not exists public.accountability_pairs (
  id uuid default gen_random_uuid() primary key,
  user_a uuid references public.users(id) on delete cascade not null,
  user_b uuid references public.users(id) on delete cascade,
  invite_token uuid default gen_random_uuid() not null unique,
  status text not null default 'pending' check (status in ('pending', 'active', 'declined')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- push_subscriptions table
-- ============================================================
create table if not exists public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  endpoint text not null unique,
  keys jsonb not null,
  notification_prefs jsonb not null default '{
    "t_minus_60": true,
    "t_minus_30": true,
    "bedtime": true,
    "overdue": true,
    "morning": true
  }'::jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- wind_down_steps table (per-user customizable)
-- ============================================================
create table if not exists public.wind_down_steps (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  steps jsonb not null default '[
    {"id": "1", "label": "Put phone face-down", "completed": false},
    {"id": "2", "label": "Dim all lights", "completed": false},
    {"id": "3", "label": "Stop all screens", "completed": false},
    {"id": "4", "label": "Do 4-7-8 breathing", "completed": false},
    {"id": "5", "label": "Set tomorrow'\''s intention", "completed": false}
  ]'::jsonb,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Row-Level Security Policies
-- ============================================================

-- Users: can only read/write own row
alter table public.users enable row level security;

create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

create policy "users_delete_own" on public.users
  for delete using (auth.uid() = id);

-- Sleep entries: own rows only
alter table public.sleep_entries enable row level security;

create policy "sleep_entries_select_own" on public.sleep_entries
  for select using (auth.uid() = user_id);

create policy "sleep_entries_insert_own" on public.sleep_entries
  for insert with check (auth.uid() = user_id);

create policy "sleep_entries_update_own" on public.sleep_entries
  for update using (auth.uid() = user_id);

create policy "sleep_entries_delete_own" on public.sleep_entries
  for delete using (auth.uid() = user_id);

-- Accountability pairs: visible to either partner
alter table public.accountability_pairs enable row level security;

create policy "accountability_pairs_select" on public.accountability_pairs
  for select using (auth.uid() = user_a or auth.uid() = user_b);

create policy "accountability_pairs_insert_own" on public.accountability_pairs
  for insert with check (auth.uid() = user_a);

create policy "accountability_pairs_update" on public.accountability_pairs
  for update using (auth.uid() = user_a or auth.uid() = user_b);

-- Push subscriptions: own rows only
alter table public.push_subscriptions enable row level security;

create policy "push_subscriptions_select_own" on public.push_subscriptions
  for select using (auth.uid() = user_id);

create policy "push_subscriptions_insert_own" on public.push_subscriptions
  for insert with check (auth.uid() = user_id);

create policy "push_subscriptions_update_own" on public.push_subscriptions
  for update using (auth.uid() = user_id);

create policy "push_subscriptions_delete_own" on public.push_subscriptions
  for delete using (auth.uid() = user_id);

-- Wind-down steps: own row only
alter table public.wind_down_steps enable row level security;

create policy "wind_down_steps_select_own" on public.wind_down_steps
  for select using (auth.uid() = user_id);

create policy "wind_down_steps_insert_own" on public.wind_down_steps
  for insert with check (auth.uid() = user_id);

create policy "wind_down_steps_update_own" on public.wind_down_steps
  for update using (auth.uid() = user_id);

-- ============================================================
-- Trigger: auto-create user profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Trigger: update users.updated_at on change
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
  before update on public.users
  for each row execute procedure public.set_updated_at();
