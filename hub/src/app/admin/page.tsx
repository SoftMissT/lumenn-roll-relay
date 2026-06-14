import Link from "next/link"
import { redirect } from "next/navigation"

import {
  DEFAULT_SUPER_ADMIN_DISCORD_ID,
  evaluateHubAuthorization,
  getDiscordIdFromUser,
  type AuthorizedUserRecord,
} from "@/lib/hub-auth"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import AdminAllowlistClient, {
  type AuthorizedUserRow,
} from "@/components/AdminAllowlistClient"

export const dynamic = "force-dynamic"

function AccessMessage({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-[#0A0A0A] px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl glass-panel p-8">
        <p className="mb-3 font-mono-hud text-[11px] uppercase tracking-[0.2em] text-[#00D4F5]">
          Lumenn Relay
        </p>
        <h1 className="mb-4 font-display text-[44px] leading-none">{title}</h1>
        <div className="text-[16px] leading-relaxed text-[#8BA8C4]">{children}</div>
        <div className="mt-8 flex gap-3">
          <Link href="/" className="btn-glass">
            Voltar
          </Link>
          <form action="/auth/sign-out" method="post">
            <button type="submit" className="btn-crimson">
              Sair
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  const discordId = getDiscordIdFromUser(user)

  if (!discordId) {
    return (
      <AccessMessage title="Discord não identificado">
        Sua sessão existe, mas o Hub não encontrou um Discord ID confiável no provedor OAuth.
      </AccessMessage>
    )
  }

  const superAdminDiscordId = process.env.SUPER_ADMIN_DISCORD_ID || DEFAULT_SUPER_ADMIN_DISCORD_ID
  const adminClient = createSupabaseAdminClient()

  const { data: ownRecord } = await adminClient
    .from("authorized_users")
    .select("status, phase")
    .eq("discord_id", discordId)
    .maybeSingle<Pick<AuthorizedUserRecord, "status" | "phase">>()

  const decision = evaluateHubAuthorization({
    discordId,
    superAdminDiscordId,
    record: ownRecord,
  })

  if (!decision.authorized) {
    return (
      <AccessMessage title="Acesso pendente">
        Seu Discord ID <span className="font-mono-hud text-[#EEF2FF]">{discordId}</span> ainda não está aprovado na allowlist.
      </AccessMessage>
    )
  }

  if (discordId !== superAdminDiscordId) {
    return (
      <AccessMessage title="Autorizado">
        Sua conta está liberada para a fase {decision.phase}, mas o painel administrativo ainda é restrito ao super-admin.
      </AccessMessage>
    )
  }

  const { data: users, error } = await adminClient
    .from("authorized_users")
    .select("discord_id, username, status, phase, created_at, updated_at")
    .order("created_at", { ascending: false })
    .returns<AuthorizedUserRow[]>()

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-6 border-b border-[rgba(0,212,245,0.12)] pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 font-mono-hud text-[11px] uppercase tracking-[0.24em] text-[#00D4F5]">
              Painel Alfa
            </p>
            <h1 className="font-display text-[56px] leading-none md:text-[72px]">
              Allowlist
            </h1>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-[#8BA8C4]">
              Visão inicial dos usuários autorizados. Ações de aprovar, revogar e mudar fase entram na próxima rota BFF `/api/admin`.
            </p>
          </div>

          <form action="/auth/sign-out" method="post">
            <button type="submit" className="btn-glass">
              Sair
            </button>
          </form>
        </header>

        {error ? (
          <div className="glass-panel border-[#D01452]/40 p-6 text-[#ff9ab0]">
            Falha ao carregar allowlist.
          </div>
        ) : (
          <AdminAllowlistClient initialUsers={users ?? []} />
        )}
      </div>
    </main>
  )
}
