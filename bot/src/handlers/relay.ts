import { db } from "../supabase.ts"
import { upsertLeaderboardMessage } from "./leaderboard-pin.ts"

const DISCORD_API = "https://discord.com/api/v10"
const BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN") ?? ""

const COLORS = {
  primary: 0xd01452,
  success: 0x34d399,
  error: 0xf87171,
} as const

type RollPayload = {
  formula: string
  result: number
  is_critical: boolean
  is_fumble: boolean
  roll_type: string | null
  system_data: Record<string, unknown> | null
  display_name: string
  foundry_user_id: string
  discord_id: string | null
  image_url: string | null
  character_name: string | null
}

export async function handleRelay(req: Request): Promise<Response> {
  const worldToken = req.headers.get("X-Lumenn-World-Token")
  if (!worldToken) {
    return new Response(JSON.stringify({ error: "Missing X-Lumenn-World-Token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  let payload: RollPayload
  try {
    payload = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (!payload.formula || payload.result === undefined || !payload.display_name) {
    return new Response(JSON.stringify({ error: "Missing required fields: formula, result, display_name" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { data: world, error: worldError } = await db
    .from("worlds")
    .select("id, foundry_world_name, discord_channel_id")
    .eq("world_token", worldToken)
    .single()

  if (worldError || !world) {
    return new Response(JSON.stringify({ error: "World not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (!world.discord_channel_id) {
    console.warn(`Lumenn Relay | World ${world.id} sem discord_channel_id`)
    return new Response(null, { status: 204 })
  }

  const color = payload.is_critical ? COLORS.success : payload.is_fumble ? COLORS.error : COLORS.primary
  const title = payload.is_critical
    ? `⚡ Crítico! ${payload.display_name}`
    : payload.is_fumble
      ? `💀 Falha! ${payload.display_name}`
      : `🎲 ${payload.display_name} rolou`

  const fields = [
    { name: "Fórmula", value: `\`${payload.formula}\``, inline: true },
    { name: "Resultado", value: String(payload.result), inline: true },
  ]
  if (payload.roll_type) {
    fields.push({ name: "Tipo", value: payload.roll_type, inline: true })
  }

  const embed: Record<string, unknown> = {
    title,
    color,
    fields,
    footer: { text: `Lumenn Relay • ${world.foundry_world_name}` },
    timestamp: new Date().toISOString(),
  }

  if (payload.image_url) {
    embed.thumbnail = { url: payload.image_url }
  }
  if (payload.discord_id) {
    embed.author = { name: `Jogador: ${payload.display_name}`, icon_url: `https://cdn.discordapp.com/avatars/${payload.discord_id}/0.png?size=128` }
  }

  const res = await fetch(`${DISCORD_API}/channels/${world.discord_channel_id}/messages`, {
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
    return new Response(JSON.stringify({ error: "Discord API error" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Apos postar o embed individual, atualiza (ou cria/fixa) o placar fixo do
  // mundo no mesmo canal. Falha aqui nao deve invalidar o relay ja concluido.
  try {
    await upsertLeaderboardMessage(world.id, world.discord_channel_id)
  } catch (e) {
    console.error("Lumenn Relay | Erro ao atualizar leaderboard fixo:", e)
  }

  return new Response(null, { status: 204 })
}
