/**
 * Lumenn Relay — handler HTTP Interactions (Deno Deploy).
 *
 * Recebe interações do Discord via webhook HTTP (sem gateway, ADR-003), verifica
 * a assinatura Ed25519 de cada request e responde:
 *   - PING (type 1)               → PONG (type 1)   [handshake de verificação]
 *   - APPLICATION_COMMAND (type 2) → resposta do comando
 *
 * Segurança: toda request é verificada; assinatura inválida → 401 (o Discord
 * envia assinaturas inválidas de propósito em checks automáticos — falhar = perder
 * o Interactions Endpoint URL).
 *
 * Referência: https://discord.com/developers/docs/interactions/overview
 * (verificado via Hive + context7, 2026-06-14).
 */

import { verifyDiscordSignature } from "./src/verify.ts"

/** InteractionType (Discord) */
const PING = 1
const APPLICATION_COMMAND = 2

/** InteractionResponseType (Discord) */
const PONG = 1
const CHANNEL_MESSAGE_WITH_SOURCE = 4

/** Flag MESSAGE_FLAGS.EPHEMERAL (resposta visível só para quem invocou). */
const EPHEMERAL = 1 << 6

const PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY") ?? ""

export async function handler(req: Request): Promise<Response> {
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

  let interaction: { type?: number; data?: { name?: string } }
  try {
    interaction = JSON.parse(rawBody)
  } catch {
    return new Response("invalid payload", { status: 400 })
  }

  // Handshake de verificação do endpoint.
  if (interaction.type === PING) {
    return Response.json({ type: PONG })
  }

  // Slash commands.
  if (interaction.type === APPLICATION_COMMAND) {
    const name = interaction.data?.name

    if (name === "ping") {
      return Response.json({
        type: CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: "Pong! Lumenn Relay online. 🎲", flags: EPHEMERAL },
      })
    }

    return Response.json({
      type: CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: "Comando desconhecido.", flags: EPHEMERAL },
    })
  }

  return new Response("unhandled interaction type", { status: 400 })
}

// Entry point do Deno Deploy (`deno serve mod.ts`): default export com fetch.
// `handler` continua exportado nomeadamente para os testes.
export default { fetch: handler }
