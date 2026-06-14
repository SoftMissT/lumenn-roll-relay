/**
 * Definições dos slash commands do Lumenn Relay.
 *
 * Na Fase 3 (esqueleto) só existe `/ping`. Os comandos /config, /leaderboard e
 * /reset entram quando a API (Fase 4) e os dados existirem.
 *
 * Tipos de comando: 1 = CHAT_INPUT (slash).
 * Referência: https://discord.com/developers/docs/interactions/application-commands
 */

export type SlashCommand = {
  name: string
  description: string
  type: number
}

export const pingCommand: SlashCommand = {
  name: "ping",
  description: "Verifica se o Lumenn Relay está online.",
  type: 1,
}

/** Todos os comandos registrados globalmente. */
export const commands: SlashCommand[] = [pingCommand]
