import { createClient } from '@/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// POST: Verify a competition registration payment (admin only)
export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  // Parse form data (form POST from admin UI)
  const contentType = request.headers.get('content-type') || ''
  let registrationId: string

  if (contentType.includes('application/json')) {
    const body = await request.json()
    registrationId = body.registration_id
  } else {
    const formData = await request.formData()
    registrationId = formData.get('registration_id') as string
  }

  if (!registrationId) {
    return NextResponse.json({ error: 'Missing registration_id' }, { status: 400 })
  }

  // Update payment status to verified
  const { data, error } = await supabase
    .from('competition_registrations')
    .update({
      payment_status: 'verified',
      payment_verified_by: userId,
      payment_verified_at: new Date().toISOString(),
    })
    .eq('id', registrationId)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
  }

  // Redirect back to admin page (for form POSTs)
  const referer = request.headers.get('referer') || '/admin/competitions/'
  return NextResponse.redirect(referer)
}