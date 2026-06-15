-- Add player profile columns for leaderboard enhancements.
-- discord_id already exists in schema. Add image_url for character portraits.
-- Also add grants for anon to insert/update these columns.

alter table public.players add column if not exists image_url text;
alter table public.players add column if not exists discord_id text;

-- Grant anon to insert/update these columns via relay
grant insert (world_id, foundry_user_id, display_name, discord_id, image_url) on public.players to anon;
grant update (discord_id, image_url) on public.players to anon;
