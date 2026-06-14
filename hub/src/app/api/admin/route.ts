import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

import {
  parseAdminCreatePayload,
  parseAdminDeletePayload,
  parseAdminUpdatePayload,
} from "@/lib/admin-api"
import {
  DEFAULT_SUPER_ADMIN_DISCORD_ID,
  getDiscordIdFromUser,
} from "@/lib/hub-auth"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 40
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

async function requireSuperAdmin(request: NextRequest) {
  if (isRateLimited(rateLimitKey(request))) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": "60" } },
      ),
    }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  const discordId = getDiscordIdFromUser(user)
  const superAdminDiscordId = process.env.SUPER_ADMIN_DISCORD_ID || DEFAULT_SUPER_ADMIN_DISCORD_ID

  if (discordId !== superAdminDiscordId) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  return { ok: true as const }
}

async function readJson(request: NextRequest) {
  return request.json().catch(() => null)
}

export async function GET(request: NextRequest) {
  const auth = await requireSuperAdmin(request)
  if (!auth.ok) {
    return auth.response
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("authorized_users")
    .select("discord_id, username, status, phase, created_at, updated_at")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: "Falha ao carregar allowlist" }, { status: 500 })
  }

  return NextResponse.json({ users: data })
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperAdmin(request)
  if (!auth.ok) {
    return auth.response
  }

  const parsed = parseAdminCreatePayload(await readJson(request))
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("authorized_users")
    .upsert(parsed.value, { onConflict: "discord_id" })
    .select("discord_id, username, status, phase, created_at, updated_at")
    .single()

  if (error) {
    return NextResponse.json({ error: "Falha ao salvar usuário" }, { status: 500 })
  }

  revalidatePath("/admin")
  return NextResponse.json({ user: data }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireSuperAdmin(request)
  if (!auth.ok) {
    return auth.response
  }

  const parsed = parseAdminUpdatePayload(await readJson(request))
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const { discord_id, ...changes } = parsed.value
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("authorized_users")
    .update(changes)
    .eq("discord_id", discord_id)
    .select("discord_id, username, status, phase, created_at, updated_at")
    .single()

  if (error) {
    return NextResponse.json({ error: "Falha ao atualizar usuário" }, { status: 500 })
  }

  revalidatePath("/admin")
  return NextResponse.json({ user: data })
}

export async function DELETE(request: NextRequest) {
  const auth = await requireSuperAdmin(request)
  if (!auth.ok) {
    return auth.response
  }

  const parsed = parseAdminDeletePayload(await readJson(request))
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from("authorized_users")
    .delete()
    .eq("discord_id", parsed.value.discord_id)

  if (error) {
    return NextResponse.json({ error: "Falha ao remover usuário" }, { status: 500 })
  }

  revalidatePath("/admin")
  return NextResponse.json({ ok: true })
}
