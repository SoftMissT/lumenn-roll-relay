-- Grant server-side access for Hub/API components that use the Supabase
-- service role key. RLS remains enabled; service_role bypasses RLS but still
-- needs table privileges after the explicit revokes in the initial schema.

grant usage on schema public to service_role;

grant select, insert, update, delete on public.worlds to service_role;
grant select, insert, update, delete on public.players to service_role;
grant select, insert, update, delete on public.rolls to service_role;
grant select, insert, update, delete on public.authorized_users to service_role;

grant execute on function public.set_authorized_users_updated_at() to service_role;
