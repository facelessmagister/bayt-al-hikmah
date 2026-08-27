import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // Hardcode production origin — don't trust request.url (may be localhost)
  const PROD_ORIGIN = 'https://bayt-al-hikmah-nine.vercel.app'

  const supabase = createClient()

  // If no code, check if user already has a session (e.g., returning user)
  if (!code) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      // Already logged in, just redirect
      return NextResponse.redirect(`${PROD_ORIGIN}${next}`)
    }
    // No session and no code — error
    return NextResponse.redirect(`${PROD_ORIGIN}/auth/auth-code-error/`)
  }

  // Exchange the code for a session
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    // Check if the error is because user already has a session
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      // Already logged in — redirect to the app
      return NextResponse.redirect(`${PROD_ORIGIN}${next}`)
    }
    // Real error
    return NextResponse.redirect(`${PROD_ORIGIN}/auth/auth-code-error/`)
  }

  // Success — redirect to the next URL
  return NextResponse.redirect(`${PROD_ORIGIN}${next}`)
}