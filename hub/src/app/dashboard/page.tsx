import { redirect } from "next/navigation"

import {
  SUPER_ADMIN_DISCORD_ID,
  evaluateHubAuthorization,
  getDiscordIdFromUser,
  type AuthorizedUserRecord,
} from "@/lib/hub-auth"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import DashboardClient from "@/components/DashboardClient"

export const dynamic = "force-dynamic"

type PlayerRow = {
  id: string
  display_name: string
  foundry_user_id: string
  discord_id: string | null
}

type RollRow = {
  id: string
  world_id: string
  formula: string
  result: number
  is_critical: boolean
  is_fumble: boolean
  roll_type: string | null
  created_at: string
  players: { display_name: string; foundry_user_id: string } | null
}

type WorldRow = {
  id: string
  foundry_world_name: string
  discord_guild_id: string | null
  created_at: string
}

type LeaderboardEntry = {
  playerId: string
  displayName: string
  criticals: number
  fumbles: number
  totalRolls: number
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/")

  const discordId = getDiscordIdFromUser(user)
  if (!discordId) redirect("/")

  const adminClient = createSupabaseAdminClient()

  const { data: ownRecord } = await adminClient
    .from("authorized_users")
    .select("status, phase")
    .eq("discord_id", discordId)
    .maybeSingle<Pick<AuthorizedUserRecord, "status" | "phase">>()

  const decision = evaluateHubAuthorization({
    discordId,
    superAdminDiscordId: SUPER_ADMIN_DISCORD_ID,
    record: ownRecord,
  })

  if (!decision.authorized) redirect("/")

  const isSuperAdmin = discordId === SUPER_ADMIN_DISCORD_ID

  const { data: worlds } = await adminClient
    .from("worlds")
    .select("id, foundry_world_name, discord_guild_id, created_at")
    .returns<WorldRow[]>()

  const visibleWorlds = isSuperAdmin
    ? (worlds ?? [])
    : await getVisibleWorlds(adminClient, discordId, worlds ?? [])

  const worldIds = visibleWorlds.map((w) => w.id)

  let players: PlayerRow[] = []
  let rolls: RollRow[] = []
  let leaderboard: LeaderboardEntry[] = []

  if (worldIds.length > 0) {
    const { data: playerData } = await adminClient
      .from("players")
      .select("id, display_name, foundry_user_id, discord_id")
      .in("world_id", worldIds)
      .returns<PlayerRow[]>()
    players = playerData ?? []

    const { data: rollData } = await adminClient
      .from("rolls")
      .select("id, world_id, formula, result, is_critical, is_fumble, roll_type, created_at, players(display_name, foundry_user_id)")
      .in("world_id", worldIds)
      .order("created_at", { ascending: false })
      .limit(100)
      .returns<RollRow[]>()
    rolls = rollData ?? []

    leaderboard = buildLeaderboard(players, rolls)
  }

  return (
    <DashboardClient
      worlds={visibleWorlds}
      rolls={rolls}
      leaderboard={leaderboard}
      isSuperAdmin={isSuperAdmin}
      discordId={discordId}
    />
  )
}

async function getVisibleWorlds(
  adminClient: ReturnType<typeof createSupabaseAdminClient>,
  discordId: string,
  allWorlds: WorldRow[],
): Promise<WorldRow[]> {
  const { data: playerWorlds } = await adminClient
    .from("players")
    .select("world_id")
    .eq("discord_id", discordId)

  const playerWorldIds = new Set(playerWorlds?.map((p) => p.world_id) ?? [])
  return allWorlds.filter((w) => playerWorldIds.has(w.id))
}

function buildLeaderboard(players: PlayerRow[], rolls: RollRow[]): LeaderboardEntry[] {
  const stats = new Map<string, { criticals: number; fumbles: number; totalRolls: number }>()

  for (const roll of rolls) {
    const pId = roll.players?.foundry_user_id ?? "unknown"
    if (!stats.has(pId)) stats.set(pId, { criticals: 0, fumbles: 0, totalRolls: 0 })
    const s = stats.get(pId)!
    s.totalRolls++
    if (roll.is_critical) s.criticals++
    if (roll.is_fumble) s.fumbles++
  }

  return Array.from(stats.entries())
    .map(([id, s]) => {
      const p = players.find((pl) => pl.foundry_user_id === id)
      return { playerId: id, displayName: p?.display_name ?? "Desconhecido", ...s }
    })
    .sort((a, b) => b.criticals - a.criticals || b.totalRolls - a.totalRolls)
    .slice(0, 20)
}
