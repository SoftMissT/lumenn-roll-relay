import { db } from "../supabase.ts"
import { ephemeral, errorEmbed, infoEmbed, message, successEmbed } from "../embeds.ts"
import type { Interaction } from "../types.ts"
import { generateWorldToken } from "../utils/token.ts"

const MANAGE_GUILD = 1n << 5n

function hasManageGuild(permissions: string): boolean {
  return (BigInt(permissions) & MANAGE_GUILD) === MANAGE_GUILD
}

/** Handler para `/reset [confirm:true]` (RF-017, RF-035) e `/reset token`. */
export async function handleReset(interaction: Interaction): Promise<Response> {
  const guildId = interaction.guild_id
  if (!guildId) return ephemeral(errorEmbed("Erro", "Este comando só pode ser usado em servidores."))

  const permissions = interaction.member?.permissions ?? "0"
  if (!hasManageGuild(permissions)) {
    return ephemeral(
      errorEmbed("Sem permissão", "Apenas administradores do servidor podem usar `/reset`. (RF-035)"),
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

  const subcommand = interaction.data?.options?.[0]

  if (subcommand?.name === "token") {
    let newToken: string | null = null
    for (let attempt = 0; attempt < 3; attempt++) {
      const token = generateWorldToken()
      const { data, error: updateError } = await db
        .from("worlds")
        .update({ world_token: token })
        .eq("id", world.id)
        .select("world_token")
        .single()

      if (!updateError && data) {
        newToken = data.world_token
        break
      }
      const isUniqueViolation =
        updateError?.code === "23505" || updateError?.message?.toLowerCase().includes("unique")
      if (!isUniqueViolation) {
        return ephemeral(errorEmbed("Erro", "Falha ao gerar novo token. Tente novamente."))
      }
    }

    if (!newToken) {
      return ephemeral(errorEmbed("Erro interno", "Não foi possível gerar um token único. Tente novamente."))
    }

    return ephemeral(
      successEmbed(
        "🔑 Token regenerado!",
        `Novo token para **${world.foundry_world_name}**:\n\`\`\`\n${newToken}\n\`\`\`\nAtualize nas configurações do módulo Foundry: **Configurações do Módulo → Lumenn Roll Relay → World Token**\n\n⚠️ O token antigo não funciona mais.`,
      ),
    )
  }

  const confirmed = Boolean(subcommand?.options?.find((o) => o.name === "confirm")?.value)

  if (!confirmed) {
    return ephemeral(
      infoEmbed(
        "⚠️ Confirmar reset",
        `Tem certeza? Isso apagará **todas as rolagens** de **${world.foundry_world_name}**.\n\nUse \`/reset leaderboard confirm:True\` para confirmar.`,
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
