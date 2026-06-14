import { db } from "../supabase.ts"
import { ephemeral, errorEmbed, infoEmbed, message, successEmbed } from "../embeds.ts"
import type { Interaction } from "../types.ts"

const MANAGE_GUILD = 1n << 5n

function hasManageGuild(permissions: string): boolean {
  return (BigInt(permissions) & MANAGE_GUILD) === MANAGE_GUILD
}

/** Handler para `/config channel|status` (RF-019). O setup foi movido para `/setup`. */
export async function handleConfig(interaction: Interaction): Promise<Response> {
  const guildId = interaction.guild_id
  if (!guildId) return ephemeral(errorEmbed("Erro", "Este comando só pode ser usado em servidores."))

  const subcommand = interaction.data?.options?.[0]
  if (!subcommand) return ephemeral(errorEmbed("Erro", "Subcommand inválido."))

  const permissions = interaction.member?.permissions ?? "0"

  switch (subcommand.name) {
    case "channel": {
      if (!hasManageGuild(permissions)) {
        return ephemeral(errorEmbed("Sem permissão", "Apenas administradores podem alterar o canal."))
      }

      const { data: world, error } = await db
        .from("worlds")
        .select("id, foundry_world_name")
        .eq("discord_guild_id", guildId)
        .single()

      if (error || !world) {
        return ephemeral(
          errorEmbed(
            "Não configurado",
            "Este servidor não tem um mundo vinculado. Use `/config setup <token>` primeiro.",
          ),
        )
      }

      const { error: updateError } = await db
        .from("worlds")
        .update({ discord_channel_id: interaction.channel_id })
        .eq("id", world.id)

      if (updateError) return ephemeral(errorEmbed("Erro", "Falha ao atualizar o canal."))

      return message(
        successEmbed(
          "✅ Canal atualizado!",
          `As rolagens de **${world.foundry_world_name}** agora chegam neste canal.`,
        ),
      )
    }

    case "status": {
      const { data: world, error } = await db
        .from("worlds")
        .select("foundry_world_name, discord_channel_id, tier")
        .eq("discord_guild_id", guildId)
        .single()

      if (error || !world) {
        return ephemeral(
          infoEmbed("Não configurado", "Este servidor não tem um mundo vinculado.\nUse `/config setup <token>` para conectar."),
        )
      }

      return ephemeral(
        infoEmbed("Status do Lumenn Relay", undefined, [
          { name: "🌍 Mundo", value: world.foundry_world_name, inline: true },
          { name: "📢 Canal", value: `<#${world.discord_channel_id}>`, inline: true },
          { name: "✨ Tier", value: world.tier === "premium" ? "Premium ⭐" : "Free", inline: true },
        ]),
      )
    }

    default:
      return ephemeral(errorEmbed("Erro", "Subcommand desconhecido."))
  }
}
