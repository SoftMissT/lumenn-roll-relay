/**
 * Definições dos slash commands do Lumenn Relay.
 *
 * Tipos: 1=CHAT_INPUT, 2=USER, 3=MESSAGE
 * Tipos de opção: 1=SUB_COMMAND, 3=STRING, 5=BOOLEAN
 * Referência: https://discord.com/developers/docs/interactions/application-commands
 */

export type CommandOption = {
  type: number
  name: string
  description: string
  required?: boolean
  options?: CommandOption[]
}

export type SlashCommand = {
  name: string
  description: string
  type: number
  options?: CommandOption[]
}

export const pingCommand: SlashCommand = {
  name: "ping",
  description: "Verifica se o Lumenn Relay está online e mostra latência.",
  type: 1,
}

export const setupCommand: SlashCommand = {
  name: "setup",
  description: "Configura o Lumenn Relay neste servidor: gera token, cria canal e vincula ao mundo Foundry.",
  type: 1,
  options: [
    {
      type: 3, // STRING
      name: "nome_do_mundo",
      description: "Nome do mundo Foundry (ex: \"Campanha Aincrad\").",
      required: true,
    },
    {
      type: 3, // STRING
      name: "categoria_id",
      description: "ID da categoria onde criar o canal #lumenn-relay (opcional — deixe vazio para a raiz).",
      required: false,
    },
  ],
}

export const registrarCommand: SlashCommand = {
  name: "registrar",
  description: "Registra você no mundo vinculado para rastrear suas rolagens no leaderboard.",
  type: 1,
}

export const configCommand: SlashCommand = {
  name: "config",
  description: "Gerencia a configuração do Lumenn Relay neste servidor.",
  type: 1,
  options: [
    {
      type: 1, // SUB_COMMAND
      name: "channel",
      description: "Define este canal como destino das rolagens do mundo vinculado.",
    },
    {
      type: 1, // SUB_COMMAND
      name: "status",
      description: "Mostra o vínculo atual mundo↔canal.",
    },
  ],
}

export const leaderboardCommand: SlashCommand = {
  name: "leaderboard",
  description: "Mostra o ranking de críticos e falhas do mundo vinculado.",
  type: 1,
  options: [
    {
      type: 5, // BOOLEAN
      name: "me",
      description: "Mostrar apenas seus próprios stats.",
      required: false,
    },
  ],
}

export const resetCommand: SlashCommand = {
  name: "reset",
  description: "Zera o leaderboard do mundo vinculado (requer Manage Guild).",
  type: 1,
  options: [
    {
      type: 5, // BOOLEAN
      name: "confirm",
      description: "Confirmar o reset — apaga todas as rolagens registradas.",
      required: false,
    },
  ],
}

/** Todos os comandos registrados. */
export const commands: SlashCommand[] = [
  pingCommand,
  setupCommand,
  registrarCommand,
  configCommand,
  leaderboardCommand,
  resetCommand,
]
