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
    user?: { id?: string }
  }
  data?: {
    name?: string
    options?: InteractionOption[]
  }
}
