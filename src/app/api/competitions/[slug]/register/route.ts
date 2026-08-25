import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

const PROD_ORIGIN = 'https://bayt-al-hikmah-nine.vercel.app'

// POST: Register for a competition
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = createClient()
  const slug = params.slug

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.redirect(`${PROD_ORIGIN}/login/?next=/competitions/${slug}/`)
  }

  // Find competition
  const { data: competition } = await supabase
    .from('competitions')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!competition) {
    return NextResponse.redirect(`${PROD_ORIGIN}/competitions/?error=not-found`)
  }

  // Check if already registered
  const { data: existing } = await supabase
    .from('competition_registrations')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('competition_id', competition.id)
    .single()

  if (existing) {
    return NextResponse.redirect(`${PROD_ORIGIN}/competitions/${slug}/?registered=1`)
  }

  // Create registration (payment pending)
  const { error } = await supabase
    .from('competition_registrations')
    .insert({
      user_id: session.user.id,
      competition_id: competition.id,
      payment_status: 'pending',
    })

  if (error) {
    return NextResponse.redirect(`${PROD_ORIGIN}/competitions/${slug}/?error=registration-failed`)
  }

  // Redirect back to competition page with success
  return NextResponse.redirect(`${PROD_ORIGIN}/competitions/${slug}/?registered=1`)
}