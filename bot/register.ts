/**
 * Registra os slash commands do Lumenn Relay via API REST do Discord.
 *
 * Usa PUT (bulk overwrite). Dois modos:
 *
 *   deno task register              → global (propaga em até 1h)
 *   deno task register-guild        → guild específica (instantâneo, para testes)
 *
 * Para registro de guild, define DISCORD_GUILD_ID no .env.local.
 *
 * Requer DISCORD_APP_ID e DISCORD_BOT_TOKEN (ver .env.local.example).
 */

import { commands } from "./src/commands.ts"

const APP_ID = Deno.env.get("DISCORD_APP_ID")
const BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN")
const GUILD_ID = Deno.env.get("DISCORD_GUILD_ID") // opcional — só para registro de guild

if (!APP_ID || !BOT_TOKEN) {
  console.error("Faltam DISCORD_APP_ID e/ou DISCORD_BOT_TOKEN no ambiente.")
  Deno.exit(1)
}

const url = GUILD_ID
  ? `https://discord.com/api/v10/applications/${APP_ID}/guilds/${GUILD_ID}/commands`
  : `https://discord.com/api/v10/applications/${APP_ID}/commands`

const scope = GUILD_ID ? `guild ${GUILD_ID}` : "global"
console.log(`Registrando comandos (${scope})…`)

const res = await fetch(url, {
  method: "PUT",
  headers: {
    "Authorization": `Bot ${BOT_TOKEN}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(commands),
})

if (!res.ok) {
  console.error(`Falha ao registrar comandos: ${res.status} ${res.statusText}`)
  console.error(await res.text())
  Deno.exit(1)
}

const registered = (await res.json()) as Array<{ name: string }>
console.log(`✓ ${registered.length} comando(s) registrado(s) (${scope}):`, registered.map((c) => c.name).join(", "))
