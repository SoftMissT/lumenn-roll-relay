import { db } from "../supabase.ts"
import { Colors, type Embed } from "../embeds.ts"

const DISCORD_API = "https://discord.com/api/v10"
const BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN") ?? ""

const MEDALS = ["🥇", "🥈", "🥉"]
const FOOTER = { text: "Lumenn Relay • Placar atualizado automaticamente" }

type PlayerRow = { id: string; display_name: string; character_name: string | null }

/** Formata o nome exibido: "Nome Discord (Personagem)" quando houver personagem. */
function formatLabel(displayName: string, characterName: string | null): string {
  return characterName ? `${displayName} (${characterName})` : displayName
}

/** Monta o embed do leaderboard fixo de um mundo (reutiliza a logica de /leaderboard). */
async function buildLeaderboardEmbed(worldId: string, worldName: string): Promise<Embed> {
  const { data: players } = await db
    .from("players")
    .select("id, display_name, character_name")
    .eq("world_id", worldId)
    .returns<PlayerRow[]>()

  if (!players?.length) {
    return {
      title: `🏆 Leaderboard — ${worldName}`,
      description: "Nenhuma rolagem registrada ainda.",
      color: Colors.primary,
      footer: FOOTER,
    }
  }

  const playerIds = players.map((p) => p.id)
  const { data: rolls } = await db
    .from("rolls")
    .select("player_id, is_critical, is_fumble")
    .in("player_id", playerIds)

  const statsMap = new Map<string, { criticals: number; fumbles: number }>()
  for (const r of rolls ?? []) {
    const s = statsMap.get(r.player_id) ?? { criticals: 0, fumbles: 0 }
    if (r.is_critical) s.criticals++
    if (r.is_fumble) s.fumbles++
    statsMap.set(r.player_id, s)
  }

  const ranked = players
    .map((p) => ({
      label: formatLabel(p.display_name, p.character_name),
      ...(statsMap.get(p.id) ?? { criticals: 0, fumbles: 0 }),
    }))
    .sort((a, b) => b.criticals - a.criticals || b.fumbles - a.fumbles)
    .slice(0, 10)

  const lines = ranked.map((p, i) => {
    const medal = MEDALS[i] ?? `**${i + 1}.**`
    return `${medal} **${p.label}** — ⚡ ${p.criticals}  💀 ${p.fumbles}`
  })

  return {
    title: `🏆 Leaderboard — ${worldName}`,
    description: lines.join("\n"),
    color: Colors.primary,
    footer: FOOTER,
  }
}

/**
 * Cria ou atualiza a mensagem fixada do leaderboard no canal Discord do mundo.
 *
 * Idempotente: usa `worlds.leaderboard_message_id` para editar sempre a mesma
 * mensagem. Se a mensagem foi deletada manualmente (404), recria e re-fixa.
 * Falha de fixacao (sem permissao Manage Messages) e logada mas nao interrompe.
 */
export async function upsertLeaderboardMessage(worldId: string, channelId: string): Promise<void> {
  if (!channelId) return

  const { data: world, error } = await db
    .from("worlds")
    .select("id, foundry_world_name, leaderboard_message_id")
    .eq("id", worldId)
    .single()

  if (error || !world) {
    console.error("Lumenn Relay | upsertLeaderboard: mundo nao encontrado", worldId)
    return
  }

  const embed = await buildLeaderboardEmbed(world.id, world.foundry_world_name)
  const messageId = world.leaderboard_message_id as string | null

  // 1. Tenta editar a mensagem fixada existente.
  if (messageId) {
    const patchRes = await fetch(`${DISCORD_API}/channels/${channelId}/messages/${messageId}`, {
      method: "PATCH",
      headers: { Authorization: `Bot ${BOT_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    })
    if (patchRes.ok) return
    if (patchRes.status !== 404) {
      console.warn(`Lumenn Relay | Falha ao editar leaderboard (${patchRes.status}); recriando.`)
    }
    // 404 = mensagem deletada manualmente → cai no fluxo de criar nova.
  }

  // 2. Cria uma nova mensagem de leaderboard.
  const postRes = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bot ${BOT_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  })

  if (!postRes.ok) {
    console.error(`Lumenn Relay | Falha ao postar leaderboard fixo (${postRes.status})`)
    return
  }

  const created = (await postRes.json()) as { id?: string }
  const newId = created.id
  if (!newId) return

  // 3. Persiste o novo message id no mundo.
  await db.from("worlds").update({ leaderboard_message_id: newId }).eq("id", world.id)

  // 4. Tenta fixar a mensagem (requer Manage Messages). Falha nao-fatal.
  const pinRes = await fetch(`${DISCORD_API}/channels/${channelId}/pins/${newId}`, {
    method: "PUT",
    headers: { Authorization: `Bot ${BOT_TOKEN}` },
  })
  if (!pinRes.ok) {
    console.warn(
      `Lumenn Relay | Nao foi possivel fixar o leaderboard (${pinRes.status}). ` +
        "Verifique a permissao 'Gerenciar Mensagens' do bot no canal.",
    )
  }
}
