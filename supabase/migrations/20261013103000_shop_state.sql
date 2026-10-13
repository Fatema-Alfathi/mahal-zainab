create table public.shop_state (
  id smallint primary key default 1,
  version integer not null default 0,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  constraint shop_state_singleton check (id = 1)
);

alter table public.shop_state enable row level security;

revoke all on table public.shop_state from anon, authenticated;
grant select, insert, update, delete on table public.shop_state to service_role;

comment on table public.shop_state is
  'Single boutique snapshot. The Next.js server writes it with the secret key after the staff session check. No anon or authenticated policies: the publishable key cannot read customers, salaries, or bookings.';
