/**
 * Lumenn Relay — handler HTTP Interactions (Deno Deploy).
 *
 * Rotas:
 *   POST /         → Discord interactions (verificação Ed25519 obrigatória)
 *   POST /notify   → Chamado pela API Rust após persistir rolagem crítica/fumble
 *                    (autenticado com X-Bot-Internal-Key)
 *
 * Referência Discord: https://discord.com/developers/docs/interactions/overview
 */

import { verifyDiscordSignature } from "./src/verify.ts"
import { handleConfig } from "./src/handlers/config.ts"
import { handleLeaderboard } from "./src/handlers/leaderboard.ts"
import { handleReset } from "./src/handlers/reset.ts"
import { ephemeral, errorEmbed } from "./src/embeds.ts"
import type { Interaction } from "./src/types.ts"

const PING = 1
const APPLICATION_COMMAND = 2
const DISCORD_API = "https://discord.com/api/v10"

const PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY") ?? ""
const BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN") ?? ""
const BOT_INTERNAL_KEY = Deno.env.get("BOT_INTERNAL_KEY") ?? ""

export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)

  if (url.pathname === "/notify" && req.method === "POST") {
    return handleNotify(req)
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 })
  }

  const signature = req.headers.get("X-Signature-Ed25519")
  const timestamp = req.headers.get("X-Signature-Timestamp")
  const rawBody = await req.text()

  if (!signature || !timestamp || !PUBLIC_KEY) {
    return new Response("invalid request signature", { status: 401 })
  }

  const valid = await verifyDiscordSignature(PUBLIC_KEY, signature, timestamp, rawBody)
  if (!valid) {
    return new Response("invalid request signature", { status: 401 })
  }

  let interaction: Interaction
  try {
    interaction = JSON.parse(rawBody)
  } catch {
    return new Response("invalid payload", { status: 400 })
  }

  if (interaction.type === PING) {
    return Response.json({ type: 1 })
  }

  if (interaction.type === APPLICATION_COMMAND) {
    const name = interaction.data?.name

    switch (name) {
      case "ping":
        return Response.json({ type: 4, data: { content: "Pong! Lumenn Relay online. 🎲", flags: 64 } })
      case "config":
        return handleConfig(interaction)
      case "leaderboard":
        return handleLeaderboard(interaction)
      case "reset":
        return handleReset(interaction)
      default:
        return ephemeral(errorEmbed("Comando desconhecido", "Este comando não está disponível."))
    }
  }

  return new Response("unhandled interaction type", { status: 400 })
}

/** Handler do endpoint /notify — API Rust → Bot → Discord REST (§4.5). */
async function handleNotify(req: Request): Promise<Response> {
  const key = req.headers.get("X-Bot-Internal-Key")
  if (!BOT_INTERNAL_KEY || key !== BOT_INTERNAL_KEY) {
    return new Response("Unauthorized", { status: 401 })
  }

  let body: { discord_channel_id?: string; embed?: unknown }
  try {
    body = await req.json()
  } catch {
    return new Response("invalid payload", { status: 400 })
  }

  const { discord_channel_id, embed } = body
  if (!discord_channel_id || !embed) {
    return new Response("missing fields: discord_channel_id, embed", { status: 400 })
  }

  const res = await fetch(`${DISCORD_API}/channels/${discord_channel_id}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ embeds: [embed] }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error(`Discord API error ${res.status}: ${text}`)
    return new Response("Discord API error", { status: 502 })
  }

  return new Response(null, { status: 204 })
}

export default { fetch: handler }
