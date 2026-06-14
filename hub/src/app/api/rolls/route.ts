import { createSupabaseAdminClient } from "@/lib/supabase-admin"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { evaluateHubAuthorization, getDiscordIdFromUser } from "@/lib/hub-auth"
import { SUPER_ADMIN_DISCORD_ID } from "@/lib/hub-auth"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const discordId = getDiscordIdFromUser(user)
  if (!discordId) {
    return NextResponse.json({ error: "Discord ID not found" }, { status: 403 })
  }

  const url = new URL(request.url)
  const worldId = url.searchParams.get("world_id")
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 100)
  const offset = parseInt(url.searchParams.get("offset") || "0", 10)

  const adminClient = createSupabaseAdminClient()

  const { data: ownRecord } = await adminClient
    .from("authorized_users")
    .select("status, phase")
    .eq("discord_id", discordId)
    .maybeSingle()

  const decision = evaluateHubAuthorization({
    discordId,
    superAdminDiscordId: SUPER_ADMIN_DISCORD_ID,
    record: ownRecord,
  })

  if (!decision.authorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (worldId) {
    const { data: rolls, error } = await adminClient
      .from("rolls")
      .select("id, formula, result, is_critical, is_fumble, roll_type, created_at, players(display_name, foundry_user_id)")
      .eq("world_id", worldId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ rolls })
  }

  const { data: worlds } = await adminClient
    .from("worlds")
    .select("id, foundry_world_name, discord_guild_id, created_at")

  if (!worlds?.length) {
    return NextResponse.json({ worlds: [], rolls: [] })
  }

  if (discordId === SUPER_ADMIN_DISCORD_ID) {
    const { data: allRolls } = await adminClient
      .from("rolls")
      .select("id, world_id, formula, result, is_critical, is_fumble, roll_type, created_at, players(display_name)")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    return NextResponse.json({ worlds, rolls: allRolls ?? [] })
  }

  const { data: playerWorlds } = await adminClient
    .from("players")
    .select("world_id")
    .eq("discord_id", discordId)

  const playerWorldIds = playerWorlds?.map((p) => p.world_id) ?? []
  const visibleWorlds = worlds.filter((w) => playerWorldIds.includes(w.id))

  if (!visibleWorlds.length) {
    return NextResponse.json({ worlds: [], rolls: [] })
  }

  const { data: allRolls } = await adminClient
    .from("rolls")
    .select("id, world_id, formula, result, is_critical, is_fumble, roll_type, created_at, players(display_name)")
    .in("world_id", visibleWorlds.map((w) => w.id))
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  return NextResponse.json({ worlds: visibleWorlds, rolls: allRolls ?? [] })
}