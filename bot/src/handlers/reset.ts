import { db } from "../supabase.ts"
import { ephemeral, errorEmbed, infoEmbed, message, successEmbed } from "../embeds.ts"
import type { Interaction } from "../types.ts"

const MANAGE_GUILD = 1n << 5n

function hasManageGuild(permissions: string): boolean {
  return (BigInt(permissions) & MANAGE_GUILD) === MANAGE_GUILD
}

/** Handler para `/reset [confirm:true]` (RF-017, RF-035). */
export async function handleReset(interaction: Interaction): Promise<Response> {
  const guildId = interaction.guild_id
  if (!guildId) return ephemeral(errorEmbed("Erro", "Este comando só pode ser usado em servidores."))

  const permissions = interaction.member?.permissions ?? "0"
  if (!hasManageGuild(permissions)) {
    return ephemeral(
      errorEmbed("Sem permissão", "Apenas administradores do servidor podem resetar o leaderboard. (RF-035)"),
    )
  }

  const { data: world, error } = await db
    .from("worlds")
    .select("id, foundry_world_name")
    .eq("discord_guild_id", guildId)
    .single()

  if (error || !world) {
    return ephemeral(errorEmbed("Não configurado", "Este servidor não tem um mundo vinculado."))
  }

  const confirmed = Boolean(interaction.data?.options?.find((o) => o.name === "confirm")?.value)

  if (!confirmed) {
    return ephemeral(
      infoEmbed(
        "⚠️ Confirmar reset",
        `Tem certeza? Isso apagará **todas as rolagens** de **${world.foundry_world_name}**.\n\nUse \`/reset confirm:True\` para confirmar.`,
      ),
    )
  }

  const { data: players } = await db.from("players").select("id").eq("world_id", world.id)

  const playerIds = players?.map((p) => p.id) ?? []
  if (playerIds.length > 0) {
    const { error: deleteError } = await db.from("rolls").delete().in("player_id", playerIds)
    if (deleteError) return ephemeral(errorEmbed("Erro", "Falha ao zerar o leaderboard. Tente novamente."))
  }

  return message(
    successEmbed(
      "🔄 Leaderboard zerado!",
      `Todas as rolagens de **${world.foundry_world_name}** foram apagadas.\nO placar foi reiniciado.`,
    ),
  )
}
