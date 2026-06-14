/** Tipos compartilhados para as interações Discord (HTTP Interactions). */

export type InteractionOption = {
  name: string
  type: number
  value?: unknown
  options?: InteractionOption[]
}

export type Interaction = {
  type?: number
  guild_id?: string
  channel_id?: string
  member?: {
    permissions?: string
    nick?: string
    user?: { id?: string; username?: string; global_name?: string }
  }
  data?: {
    name?: string
    options?: InteractionOption[]
  }
}
