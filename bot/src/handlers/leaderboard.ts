import { db } from "../supabase.ts"
import { ephemeral, errorEmbed, infoEmbed, message } from "../embeds.ts"
import type { Interaction } from "../types.ts"

const MEDALS = ["🥇", "🥈", "🥉"]

/** Handler para `/leaderboard [me:true]` (RF-016). */
export async function handleLeaderboard(interaction: Interaction): Promise<Response> {
  const guildId = interaction.guild_id
  if (!guildId) return ephemeral(errorEmbed("Erro", "Este comando só pode ser usado em servidores."))

  const { data: world, error: worldError } = await db
    .from("worlds")
    .select("id, foundry_world_name")
    .eq("discord_guild_id", guildId)
    .single()

  if (worldError || !world) {
    return ephemeral(
      errorEmbed("Não configurado", "Este servidor não tem um mundo vinculado. Peça ao GM para usar `/config setup`."),
    )
  }

  const showMe = Boolean(interaction.data?.options?.find((o) => o.name === "me")?.value)

  if (showMe) {
    const userId = interaction.member?.user?.id
    if (!userId) return ephemeral(errorEmbed("Erro", "Não foi possível identificar o usuário."))

    const { data: player } = await db
      .from("players")
      .select("id, display_name")
      .eq("world_id", world.id)
      .eq("discord_id", userId)
      .single()

    if (!player) {
      return ephemeral(infoEmbed("Sem dados", "Você ainda não tem rolagens registradas neste mundo."))
    }

    const { data: rolls } = await db
      .from("rolls")
      .select("is_critical, is_fumble")
      .eq("player_id", player.id)

    const criticals = rolls?.filter((r) => r.is_critical).length ?? 0
    const fumbles = rolls?.filter((r) => r.is_fumble).length ?? 0

    return ephemeral(
      infoEmbed(`📊 Seus stats — ${player.display_name}`, `Mundo: **${world.foundry_world_name}**`, [
        { name: "⚡ Críticos", value: String(criticals), inline: true },
        { name: "💀 Fumbles", value: String(fumbles), inline: true },
      ]),
    )
  }

  // Leaderboard completo — 2 queries, join em memória (evita N+1)
  const { data: players, error } = await db
    .from("players")
    .select("id, display_name")
    .eq("world_id", world.id)

  if (error) return ephemeral(errorEmbed("Erro", "Falha ao buscar jogadores."))
  if (!players?.length) return ephemeral(infoEmbed("Leaderboard vazio", "Nenhuma rolagem registrada ainda."))

  const playerIds = players.map((p) => p.id)

  const { data: rolls, error: rollsError } = await db
    .from("rolls")
    .select("player_id, is_critical, is_fumble")
    .in("player_id", playerIds)

  if (rollsError) return ephemeral(errorEmbed("Erro", "Falha ao buscar rolagens."))

  const statsMap = new Map<string, { criticals: number; fumbles: number }>()
  for (const r of rolls ?? []) {
    const s = statsMap.get(r.player_id) ?? { criticals: 0, fumbles: 0 }
    if (r.is_critical) s.criticals++
    if (r.is_fumble) s.fumbles++
    statsMap.set(r.player_id, s)
  }

  const ranked = players
    .map((p) => ({ name: p.display_name, ...(statsMap.get(p.id) ?? { criticals: 0, fumbles: 0 }) }))
    .sort((a, b) => b.criticals - a.criticals)
    .slice(0, 10)

  const lines = ranked.map((p, i) => {
    const medal = MEDALS[i] ?? `**${i + 1}.**`
    return `${medal} **${p.name}** — ⚡ ${p.criticals}  💀 ${p.fumbles}`
  })

  return message(
    infoEmbed(`🏆 Leaderboard — ${world.foundry_world_name}`, lines.join("\n")),
  )
}
