create table if not exists auth_tokens (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  user_id uuid references users(id) on delete cascade,
  expires_at timestamptz not null,
  verified_at timestamptz,
  created_at timestamptz default now() not null
);
