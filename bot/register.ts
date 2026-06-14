/**
 * Registra os slash commands do Lumenn Relay via API REST do Discord.
 *
 * Usa PUT (bulk overwrite). Dois modos:
 *
 *   deno task register              → limpa guild de teste e registra global (propaga em até 1h)
 *   deno task register-guild        → registra guild específica (instantâneo, para testes)
 *
 * Para limpar/registrar guild, define DISCORD_GUILD_ID no .env.local.
 *
 * Requer DISCORD_APP_ID e DISCORD_BOT_TOKEN (ver .env.local.example).
 */

import { commands } from "./src/commands.ts"

const APP_ID = Deno.env.get("DISCORD_APP_ID")
const BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN")
const GUILD_ID = Deno.env.get("DISCORD_GUILD_ID") // opcional — usado para limpar guild de teste
const registerGuildOnly = Deno.args.includes("--guild")

if (!APP_ID || !BOT_TOKEN) {
  console.error("Faltam DISCORD_APP_ID e/ou DISCORD_BOT_TOKEN no ambiente.")
  Deno.exit(1)
}

const headers = {
  "Authorization": `Bot ${BOT_TOKEN}`,
  "Content-Type": "application/json",
}

async function bulkOverwriteCommands(url: string, body: unknown, scope: string) {
  console.log(`Registrando comandos (${scope})...`)

  const res = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    console.error(`Falha ao registrar comandos (${scope}): ${res.status} ${res.statusText}`)
    console.error(await res.text())
    Deno.exit(1)
  }

  const registered = (await res.json()) as Array<{ name: string }>
  console.log(
    `✓ ${registered.length} comando(s) registrado(s) (${scope}):`,
    registered.map((c) => c.name).join(", ") || "(nenhum)",
  )
}

const globalUrl = `https://discord.com/api/v10/applications/${APP_ID}/commands`

if (registerGuildOnly) {
  if (!GUILD_ID) {
    console.error("DISCORD_GUILD_ID é obrigatório para deno task register-guild.")
    Deno.exit(1)
  }

  const guildUrl = `https://discord.com/api/v10/applications/${APP_ID}/guilds/${GUILD_ID}/commands`
  await bulkOverwriteCommands(guildUrl, commands, `guild ${GUILD_ID}`)
} else {
  if (GUILD_ID) {
    const guildUrl =
      `https://discord.com/api/v10/applications/${APP_ID}/guilds/${GUILD_ID}/commands`
    await bulkOverwriteCommands(guildUrl, [], `limpeza guild ${GUILD_ID}`)
  } else {
    console.warn("DISCORD_GUILD_ID não definido; pulando limpeza de comandos guild-specific.")
  }

  await bulkOverwriteCommands(globalUrl, commands, "global")
}
