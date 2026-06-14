/** Builders de embed seguindo a identidade visual "Oráculo de Transmissão". */

export type EmbedField = { name: string; value: string; inline?: boolean }

export type Embed = {
  title?: string
  description?: string
  color?: number
  fields?: EmbedField[]
  footer?: { text: string }
}

export const Colors = {
  primary: 0xd01452, // Crimson Lumenn
  success: 0x34d399, // verde esmeralda — crítico
  error: 0xf87171, // vermelho rubi — falha
}

const FOOTER = { text: "Lumenn Relay • Oráculo dos Dados" }

export function successEmbed(title: string, description: string, fields?: EmbedField[]): Embed {
  return { title, description, color: Colors.success, footer: FOOTER, fields }
}

export function errorEmbed(title: string, description: string): Embed {
  return { title, description, color: Colors.error, footer: FOOTER }
}

export function infoEmbed(title: string, description?: string, fields?: EmbedField[]): Embed {
  return { title, description, color: Colors.primary, footer: FOOTER, fields }
}

/** Resposta efêmera (visível só para quem invocou). */
export function ephemeral(embed: Embed): Response {
  return Response.json({ type: 4, data: { embeds: [embed], flags: 64 } })
}

/** Resposta visível no canal. */
export function message(embed: Embed): Response {
  return Response.json({ type: 4, data: { embeds: [embed] } })
}
