import { db } from "../supabase.ts"
import { ephemeral, errorEmbed, infoEmbed, message, successEmbed } from "../embeds.ts"
import type { Interaction } from "../types.ts"

const MANAGE_GUILD = 1n << 5n

function hasManageGuild(permissions: string): boolean {
  return (BigInt(permissions) & MANAGE_GUILD) === MANAGE_GUILD
}

/** Handler para `/config setup|channel|status` (RF-018, RF-019). */
export async function handleConfig(interaction: Interaction): Promise<Response> {
  const guildId = interaction.guild_id
  if (!guildId) return ephemeral(errorEmbed("Erro", "Este comando só pode ser usado em servidores."))

  const subcommand = interaction.data?.options?.[0]
  if (!subcommand) return ephemeral(errorEmbed("Erro", "Subcommand inválido."))

  const permissions = interaction.member?.permissions ?? "0"

  switch (subcommand.name) {
    case "setup": {
      if (!hasManageGuild(permissions)) {
        return ephemeral(
          errorEmbed("Sem permissão", "Apenas administradores do servidor podem configurar o Lumenn Relay."),
        )
      }

      const token = String(subcommand.options?.find((o) => o.name === "token")?.value ?? "")
      if (!token) return ephemeral(errorEmbed("Erro", "Token não fornecido."))

      const { data: world, error } = await db
        .from("worlds")
        .select("id, foundry_world_name, discord_guild_id")
        .eq("world_token", token)
        .single()

      if (error || !world) {
        return ephemeral(
          errorEmbed("Token inválido", "Nenhum mundo encontrado com esse token. Verifique no módulo Foundry."),
        )
      }

      // Previne tenant hijack: rejeita rebind se o mundo já está vinculado a outro servidor.
      if (world.discord_guild_id && world.discord_guild_id !== guildId) {
        return ephemeral(
          errorEmbed(
            "Token já em uso",
            "Este token já está vinculado a outro servidor. Solicite um novo token no módulo Foundry (Settings → Lumenn Relay → Regenerar token).",
          ),
        )
      }

      const { error: updateError } = await db
        .from("worlds")
        .update({ discord_guild_id: guildId, discord_channel_id: interaction.channel_id })
        .eq("id", world.id)

      if (updateError) {
        return ephemeral(errorEmbed("Erro", "Falha ao vincular o mundo. Tente novamente."))
      }

      return message(
        successEmbed(
          "✅ Mundo vinculado!",
          `**${world.foundry_world_name}** foi vinculado a este canal.\nRolagens críticas e fumbles serão retransmitidas aqui.`,
        ),
      )
    }

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
