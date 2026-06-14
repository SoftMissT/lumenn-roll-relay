import { NextRequest, NextResponse } from "next/server"

import {
  DEFAULT_SUPER_ADMIN_DISCORD_ID,
  evaluateHubAuthorization,
  validateDiscordId,
  type AuthorizedUserRecord,
} from "@/lib/hub-auth"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"

const WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 60
const buckets = new Map<string, { count: number; resetAt: number }>()

function rateLimitKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"
}

function isRateLimited(key: string) {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  bucket.count += 1
  return bucket.count > MAX_REQUESTS_PER_WINDOW
}

export async function POST(request: NextRequest) {
  const internalKey = process.env.HUB_INTERNAL_KEY

  if (!internalKey) {
    return NextResponse.json({ error: "HUB_INTERNAL_KEY is not configured" }, { status: 500 })
  }

  if (request.headers.get("x-internal-key") !== internalKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (isRateLimited(rateLimitKey(request))) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": "60" },
      },
    )
  }

  const body = (await request.json().catch(() => null)) as { discord_id?: unknown } | null
  const discordId = body?.discord_id

  if (!validateDiscordId(discordId)) {
    return NextResponse.json({ error: "discord_id inválido" }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("authorized_users")
    .select("status, phase")
    .eq("discord_id", discordId)
    .maybeSingle<Pick<AuthorizedUserRecord, "status" | "phase">>()

  if (error) {
    return NextResponse.json({ error: "Falha ao consultar autorização" }, { status: 500 })
  }

  const decision = evaluateHubAuthorization({
    discordId,
    superAdminDiscordId: process.env.SUPER_ADMIN_DISCORD_ID || DEFAULT_SUPER_ADMIN_DISCORD_ID,
    record: data,
  })

  if (!decision.authorized) {
    return NextResponse.json({ authorized: false }, { status: 403 })
  }

  return NextResponse.json({ authorized: true, phase: decision.phase })
}
