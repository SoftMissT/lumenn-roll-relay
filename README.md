# Lumenn Roll Relay

Retransmite rolagens do Foundry VTT para o Discord com leaderboard de criticos e fumbles.

## Arquitetura

```
Foundry VTT (modulo) ──→ Supabase REST ──→ rolls table
                     └──→ Bot /relay ──→ Discord embed

Discord Bot (Deno Deploy) ──→ /ping, /setup, /registrar, /config, /leaderboard, /reset
Hub (Next.js + Vercel) ──→ OAuth Discord, /dashboard (leaderboard + rolagens), /admin (allowlist)
```

## Componentes

| Diretorio | Stack | Deploy |
|-----------|-------|--------|
| `hub/` | Next.js + Tailwind + Supabase Auth | Vercel |
| `bot/` | Deno 2 + Web Crypto (zero deps) | Deno Deploy |
| `foundry-module/` | JS puro, ESM, sem build step | GitHub Releases |
| `supabase/migrations/` | SQL (RLS, grants, policies) | Supabase Dashboard |

## Setup rapido

### 1. Supabase

1. Criar projeto no Supabase
2. Aplicar as migrations em ordem:
   - `supabase/migrations/20260614051542_initial_schema.sql`
   - `supabase/migrations/20260614060453_grant_service_role_access.sql`
   - `supabase/migrations/20260614183204_allow_foundry_anon_relay.sql`
3. Configurar Discord OAuth em Authentication > Providers

### 2. Hub

```bash
cd hub
pnpm install
cp .env.local.example .env.local
# preencher: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#            SUPABASE_SERVICE_ROLE_KEY, SUPER_ADMIN_DISCORD_ID, HUB_INTERNAL_KEY
pnpm dev
```

### 3. Bot

```bash
cd bot
cp .env.local.example .env.local
# preencher: DISCORD_BOT_TOKEN, DISCORD_PUBLIC_KEY, DISCORD_APPLICATION_ID,
#            SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BOT_INTERNAL_KEY
deno task check
deno task test
deno task register       # registra slash commands globais
```

Deploy: push para `main` → Deno Deploy reconstrui automaticamente.

### 4. Modulo Foundry

1. Instalar pelo manifest URL:
   `https://raw.githubusercontent.com/SoftMissT/lumenn-roll-relay/main/foundry-module/module.json`
2. Ativar o modulo no mundo
3. Usar `/setup` no Discord para gerar o World Token
4. Colar o token em Configuracoes do Modulo > Lumenn Roll Relay > World Token
5. Rolar dados — as rolagens aparecem no canal `#lumenn-relay` do Discord

## Comandos Discord

| Comando | Descricao |
|---------|-----------|
| `/ping` | Verifica se o bot esta online |
| `/setup nome_do_mundo` | Cria mundo, gera token, cria canal #lumenn-relay |
| `/registrar` | Registra jogador no mundo vinculado |
| `/config channel` | Define o canal de destino das rolagens |
| `/config status` | Mostra mundo, canal e tier |
| `/config unlink confirm:True` | Desvincula o servidor do mundo |
| `/leaderboard` | Ranking de criticos e fumbles |
| `/leaderboard me:True` | Seus proprios stats |
| `/reset leaderboard confirm:True` | Zera todas as rolagens |
| `/reset token` | Gera novo World Token |

## Seguranca

- Nenhum secret no client (Foundry module usa anon key + RLS)
- BFF obrigatorio para operacoes sensivel (Hub)
- RLS em todas as tabelas do Supabase
- Rate limit em endpoints do Hub
- Valicacao Ed25519 em todas as interactions do Discord
- `service_role` nunca exposta ao browser

## Licenca

MIT
