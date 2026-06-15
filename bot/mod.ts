/**
 * Lumenn Relay — handler HTTP Interactions (Deno Deploy).
 *
 * Rotas:
 *   POST /         → Discord interactions (verificação Ed25519 obrigatória)
 *   POST /relay    → Chamado pelo módulo Foundry após persistir rolagem no Supabase
 *                    (autenticado com X-Lumenn-World-Token)
 *   POST /notify   → Chamado pela API Rust após persistir rolagem crítica/fumble
 *                    (autenticado com X-Bot-Internal-Key)
 *
 * Referência Discord: https://discord.com/developers/docs/interactions/overview
 */

import { verifyDiscordSignature } from "./src/verify.ts"
import { handleConfig } from "./src/handlers/config.ts"
import { handleLeaderboard } from "./src/handlers/leaderboard.ts"
import { handleReset } from "./src/handlers/reset.ts"
import { handleSetup } from "./src/handlers/setup.ts"
import { handleRegistrar } from "./src/handlers/registrar.ts"
import { handleRelay } from "./src/handlers/relay.ts"
import { handleHelp } from "./src/handlers/help.ts"
import { ephemeral, errorEmbed } from "./src/embeds.ts"
import type { Interaction } from "./src/types.ts"

const PING = 1
const APPLICATION_COMMAND = 2
const DISCORD_API = "https://discord.com/api/v10"

const PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY") ?? ""
const BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN") ?? ""
const BOT_INTERNAL_KEY = Deno.env.get("BOT_INTERNAL_KEY") ?? ""

/** Snowflake Discord: 1–20 dígitos numéricos. Previne path injection na URL da API. */
const SNOWFLAKE_RE = /^\d{1,20}$/

type NotifyEmbed = {
  title?: string
  description?: string
  color?: number
}

/** Constrói embed validado a partir de entrada não-confiável (previne forwarding de objeto arbitrário). */
function parseEmbed(raw: unknown): NotifyEmbed | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null
  const e = raw as Record<string, unknown>
  return {
    title: typeof e.title === "string" ? e.title.slice(0, 256) : undefined,
    description: typeof e.description === "string" ? e.description.slice(0, 4096) : undefined,
    // cor válida: inteiro 0..0xFFFFFF
    color: typeof e.color === "number" && Number.isInteger(e.color) && e.color >= 0 && e.color <= 0xffffff
      ? e.color
      : undefined,
  }
}

/** Adiciona headers CORS para permitir chamadas do Foundry module. */
function cors(res: Response): Response {
  res.headers.set("Access-Control-Allow-Origin", "*")
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, X-Lumenn-World-Token")
  return res
}

export async function handler(req: Request): Promise<Response> {
  const receivedAt = Date.now()
  const url = new URL(req.url)

  if (req.method === "OPTIONS") {
    return cors(new Response(null, { status: 204 }))
  }

  if (url.pathname === "/relay" && req.method === "POST") {
    return cors(await handleRelay(req))
  }

  if (url.pathname === "/notify" && req.method === "POST") {
    return cors(await handleNotify(req))
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
      case "ping": {
        const latency = Date.now() - receivedAt
        return Response.json({
          type: 4,
          data: {
            content: `🏓 Pong! Lumenn Relay online.\n⏱️ Latência: ${latency}ms`,
            flags: 64,
          },
        })
      }
      case "setup":
        return handleSetup(interaction)
      case "registrar":
        return handleRegistrar(interaction)
      case "config":
        return handleConfig(interaction)
      case "leaderboard":
        return handleLeaderboard(interaction)
      case "reset":
        return handleReset(interaction)
      case "help":
        return handleHelp(interaction)
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

  const { discord_channel_id, embed: rawEmbed } = body
  if (!discord_channel_id || !rawEmbed) {
    return new Response("missing fields: discord_channel_id, embed", { status: 400 })
  }

  // Valida snowflake antes de interpolar na URL (previne path injection).
  if (!SNOWFLAKE_RE.test(discord_channel_id)) {
    return new Response("invalid discord_channel_id", { status: 400 })
  }

  // Constrói embed a partir de primitivos validados (previne forwarding de objeto arbitrário).
  const embed = parseEmbed(rawEmbed)
  if (!embed) {
    return new Response("invalid embed", { status: 400 })
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
