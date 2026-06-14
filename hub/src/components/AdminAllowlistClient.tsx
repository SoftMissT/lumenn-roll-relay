"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import type { AuthorizedUserRecord } from "@/lib/hub-auth"

export type AuthorizedUserRow = AuthorizedUserRecord & {
  discord_id: string
  username: string | null
  created_at: string
  updated_at: string
}

function StatusBadge({ status }: { status: AuthorizedUserRow["status"] }) {
  const colors = {
    approved: "border-[#2EFF7A]/30 bg-[#2EFF7A]/10 text-[#2EFF7A]",
    pending: "border-[#C8A84B]/30 bg-[#C8A84B]/10 text-[#FFD27A]",
    revoked: "border-[#D01452]/30 bg-[#D01452]/10 text-[#ff6b8a]",
  }

  return (
    <span className={`rounded-full border px-3 py-1 font-mono-hud text-[10px] uppercase tracking-[0.16em] ${colors[status]}`}>
      {status}
    </span>
  )
}

async function callAdminApi(method: "POST" | "PATCH" | "DELETE", body: Record<string, string>) {
  const response = await fetch("/api/admin", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(payload?.error || "Falha ao atualizar allowlist")
  }
}

export default function AdminAllowlistClient({
  initialUsers,
}: {
  initialUsers: AuthorizedUserRow[]
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function mutate(method: "POST" | "PATCH" | "DELETE", body: Record<string, string>) {
    setError(null)

    try {
      await callAdminApi(method, body)
      startTransition(() => router.refresh())
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "Falha ao atualizar allowlist")
    }
  }

  async function onCreate(formData: FormData) {
    await mutate("POST", {
      discord_id: String(formData.get("discord_id") || ""),
      username: String(formData.get("username") || ""),
      status: String(formData.get("status") || "pending"),
      phase: String(formData.get("phase") || "alpha"),
    })
  }

  return (
    <div className="space-y-6">
      <form
        action={onCreate}
        className="glass-panel grid gap-4 p-5 md:grid-cols-[1.4fr_1fr_150px_130px_auto]"
      >
        <input
          name="discord_id"
          placeholder="Discord ID"
          className="rounded border border-[rgba(0,212,245,0.18)] bg-black/30 px-3 py-3 font-mono-hud text-sm text-white outline-none"
          required
        />
        <input
          name="username"
          placeholder="Username"
          className="rounded border border-[rgba(0,212,245,0.18)] bg-black/30 px-3 py-3 text-sm text-white outline-none"
        />
        <select
          name="status"
          defaultValue="pending"
          className="rounded border border-[rgba(0,212,245,0.18)] bg-black px-3 py-3 text-sm text-white outline-none"
        >
          <option value="pending">pending</option>
          <option value="approved">approved</option>
          <option value="revoked">revoked</option>
        </select>
        <select
          name="phase"
          defaultValue="alpha"
          className="rounded border border-[rgba(0,212,245,0.18)] bg-black px-3 py-3 text-sm text-white outline-none"
        >
          <option value="alpha">alpha</option>
          <option value="beta">beta</option>
        </select>
        <button type="submit" className="btn-crimson" disabled={isPending}>
          Adicionar
        </button>
      </form>

      {error && (
        <div className="glass-panel border-[#D01452]/40 p-4 text-[#ff9ab0]">
          {error}
        </div>
      )}

      <section className="glass-panel overflow-hidden">
        <div className="grid grid-cols-[1.3fr_1fr_120px_90px_300px] gap-4 border-b border-[rgba(0,212,245,0.12)] px-5 py-4 font-mono-hud text-[10px] uppercase tracking-[0.16em] text-[#4A6880]">
          <span>Discord ID</span>
          <span>Username</span>
          <span>Status</span>
          <span>Fase</span>
          <span>Ações</span>
        </div>

        {initialUsers.length === 0 ? (
          <div className="px-5 py-10 text-[#8BA8C4]">
            Nenhum usuário cadastrado em `authorized_users`.
          </div>
        ) : (
          <div className="divide-y divide-[rgba(0,212,245,0.08)]">
            {initialUsers.map((authorizedUser) => (
              <div
                key={authorizedUser.discord_id}
                className="grid grid-cols-[1.3fr_1fr_120px_90px_300px] items-center gap-4 px-5 py-4 text-[15px]"
              >
                <span className="font-mono-hud text-[#EEF2FF]">{authorizedUser.discord_id}</span>
                <span className="text-[#8BA8C4]">{authorizedUser.username || "-"}</span>
                <StatusBadge status={authorizedUser.status} />
                <span className="font-mono-hud text-[#00D4F5]">{authorizedUser.phase}</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-glass px-3 py-2 text-xs"
                    disabled={isPending}
                    onClick={() => mutate("PATCH", { discord_id: authorizedUser.discord_id, status: "approved" })}
                  >
                    Aprovar
                  </button>
                  <button
                    type="button"
                    className="btn-glass px-3 py-2 text-xs"
                    disabled={isPending}
                    onClick={() => mutate("PATCH", { discord_id: authorizedUser.discord_id, status: "revoked" })}
                  >
                    Revogar
                  </button>
                  <button
                    type="button"
                    className="btn-glass px-3 py-2 text-xs"
                    disabled={isPending}
                    onClick={() =>
                      mutate("PATCH", {
                        discord_id: authorizedUser.discord_id,
                        phase: authorizedUser.phase === "alpha" ? "beta" : "alpha",
                      })
                    }
                  >
                    {authorizedUser.phase === "alpha" ? "Beta" : "Alpha"}
                  </button>
                  <button
                    type="button"
                    className="btn-glass px-3 py-2 text-xs text-[#ff9ab0]"
                    disabled={isPending}
                    onClick={() => mutate("DELETE", { discord_id: authorizedUser.discord_id })}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
