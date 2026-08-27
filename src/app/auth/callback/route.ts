import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/'

  const PROD_ORIGIN = 'https://bayt-al-hikmah-nine.vercel.app'

  const cookieStore = cookies()

  // Create the Supabase server client with full cookie access
  // This is critical for PKCE: the code_verifier is stored in a cookie
  // by the browser client, and we need to read it here
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Get ALL cookies — the PKCE code_verifier is one of them
          return cookieStore.getAll().map(c => ({ name: c.name, value: c.value }))
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set({ name, value, ...options })
            })
          } catch {
            // Can be ignored if called from a Server Component
          }
        },
      },
    }
  )

  // If no code, check if already logged in
  if (!code) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      return NextResponse.redirect(`${PROD_ORIGIN}${next}`)
    }
    return NextResponse.redirect(`${PROD_ORIGIN}/auth/auth-code-error/`)
  }

  // Exchange the code for a session
  // This requires the PKCE code_verifier cookie to be present
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('OAuth exchange error:', error.message)
    // Check if we already have a valid session despite the error
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      return NextResponse.redirect(`${PROD_ORIGIN}${next}`)
    }
    return NextResponse.redirect(`${PROD_ORIGIN}/auth/auth-code-error/`)
  }

  // Success — redirect to the next URL
  return NextResponse.redirect(`${PROD_ORIGIN}${next}`)
}