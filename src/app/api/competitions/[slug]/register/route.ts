import { createClient } from '@/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const PROD_ORIGIN = 'https://bayt-al-hikmah-nine.vercel.app'

// POST: Register for a competition
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.redirect(`${PROD_ORIGIN}/sign-in?redirect_url=${PROD_ORIGIN}/competitions/${params.slug}/`)
  }

  const supabase = createClient()
  const slug = params.slug

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
    .eq('user_id', userId)
    .eq('competition_id', competition.id)
    .single()

  if (existing) {
    return NextResponse.redirect(`${PROD_ORIGIN}/competitions/${slug}/?registered=1`)
  }

  // Create registration (payment pending)
  const { error } = await supabase
    .from('competition_registrations')
    .insert({
      user_id: userId,
      competition_id: competition.id,
      payment_status: 'pending',
    })

  if (error) {
    return NextResponse.redirect(`${PROD_ORIGIN}/competitions/${slug}/?error=registration-failed`)
  }

  return NextResponse.redirect(`${PROD_ORIGIN}/competitions/${slug}/?registered=1`)
}