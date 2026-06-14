import { validateDiscordId, type AuthorizedUserRecord } from "./hub-auth"

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string }

const statuses = new Set(["pending", "approved", "revoked"])
const phases = new Set(["alpha", "beta"])

export type AdminCreatePayload = {
  discord_id: string
  username: string | null
  status: AuthorizedUserRecord["status"]
  phase: AuthorizedUserRecord["phase"]
}

export type AdminUpdatePayload = {
  discord_id: string
  username?: string | null
  status?: AuthorizedUserRecord["status"]
  phase?: AuthorizedUserRecord["phase"]
}

export type AdminDeletePayload = {
  discord_id: string
}

function readObject(payload: unknown): Record<string, unknown> | null {
  return payload && typeof payload === "object" && !Array.isArray(payload)
    ? (payload as Record<string, unknown>)
    : null
}

function parseUsername(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  const username = value.trim()
  return username.length > 0 ? username.slice(0, 80) : null
}

function parseStatus(value: unknown, fallback: AuthorizedUserRecord["status"]) {
  if (value === undefined || value === null || value === "") {
    return fallback
  }

  return typeof value === "string" && statuses.has(value)
    ? (value as AuthorizedUserRecord["status"])
    : null
}

function parsePhase(value: unknown, fallback: AuthorizedUserRecord["phase"]) {
  if (value === undefined || value === null || value === "") {
    return fallback
  }

  return typeof value === "string" && phases.has(value)
    ? (value as AuthorizedUserRecord["phase"])
    : null
}

export function parseAdminCreatePayload(payload: unknown): ParseResult<AdminCreatePayload> {
  const object = readObject(payload)

  if (!object) {
    return { ok: false, error: "payload inválido" }
  }

  const discordId = object?.discord_id

  if (!validateDiscordId(discordId)) {
    return { ok: false, error: "discord_id inválido" }
  }

  const status = parseStatus(object.status, "pending")
  if (!status) {
    return { ok: false, error: "status inválido" }
  }

  const phase = parsePhase(object.phase, "alpha")
  if (!phase) {
    return { ok: false, error: "phase inválida" }
  }

  return {
    ok: true,
    value: {
      discord_id: discordId,
      username: parseUsername(object.username),
      status,
      phase,
    },
  }
}

export function parseAdminUpdatePayload(payload: unknown): ParseResult<AdminUpdatePayload> {
  const object = readObject(payload)

  if (!object) {
    return { ok: false, error: "payload inválido" }
  }

  const discordId = object?.discord_id

  if (!validateDiscordId(discordId)) {
    return { ok: false, error: "discord_id inválido" }
  }

  const value: AdminUpdatePayload = { discord_id: discordId }

  if ("username" in object) {
    value.username = parseUsername(object.username)
  }

  if ("status" in object) {
    const status = parseStatus(object.status, "pending")
    if (!status) {
      return { ok: false, error: "status inválido" }
    }
    value.status = status
  }

  if ("phase" in object) {
    const phase = parsePhase(object.phase, "alpha")
    if (!phase) {
      return { ok: false, error: "phase inválida" }
    }
    value.phase = phase
  }

  if (!("username" in value) && !value.status && !value.phase) {
    return { ok: false, error: "nenhuma alteração informada" }
  }

  return { ok: true, value }
}

export function parseAdminDeletePayload(payload: unknown): ParseResult<AdminDeletePayload> {
  const object = readObject(payload)

  if (!object) {
    return { ok: false, error: "payload inválido" }
  }

  const discordId = object?.discord_id

  if (!validateDiscordId(discordId)) {
    return { ok: false, error: "discord_id inválido" }
  }

  return { ok: true, value: { discord_id: discordId } }
}
