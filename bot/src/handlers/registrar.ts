import { db } from "../supabase.ts"
import { ephemeral, errorEmbed, infoEmbed, successEmbed } from "../embeds.ts"
import type { Interaction } from "../types.ts"

/** Handler para `/registrar` — auto-registro de jogador no mundo vinculado. */
export async function handleRegistrar(interaction: Interaction): Promise<Response> {
  const guildId = interaction.guild_id
  if (!guildId) return ephemeral(errorEmbed("Erro", "Este comando só pode ser usado em servidores."))

  const userId = interaction.member?.user?.id
  if (!userId) return ephemeral(errorEmbed("Erro", "Não foi possível identificar seu usuário."))

  const displayName =
    interaction.member?.nick ??
    interaction.member?.user?.global_name ??
    interaction.member?.user?.username ??
    "Jogador"

  // Busca o mundo vinculado ao servidor.
  const { data: world, error: worldError } = await db
    .from("worlds")
    .select("id, foundry_world_name")
    .eq("discord_guild_id", guildId)
    .maybeSingle()

  if (worldError || !world) {
    return ephemeral(
      infoEmbed(
        "Servidor não configurado",
        "Este servidor ainda não tem um mundo Foundry vinculado.\nPeça ao GM para usar `/setup` primeiro.",
      ),
    )
  }

  // Verifica se o jogador já está registrado neste mundo.
  const { data: existing } = await db
    .from("players")
    .select("display_name")
    .eq("discord_id", userId)
    .eq("world_id", world.id)
    .maybeSingle()

  if (existing) {
    return ephemeral(
      infoEmbed(
        "Já registrado",
        `Você já está registrado no mundo **${world.foundry_world_name}** como **${existing.display_name}**.`,
      ),
    )
  }

  // `foundry_user_id` tem constraint NOT NULL — placeholder até a primeira rolagem chegar do módulo.
  const { error: insertError } = await db.from("players").insert({
    discord_id: userId,
    world_id: world.id,
    display_name: displayName,
    foundry_user_id: `discord:${userId}`,
  })

  if (insertError) {
    console.error("Erro ao registrar jogador:", insertError)
    return ephemeral(errorEmbed("Erro", "Falha ao registrar. Tente novamente."))
  }

  return ephemeral(
    successEmbed(
      "✅ Registrado!",
      `Bem-vindo ao mundo **${world.foundry_world_name}**, **${displayName}**!\nSuas rolagens críticas e fumbles serão rastreadas no leaderboard.`,
    ),
  )
}
