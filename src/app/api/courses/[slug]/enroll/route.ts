import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

const PROD_ORIGIN = 'https://bayt-al-hikmah-nine.vercel.app'

// POST: Enroll in a course
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = createClient()
  const slug = params.slug

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    // Redirect to login with next param so user returns to the course page
    return NextResponse.redirect(`${PROD_ORIGIN}/auth/?next=/course/${slug}/`)
  }

  // Find course
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!course) {
    return NextResponse.redirect(`${PROD_ORIGIN}/courses/?error=not-found`)
  }

  // Check if already enrolled
  const { data: existing } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('course_id', course.id)
    .single()

  if (existing) {
    return NextResponse.redirect(`${PROD_ORIGIN}/course/${slug}/?enrolled=1`)
  }

  // Create enrollment
  const { error } = await supabase
    .from('course_enrollments')
    .insert({
      user_id: session.user.id,
      course_id: course.id,
      status: 'active',
    })

  if (error) {
    return NextResponse.redirect(`${PROD_ORIGIN}/course/${slug}/?error=enrollment-failed`)
  }

  // Redirect back to course page with success
  return NextResponse.redirect(`${PROD_ORIGIN}/course/${slug}/?enrolled=1`)
}