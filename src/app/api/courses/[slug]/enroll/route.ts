import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// POST: Enroll in a course
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

  // Find course
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  // Check if already enrolled
  const { data: existing } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('course_id', course.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Already enrolled' }, { status: 400 })
  }

  // Create enrollment
  const { data, error } = await supabase
    .from('course_enrollments')
    .insert({
      user_id: session.user.id,
      course_id: course.id,
      status: 'active',
    })
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Redirect back to course page with success
  return NextResponse.redirect(`https://bayt-al-hikmah-nine.vercel.app/course/${slug}/?enrolled=1`)
}
