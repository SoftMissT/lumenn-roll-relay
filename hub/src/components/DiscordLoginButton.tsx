"use client"

import { createSupabaseBrowserClient } from "@/lib/supabase"

export default function DiscordLoginButton({
  children = "Login com Discord",
  className = "btn-glass text-lg py-4 px-10",
}: {
  children?: React.ReactNode
  className?: string
}) {
  async function signInWithDiscord() {
    const supabase = createSupabaseBrowserClient()
    const origin = window.location.origin

    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${origin}/auth/callback`,
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
