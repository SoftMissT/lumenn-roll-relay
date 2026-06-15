-- Adiciona suporte a nome de personagem (editavel pelo jogador) e a mensagem
-- fixada do leaderboard no canal Discord.
--
-- NOTA de sintaxe (pesquisa): o Postgres NAO aceita misturar privilegios de
-- tabela (SELECT, INSERT) com privilegios de coluna (UPDATE (col)) numa unica
-- instrucao GRANT. Por isso usamos grants de coluna separados, seguindo o
-- padrao ja estabelecido em 20260614183204 e 20260614221636. A seguranca real
-- continua nas policies RLS, que restringem por X-Lumenn-World-Token.

-- 1. Colunas novas -----------------------------------------------------------

-- Nome do personagem, exibido no leaderboard como "Nome Discord (Personagem)".
alter table public.players add column if not exists character_name text;

-- Referencia a mensagem fixada do leaderboard no canal Discord do mundo.
alter table public.worlds add column if not exists leaderboard_message_id text;

-- 2. Grants de coluna para o role anon (modulo Foundry) ----------------------

grant select (character_name) on public.players to anon;
grant insert (character_name) on public.players to anon;
grant update (character_name) on public.players to anon;

-- 3. Policy RLS de UPDATE para anon em players -------------------------------
-- Necessaria para o modulo Foundry conseguir atualizar discord_id, image_url e
-- character_name de um player existente. Sem esta policy, todo PATCH do modulo
-- era filtrado pelo RLS e falhava silenciosamente (bug latente corrigido aqui).

drop policy if exists "Anon can update players matching relay token" on public.players;

create policy "Anon can update players matching relay token" on public.players for
update to anon
using (
        exists (
            select 1
            from public.worlds w
            where
                w.id = players.world_id
                and w.world_token = public.lumenn_request_world_token ()
        )
    )
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
