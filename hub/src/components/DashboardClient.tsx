'use client'

import { useState } from 'react'
import Link from 'next/link'

type WorldRow = { id: string; foundry_world_name: string; discord_guild_id: string | null; created_at: string }
type RollRow = { id: string; world_id: string; formula: string; result: number; is_critical: boolean; is_fumble: boolean; roll_type: string | null; created_at: string; players: { display_name: string; foundry_user_id: string } | null }
type LeaderboardEntry = { playerId: string; displayName: string; criticals: number; fumbles: number; totalRolls: number }

export default function DashboardClient({
  worlds,
  rolls,
  leaderboard,
  isSuperAdmin,
  discordId,
}: {
  worlds: WorldRow[]
  rolls: RollRow[]
  leaderboard: LeaderboardEntry[]
  isSuperAdmin: boolean
  discordId: string
}) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'rolls'>('leaderboard')
  const [selectedWorld, setSelectedWorld] = useState<string>('all')

  const worldMap = new Map(worlds.map((w) => [w.id, w.foundry_world_name]))
  const filteredRolls = selectedWorld === 'all' ? rolls : rolls.filter((r) => r.world_id === selectedWorld)
  const filteredLeaderboard = selectedWorld === 'all'
    ? leaderboard
    : buildFilteredLeaderboard(rolls.filter((r) => r.world_id === selectedWorld))

  const totalCriticals = rolls.filter((r) => r.is_critical).length
  const totalFumbles = rolls.filter((r) => r.is_fumble).length

  return (
    <main className="min-h-screen bg-[var(--canvas-base)] relative">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(208,20,82,0.04) 0%, transparent 70%)', filter: 'blur(100px)' }}
        />
        <div
          className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,212,245,0.03) 0%, transparent 70%)', filter: 'blur(80px)' }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-[var(--border-panel)] px-6 py-6 md:px-8">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="mb-2 font-mono-hud text-[10px] uppercase tracking-[0.25em] text-[var(--text-holo)]">
                Oráculo de Transmissão
              </p>
              <h1 className="font-display text-[48px] md:text-[64px] leading-none text-[var(--text-primary)]">
                DASHBOARD
              </h1>
              <p className="mt-2 text-[15px] text-[var(--text-secondary)]">
                {isSuperAdmin ? 'Visão total · Super Admin' : `Discord: ${discordId}`}
              </p>
            </div>
            <div className="flex gap-3">
              {isSuperAdmin && (
                <Link href="/admin" className="btn-glass text-sm py-2 px-4">
                  Allowlist
                </Link>
              )}
              <form action="/auth/sign-out" method="post">
                <button type="submit" className="btn-glass text-sm py-2 px-4">Sair</button>
              </form>
            </div>
          </div>
        </header>

        {/* Stats Bar */}
        <section className="px-6 md:px-8 py-6">
          <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Mundos" value={String(worlds.length)} accent="holo" />
            <StatCard label="Rolagens" value={String(rolls.length)} accent="primary" />
            <StatCard label="Críticos" value={String(totalCriticals)} accent="gold" />
            <StatCard label="Fumbles" value={String(totalFumbles)} accent="critical" />
          </div>
        </section>

        {/* World Selector */}
        {worlds.length > 1 && (
          <section className="px-6 md:px-8 pb-4">
            <div className="mx-auto max-w-7xl flex items-center gap-3 flex-wrap">
              <span className="font-mono-hud text-[10px] uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
                Mundo
              </span>
              <WorldPill active={selectedWorld === 'all'} onClick={() => setSelectedWorld('all')}>
                Todos
              </WorldPill>
              {worlds.map((w) => (
                <WorldPill key={w.id} active={selectedWorld === w.id} onClick={() => setSelectedWorld(w.id)}>
                  {w.foundry_world_name}
                </WorldPill>
              ))}
            </div>
          </section>
        )}

        {/* Tabs */}
        <section className="px-6 md:px-8 pb-2">
          <div className="mx-auto max-w-7xl flex gap-1 border-b border-[var(--border-panel)]">
            <TabButton active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')}>
              Leaderboard
            </TabButton>
            <TabButton active={activeTab === 'rolls'} onClick={() => setActiveTab('rolls')}>
              Rolagens Recentes
            </TabButton>
          </div>
        </section>

        {/* Content */}
        <section className="px-6 md:px-8 py-6">
          <div className="mx-auto max-w-7xl">
            {activeTab === 'leaderboard' && (
              <LeaderboardPanel entries={filteredLeaderboard} empty={leaderboard.length === 0} />
            )}
            {activeTab === 'rolls' && (
              <RollsPanel rolls={filteredRolls} worldMap={worldMap} empty={filteredRolls.length === 0} />
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: 'holo' | 'primary' | 'gold' | 'critical' }) {
  const colorMap = {
    holo: 'var(--accent-holo)',
    primary: 'var(--accent-primary)',
    gold: 'var(--accent-gold)',
    critical: '#FF2B4A',
  }
  const glowMap = {
    holo: 'var(--accent-holo-glow)',
    primary: 'var(--accent-primary-glow)',
    gold: 'var(--accent-gold-glow)',
    critical: 'rgba(255,43,74,0.25)',
  }

  return (
    <div className="glass-panel p-5 relative overflow-hidden group">
      <div
        className="absolute top-0 left-0 w-full h-[2px] opacity-60"
        style={{ background: colorMap[accent] }}
      />
      <p className="font-mono-hud text-[10px] uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-2">
        {label}
      </p>
      <p
        className="font-display text-[36px] leading-none"
        style={{ color: colorMap[accent] }}
      >
        {value}
      </p>
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `inset 0 0 40px ${glowMap[accent]}` }}
      />
    </div>
  )
}

function WorldPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="font-mono-hud text-[11px] tracking-[0.1em] px-3 py-1 rounded-full transition-all duration-200 cursor-pointer"
      style={{
        background: active ? 'var(--accent-primary-muted)' : 'transparent',
        border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
        color: active ? 'var(--accent-primary-hover)' : 'var(--text-secondary)',
      }}
    >
      {children}
    </button>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-3 text-[14px] font-medium transition-all duration-200 cursor-pointer relative"
      style={{
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
      }}
    >
      {children}
      {active && (
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ background: 'var(--accent-primary)' }}
        />
      )}
    </button>
  )
}

function LeaderboardPanel({ entries, empty }: { entries: LeaderboardEntry[]; empty: boolean }) {
  if (empty) {
    return (
      <div className="glass-panel p-12 text-center">
        <p className="font-mono-hud text-[10px] tracking-[0.2em] text-[var(--text-tertiary)] uppercase mb-3">
          Leaderboard vazio
        </p>
        <p className="text-[15px] text-[var(--text-secondary)]">
          Nenhuma rolagem registrada ainda. As rolagens aparecerão aqui quando o módulo Foundry começar a transmitir.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, i) => {
        const rank = i + 1
        const isTop3 = rank <= 3
        const medalEmojis = ['🥇', '🥈', '🥉']

        return (
          <div
            key={entry.playerId}
            className="glass-panel glass-panel-hover p-4 flex items-center gap-4"
            style={{
              animation: `fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s both`,
            }}
          >
            {/* Rank */}
            <div
              className="flex-shrink-0 w-10 text-center font-display text-[24px]"
              style={{ color: isTop3 ? 'var(--accent-gold)' : 'var(--text-tertiary)' }}
            >
              {isTop3 ? medalEmojis[i] : `${rank}.`}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className="font-display text-[18px] text-[var(--text-primary)] truncate">
                {entry.displayName}
              </p>
              <p className="font-mono-hud text-[10px] text-[var(--text-tertiary)] tracking-[0.15em]">
                {entry.totalRolls} ROLAGENS
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="font-mono-hud text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.15em]">
                  Crit
                </p>
                <p className="font-display text-[20px] text-[var(--accent-gold)]">
                  {entry.criticals}
                </p>
              </div>
              <div className="text-center">
                <p className="font-mono-hud text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.15em]">
                  Fumble
                </p>
                <p className="font-display text-[20px] text-[#FF2B4A]">
                  {entry.fumbles}
                </p>
              </div>
            </div>

            {/* Crit bar */}
            <div className="hidden md:block w-24 h-2 rounded-full bg-[var(--canvas-deep)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((entry.criticals / Math.max(entry.totalRolls, 1)) * 100, 100)}%`,
                  background: 'linear-gradient(90deg, var(--accent-gold), var(--accent-primary))',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RollsPanel({ rolls, worldMap, empty }: { rolls: RollRow[]; worldMap: Map<string, string>; empty: boolean }) {
  if (empty) {
    return (
      <div className="glass-panel p-12 text-center">
        <p className="font-mono-hud text-[10px] tracking-[0.2em] text-[var(--text-tertiary)] uppercase mb-3">
          Sem rolagens
        </p>
        <p className="text-[15px] text-[var(--text-secondary)]">
          Nenhuma rolagem registrada ainda.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {rolls.map((roll, i) => {
        const worldName = worldMap.get(roll.world_id) ?? 'Desconhecido'
        const playerName = roll.players?.display_name ?? 'Desconhecido'
        const timeAgo = formatTimeAgo(roll.created_at)

        return (
          <div
            key={roll.id}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-150 hover:bg-[var(--glass-bg)]"
            style={{
              animation: `fade-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.03}s both`,
              borderLeft: roll.is_critical
                ? '3px solid var(--accent-gold)'
                : roll.is_fumble
                  ? '3px solid #FF2B4A'
                  : '3px solid transparent',
            }}
          >
            {/* Player */}
            <div className="w-32 flex-shrink-0">
              <p className="text-[14px] text-[var(--text-primary)] truncate">{playerName}</p>
            </div>

            {/* Formula */}
            <div className="w-28 flex-shrink-0">
              <code className="font-mono-hud text-[12px] text-[var(--accent-holo-text)]">
                {roll.formula}
              </code>
            </div>

            {/* Result */}
            <div className="w-14 flex-shrink-0 text-center">
              <span
                className="font-display text-[22px]"
                style={{
                  color: roll.is_critical
                    ? 'var(--accent-gold-bright)'
                    : roll.is_fumble
                      ? '#FF2B4A'
                      : 'var(--text-primary)',
                  textShadow: roll.is_critical
                    ? '0 0 20px var(--accent-gold-glow)'
                    : roll.is_fumble
                      ? '0 0 20px rgba(255,43,74,0.3)'
                      : 'none',
                }}
              >
                {roll.result}
              </span>
            </div>

            {/* Tags */}
            <div className="flex-1 flex items-center gap-2 min-w-0">
              {roll.is_critical && (
                <span className="font-mono-hud text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 rounded bg-[var(--accent-gold-glow)] text-[var(--accent-gold-bright)]">
                  CRIT
                </span>
              )}
              {roll.is_fumble && (
                <span className="font-mono-hud text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 rounded bg-[rgba(255,43,74,0.15)] text-[#FF2B4A]">
                  FUMBLE
                </span>
              )}
              {roll.roll_type && (
                <span className="font-mono-hud text-[9px] tracking-[0.1em] text-[var(--text-tertiary)]">
                  {roll.roll_type}
                </span>
              )}
            </div>

            {/* World + Time */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              <span className="font-mono-hud text-[10px] text-[var(--text-tertiary)] tracking-[0.1em]">
                {worldName}
              </span>
              <span className="font-mono-hud text-[10px] text-[var(--text-tertiary)]">
                {timeAgo}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function buildFilteredLeaderboard(rolls: RollRow[]): LeaderboardEntry[] {
  const stats = new Map<string, { displayName: string; criticals: number; fumbles: number; totalRolls: number }>()

  for (const roll of rolls) {
    const pId = roll.players?.foundry_user_id ?? 'unknown'
    const pName = roll.players?.display_name ?? 'Desconhecido'
    if (!stats.has(pId)) stats.set(pId, { displayName: pName, criticals: 0, fumbles: 0, totalRolls: 0 })
    const s = stats.get(pId)!
    s.totalRolls++
    if (roll.is_critical) s.criticals++
    if (roll.is_fumble) s.fumbles++
  }

  return Array.from(stats.entries())
    .map(([id, s]) => ({ playerId: id, displayName: s.displayName, criticals: s.criticals, fumbles: s.fumbles, totalRolls: s.totalRolls }))
    .sort((a, b) => b.criticals - a.criticals || b.totalRolls - a.totalRolls)
    .slice(0, 20)
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}
