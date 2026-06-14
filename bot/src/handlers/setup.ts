import { db } from "../supabase.ts"
import { ephemeral, errorEmbed, successEmbed } from "../embeds.ts"
import type { Interaction } from "../types.ts"
import { generateWorldToken } from "../utils/token.ts"

const MANAGE_GUILD = 1n << 5n
const DISCORD_API = "https://discord.com/api/v10"
const BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN") ?? ""
const SNOWFLAKE_RE = /^\d{1,20}$/

function hasManageGuild(permissions: string): boolean {
  return (BigInt(permissions) & MANAGE_GUILD) === MANAGE_GUILD
}

/** Handler para `/setup <nome_do_mundo> [categoria_id]` (RF-018 revisado). */
export async function handleSetup(interaction: Interaction): Promise<Response> {
  const guildId = interaction.guild_id
  if (!guildId) return ephemeral(errorEmbed("Erro", "Este comando só pode ser usado em servidores."))

  const permissions = interaction.member?.permissions ?? "0"
  if (!hasManageGuild(permissions)) {
    return ephemeral(
      errorEmbed("Sem permissão", "Apenas administradores do servidor (Manage Guild) podem usar `/setup`."),
    )
  }

  // Garante que o servidor não tem mundo já vinculado.
  const { data: existing } = await db
    .from("worlds")
    .select("id, foundry_world_name")
    .eq("discord_guild_id", guildId)
    .maybeSingle()

  if (existing) {
    return ephemeral(
      errorEmbed(
        "Servidor já configurado",
        `Este servidor já tem o mundo **${existing.foundry_world_name}** vinculado.\nUse \`/config channel\` para mudar o canal ou \`/reset\` para desvincular.`,
      ),
    )
  }

  const options = interaction.data?.options ?? []
  const nomeMundo = String(options.find((o) => o.name === "nome_do_mundo")?.value ?? "").trim()
  const rawCategoriaId = String(options.find((o) => o.name === "categoria_id")?.value ?? "").trim()
  const categoriaId = SNOWFLAKE_RE.test(rawCategoriaId) ? rawCategoriaId : null

  if (!nomeMundo) return ephemeral(errorEmbed("Erro", "Nome do mundo não informado."))

  // Gera world_token único com até 3 tentativas (colisão improvável, mas tratada).
  let worldId: string | null = null
  let worldToken: string | null = null

  for (let attempt = 0; attempt < 3; attempt++) {
    const token = generateWorldToken()
    const { data, error } = await db
      .from("worlds")
      .insert({ world_token: token, foundry_world_name: nomeMundo })
      .select("id")
      .single()

    if (!error && data) {
      worldId = data.id
      worldToken = token
      break
    }

    // Só retenta se for violação de unique constraint (código PG 23505).
    const isUniqueViolation =
      error?.code === "23505" || error?.message?.toLowerCase().includes("unique")
    if (!isUniqueViolation) {
      console.error("Erro ao inserir world:", error)
      return ephemeral(errorEmbed("Erro", "Falha ao criar o mundo. Tente novamente."))
    }
  }

  if (!worldId || !worldToken) {
    return ephemeral(errorEmbed("Erro interno", "Não foi possível gerar um token único. Tente novamente."))
  }

  // Cria canal #lumenn-relay via Discord REST.
  // Requer permissão Manage Channels (0x10). Se falhar, o mundo fica criado sem canal.
  const channelBody: Record<string, unknown> = {
    name: "lumenn-relay",
    type: 0, // GUILD_TEXT
    topic: "Rolagens retransmitidas pelo Lumenn Relay",
  }
  if (categoriaId) channelBody.parent_id = categoriaId

  let channelId: string | null = null
  const channelRes = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(channelBody),
  })

  if (channelRes.ok) {
    const ch = (await channelRes.json()) as { id?: string }
    channelId = ch.id ?? null
  } else {
    console.error(`Falha ao criar canal: ${channelRes.status} ${await channelRes.text()}`)
  }

  // Vincula guild e canal ao mundo criado.
  await db
    .from("worlds")
    .update({ discord_guild_id: guildId, discord_channel_id: channelId })
    .eq("id", worldId)

  const canalInfo = channelId
    ? `<#${channelId}>`
    : "`lumenn-relay` *(não criado — adicione permissão Manage Channels ao bot e use `/config channel`)*`"

  const description = [
    `**Mundo:** ${nomeMundo}`,
    `**Canal:** ${canalInfo}`,
    "",
    "**Token do mundo (secreto):**",
    `\`\`\`\n${worldToken}\n\`\`\``,
    "Cole este token nas configurações do módulo Foundry VTT:",
    "**Configurações do Módulo → Lumenn Roll Relay → World Token**",
    "",
    "⚠️ Este token é único e secreto. Não compartilhe publicamente.",
  ].join("\n")

  return ephemeral(successEmbed("✅ Mundo configurado!", description))
}
