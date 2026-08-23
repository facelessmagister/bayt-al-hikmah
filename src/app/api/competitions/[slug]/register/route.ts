import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// POST: Register for a competition
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = createClient()
  const slug = params.slug

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find competition
  const { data: competition } = await supabase
    .from('competitions')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!competition) {
    return NextResponse.json({ error: 'Competition not found' }, { status: 404 })
  }

  // Check if already registered
  const { data: existing } = await supabase
    .from('competition_registrations')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('competition_id', competition.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Already registered' }, { status: 400 })
  }

  // Create registration (payment pending)
  const { data, error } = await supabase
    .from('competition_registrations')
    .insert({
      user_id: session.user.id,
      competition_id: competition.id,
      payment_status: 'pending',
    })
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
