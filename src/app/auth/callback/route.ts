import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // Hardcode production origin — don't trust request.url (may be localhost)
  const PROD_ORIGIN = 'https://bayt-al-hikmah-nine.vercel.app'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${PROD_ORIGIN}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${PROD_ORIGIN}/auth/auth-code-error/`)
}
