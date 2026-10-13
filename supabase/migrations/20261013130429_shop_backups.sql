create table public.shop_backups (
  backup_date date primary key,
  version integer not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.shop_backups enable row level security;

revoke all on table public.shop_backups from anon, authenticated;
grant select, insert, update, delete on table public.shop_backups to service_role;

comment on table public.shop_backups is
  'One automatic boutique snapshot per day, taken before the first change of that day.';
