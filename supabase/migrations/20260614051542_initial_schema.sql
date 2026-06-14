-- Initial Lumenn Roll Relay schema.
-- Source: .specs/Specs-lumenn-roll-relay.md §3.

create table public.worlds (
  id uuid primary key default gen_random_uuid(),
  world_token text unique not null,
  foundry_world_name text not null,
  discord_guild_id text,
  discord_channel_id text,
  tier text not null default 'free',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),

  constraint worlds_world_token_not_blank check (length(btrim(world_token)) > 0),
  constraint worlds_foundry_world_name_not_blank check (length(btrim(foundry_world_name)) > 0),
  constraint worlds_tier_valid check (tier in ('free', 'premium'))
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.worlds(id) on delete cascade,
  foundry_user_id text not null,
  discord_id text,
  display_name text not null,
  created_at timestamptz not null default now(),

  constraint players_foundry_user_id_not_blank check (length(btrim(foundry_user_id)) > 0),
  constraint players_display_name_not_blank check (length(btrim(display_name)) > 0),
  unique (world_id, foundry_user_id)
);

create table public.rolls (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.worlds(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  formula text not null,
  result integer not null,
  is_critical boolean not null default false,
  is_fumble boolean not null default false,
  roll_type text,
  system_data jsonb,
  created_at timestamptz not null default now(),

  constraint rolls_formula_not_blank check (length(btrim(formula)) > 0),
  constraint rolls_not_critical_and_fumble check (not (is_critical and is_fumble))
);

create table public.authorized_users (
  id uuid primary key default gen_random_uuid(),
  discord_id text unique not null,
  username text,
  status text not null default 'pending',
  phase text not null default 'alpha',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint authorized_users_discord_id_not_blank check (length(btrim(discord_id)) > 0),
  constraint authorized_users_status_valid check (status in ('pending', 'approved', 'revoked')),
  constraint authorized_users_phase_valid check (phase in ('alpha', 'beta'))
);

create index players_world_id_idx on public.players (world_id);
create index players_discord_id_idx on public.players (discord_id) where discord_id is not null;
create index rolls_world_created_at_idx on public.rolls (world_id, created_at desc);
create index rolls_player_created_at_idx on public.rolls (player_id, created_at desc);
create index authorized_users_status_idx on public.authorized_users (status);

create function public.set_authorized_users_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger authorized_users_set_updated_at
before update on public.authorized_users
for each row
execute function public.set_authorized_users_updated_at();

alter table public.worlds enable row level security;
alter table public.players enable row level security;
alter table public.rolls enable row level security;
alter table public.authorized_users enable row level security;

-- `worlds`, `players`, and `rolls` intentionally have no anon/authenticated
-- policies yet. Server components use the Supabase service role server-side.

revoke all on public.worlds from anon, authenticated;
revoke all on public.players from anon, authenticated;
revoke all on public.rolls from anon, authenticated;
revoke all on public.authorized_users from anon, authenticated;
revoke execute on function public.set_authorized_users_updated_at() from public;

grant select on public.authorized_users to authenticated;
grant insert, update, delete on public.authorized_users to authenticated;

create policy "Users can read their own authorization record"
on public.authorized_users
for select
to authenticated
using (
  discord_id = (select auth.jwt() -> 'app_metadata' ->> 'discord_id')
);

create policy "Super admin can read all authorization records"
on public.authorized_users
for select
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'discord_id') = '166973299702759424'
);

create policy "Super admin can insert authorization records"
on public.authorized_users
for insert
to authenticated
with check (
  (select auth.jwt() -> 'app_metadata' ->> 'discord_id') = '166973299702759424'
);

create policy "Super admin can update authorization records"
on public.authorized_users
for update
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'discord_id') = '166973299702759424'
)
with check (
  (select auth.jwt() -> 'app_metadata' ->> 'discord_id') = '166973299702759424'
);

create policy "Super admin can delete authorization records"
on public.authorized_users
for delete
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'discord_id') = '166973299702759424'
);
