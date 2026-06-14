# Lumenn Relay — Bot (Deno)

Bot Discord do **lumenn-roll-relay** via **HTTP Interactions** (sem gateway, ADR-003).
Deploy no **Deno Deploy**. Fase 3 (esqueleto): handshake de verificação + `/ping`.

## Estrutura

```
bot/
  mod.ts            handler HTTP Interactions (default export { fetch })
  register.ts       registra os slash commands globais (PUT bulk overwrite)
  src/
    verify.ts       verificação de assinatura Ed25519 (Web Crypto nativo)
    verify_test.ts  TDD de segurança da verificação
    commands.ts     definições dos slash commands
  deno.json         tasks + config
```

## Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha (ver Discord Developer Portal):

- `DISCORD_APP_ID` — General Information
- `DISCORD_PUBLIC_KEY` — General Information (verifica assinaturas; não é segredo)
- `DISCORD_BOT_TOKEN` — Bot (segredo; **rotacionar antes do 1º uso**, ERR-004)

## Desenvolvimento local

```bash
deno task check     # type-check
deno task test      # testes (verificação de assinatura)
deno task dev       # sobe o handler local com --watch
```

## Registrar os slash commands

```bash
deno task register
```

## Deploy (Deno Deploy)

1. Criar projeto no Deno Deploy apontando para `bot/mod.ts` (entrypoint).
2. Configurar as env vars (`DISCORD_APP_ID`, `DISCORD_PUBLIC_KEY`, `DISCORD_BOT_TOKEN`).
3. Copiar a URL pública do deploy.
4. Discord Developer Portal → General Information → **Interactions Endpoint URL** = URL do deploy.
   O Discord valida com um PING; o handler responde PONG e o endpoint é aceito.
5. `deno task register` (uma vez) para publicar `/ping`.
