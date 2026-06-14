import type { User } from "@supabase/supabase-js"

export const SUPER_ADMIN_DISCORD_ID = process.env.SUPER_ADMIN_DISCORD_ID ?? ""

export type AuthorizedUserRecord = {
  discord_id?: string | null
  username?: string | null
  status: "pending" | "approved" | "revoked"
  phase: "alpha" | "beta"
}

export type HubAuthorizationDecision =
  | { authorized: true; phase: "alpha" | "beta"; reason: "super_admin" | "allowlist" }
  | { authorized: false; reason: "invalid_discord_id" | "not_found" | "not_approved" }

export function validateDiscordId(discordId: unknown): discordId is string {
  return typeof discordId === "string" && /^\d{17,20}$/.test(discordId)
}

export function evaluateHubAuthorization({
  discordId,
  superAdminDiscordId = SUPER_ADMIN_DISCORD_ID,
  record,
}: {
  discordId: string
  superAdminDiscordId?: string
  record: Pick<AuthorizedUserRecord, "status" | "phase"> | null
}): HubAuthorizationDecision {
  if (!validateDiscordId(discordId)) {
    return { authorized: false, reason: "invalid_discord_id" }
  }

  if (discordId === superAdminDiscordId) {
    return { authorized: true, phase: "alpha", reason: "super_admin" }
  }

  if (!record) {
    return { authorized: false, reason: "not_found" }
  }

  if (record.status !== "approved") {
    return { authorized: false, reason: "not_approved" }
  }

  return { authorized: true, phase: record.phase, reason: "allowlist" }
}

export function getDiscordIdFromUser(user: User): string | null {
  const discordIdentity = user.identities?.find((identity) => identity.provider === "discord")
  const identityData = discordIdentity?.identity_data
  const providerId = discordIdentity?.id

  if (validateDiscordId(providerId)) {
    return providerId
  }

  if (identityData && typeof identityData === "object") {
    const data = identityData as Record<string, unknown>

    for (const key of ["provider_id", "sub", "id"]) {
      if (validateDiscordId(data[key])) {
        return data[key]
      }
    }
  }

  return null
}
