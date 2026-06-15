"use client"

import { createSupabaseBrowserClient } from "@/lib/supabase"

// Destinos significativos que valem preservar através do round-trip OAuth.
// Qualquer outra origem (landing, termos, etc.) cai no default /dashboard.
const MEANINGFUL_NEXT = new Set(["/dashboard", "/admin"])

export default function DiscordLoginButton({
  children = "Login com Discord",
  className = "btn-glass text-lg py-4 px-10",
  next,
}: {
  children?: React.ReactNode
  className?: string
  next?: string
}) {
  async function signInWithDiscord() {
    const supabase = createSupabaseBrowserClient()
    const origin = window.location.origin

    // Captura a página de origem para retornar a ela após o login. Supabase
    // preserva a query string do redirectTo no round-trip OAuth, então o
    // callback consegue ler `next` de volta.
    const candidate = next ?? window.location.pathname
    const target = MEANINGFUL_NEXT.has(candidate) ? candidate : "/dashboard"

    const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(target)}`

    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: callbackUrl,
        scopes: "identify",
      },
    })
  }

  return (
    <button type="button" className={className} onClick={signInWithDiscord}>
      {children}
    </button>
  )
}
