/**
 * Registra os slash commands globais do Lumenn Relay via API REST do Discord.
 *
 * Usa PUT (bulk overwrite): substitui o conjunto global de comandos pelo array
 * em `commands`. Rodar manualmente quando os comandos mudarem:
 *
 *   deno task register
 *
 * Requer as env vars DISCORD_APP_ID e DISCORD_BOT_TOKEN (ver .env.local.example).
 * O token NUNCA vai para o git — só em .env.local / secrets do Deno Deploy.
 *
 * Referência: https://discord.com/developers/docs/interactions/application-commands
 */

import { commands } from "./src/commands.ts"

const APP_ID = Deno.env.get("DISCORD_APP_ID")
const BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN")

if (!APP_ID || !BOT_TOKEN) {
  console.error("Faltam DISCORD_APP_ID e/ou DISCORD_BOT_TOKEN no ambiente.")
  Deno.exit(1)
}

const url = `https://discord.com/api/v10/applications/${APP_ID}/commands`

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
console.log(`✓ ${registered.length} comando(s) registrado(s):`, registered.map((c) => c.name).join(", "))
