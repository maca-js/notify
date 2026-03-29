-- Stock Notification App — Supabase Schema
-- Run this in the Supabase SQL editor

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint unique not null,
  username text,
  first_name text not null,
  last_name text,
  photo_url text,
  created_at timestamptz default now() not null
);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  coingecko_id text unique not null,
  symbol text not null,
  name text not null,
  created_at timestamptz default now() not null
);

create table if not exists watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  asset_id uuid not null references assets(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique(user_id, asset_id)
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  asset_id uuid not null references assets(id) on delete cascade,
  -- 'percent_change' | 'threshold'
  type text not null check (type in ('percent_change', 'threshold')),
  -- 'above' | 'below'
  condition text not null check (condition in ('above', 'below')),
  value numeric not null,
  -- timeframe only relevant for percent_change alerts
  timeframe text not null default '24h' check (timeframe in ('24h')),
  is_active boolean not null default true,
  -- minutes to wait before re-triggering the same alert
  cooldown_minutes integer not null default 60,
  last_triggered_at timestamptz,
  created_at timestamptz default now() not null
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  alert_id uuid references alerts(id) on delete set null,
  asset_name text not null,
  message text not null,
  sent_at timestamptz default now() not null
);



-- Indexes for common queries
create index if not exists watchlist_user_id_idx on watchlist(user_id);
create index if not exists alerts_user_id_idx on alerts(user_id);
create index if not exists alerts_active_idx on alerts(is_active) where is_active = true;
create index if not exists notifications_user_id_idx on notifications(user_id);
