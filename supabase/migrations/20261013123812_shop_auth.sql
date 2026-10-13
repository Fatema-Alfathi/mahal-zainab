create table public.shop_auth (
  id smallint primary key default 1,
  owner_hash text not null,
  staff_hashes jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint shop_auth_singleton check (id = 1)
);

alter table public.shop_auth enable row level security;

revoke all on table public.shop_auth from anon, authenticated;
grant select, insert, update, delete on table public.shop_auth to service_role;
