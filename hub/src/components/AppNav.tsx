import Link from "next/link"

import { SUPER_ADMIN_DISCORD_ID, getDiscordIdFromUser } from "@/lib/hub-auth"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const navLinkClass =
  "text-[13px] font-medium tracking-wide text-[#8BA8C4] transition-colors duration-200 hover:text-[#00D4F5]"

export default async function AppNav() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const discordId = user ? getDiscordIdFromUser(user) : null
  const isSuperAdmin = !!discordId && discordId === SUPER_ADMIN_DISCORD_ID

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(0,212,245,0.08)] bg-[rgba(10,10,10,0.92)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative h-8 w-8">
            <div
              className="absolute inset-0 rounded-full transition-transform duration-300 group-hover:scale-110"
              style={{ background: "linear-gradient(135deg, #00D4F5 0%, #D01452 100%)" }}
            />
            <svg className="relative h-8 w-8 p-1.5" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L22 12L12 22L2 12Z" stroke="white" strokeWidth="1.5" fill="none" />
              <line x1="12" y1="2" x2="12" y2="22" stroke="white" strokeWidth="1.5" />
              <line x1="7" y1="7" x2="17" y2="17" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="leading-none">
            <span className="font-display text-lg tracking-[0.15em] text-white">LUMENN</span>
            <span className="font-mono-hud -mt-0.5 block text-[9px] tracking-[0.2em] text-[#4A6880]">
              RELAY
            </span>
          </div>
        </Link>

        {/* Links + ação */}
        <nav className="flex items-center gap-5 md:gap-8">
          <Link href="/dashboard" className={navLinkClass}>
            Dashboard
          </Link>
          {isSuperAdmin && (
            <Link href="/admin" className={navLinkClass}>
              Admin
            </Link>
          )}
          <Link href="/terms" className={`${navLinkClass} hidden sm:inline`}>
            Termos
          </Link>
          <Link href="/privacy" className={`${navLinkClass} hidden sm:inline`}>
            Privacidade
          </Link>
          {user && (
            <form action="/auth/sign-out" method="post">
              <button type="submit" className="btn-glass px-5 py-2 text-sm">
                Sair
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  )
}
