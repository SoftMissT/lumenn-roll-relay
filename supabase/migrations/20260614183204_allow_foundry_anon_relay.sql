-- Allow the Foundry module to relay rolls directly through Supabase REST
-- using the public anon key. The world token is passed as
-- X-Lumenn-World-Token and checked inside RLS policies.

create function public.lumenn_request_world_token()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(nullif(current_setting('request.headers', true), '')::json ->> 'x-lumenn-world-token', ''),
    nullif(current_setting('request.header.x-lumenn-world-token', true), '')
  );
$$;

grant usage on schema public to anon;

grant select (id, world_token) on public.worlds to anon;

grant
select (id, world_id, foundry_user_id),
insert (
        world_id,
        foundry_user_id,
        display_name
    ) on public.players to anon;

grant
insert (
        world_id,
        player_id,
        formula,
        result,
        is_critical,
        is_fumble,
        roll_type,
        system_data
    ) on public.rolls to anon;

grant
execute on function public.lumenn_request_world_token () to anon;

create policy "Anon can read world matching relay token" on public.worlds for
select to anon using (
        world_token = public.lumenn_request_world_token ()
    );

create policy "Anon can read players matching relay token" on public.players for
select to anon using (
        exists (
            select 1
            from public.worlds w
            where
                w.id = players.world_id
                and w.world_token = public.lumenn_request_world_token ()
        )
    );

create policy "Anon can insert players matching relay token" on public.players for
insert
    to anon
with
    check (
        exists (
            select 1
            from public.worlds w
            where
                w.id = players.world_id
                and w.world_token = public.lumenn_request_world_token ()
        )
    );

create policy "Anon can insert rolls for matching relay token and player" on public.rolls for
insert
    to anon
with
    check (
        exists (
            select 1
            from public.players p
                join public.worlds w on w.id = p.world_id
            where
                p.id = rolls.player_id
                and p.world_id = rolls.world_id
                and w.world_token = public.lumenn_request_world_token ()
        )
    );