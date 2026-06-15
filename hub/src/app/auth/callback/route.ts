import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

// Whitelist de destinos pós-login. Evita open-redirect e garante que apenas
// rotas internas conhecidas sejam alvo do redirect após o round-trip OAuth.
const ALLOWED_NEXT = new Set(["/dashboard", "/admin", "/"])

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const nextParam = requestUrl.searchParams.get("next")
  // Default para /dashboard (rota padrão pós-login para QUALQUER usuário,
  // inclusive super-admin). /admin só é alvo se vier explicitamente em `next`.
  const next = nextParam && ALLOWED_NEXT.has(nextParam) ? nextParam : "/dashboard"

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL("/?auth=error", requestUrl.origin))
}
