import { createClient } from '@/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const PROD_ORIGIN = 'https://bayt-al-hikmah-nine.vercel.app'

// POST: Enroll in a course
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { userId } = await auth()
  const slug = params.slug

  if (!userId) {
    return NextResponse.redirect(`${PROD_ORIGIN}/sign-in?redirect_url=${PROD_ORIGIN}/course/${slug}/`)
  }

  const supabase = createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!course) {
    return NextResponse.redirect(`${PROD_ORIGIN}/courses/?error=not-found`)
  }

  const { data: existing } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', course.id)
    .single()

  if (existing) {
    return NextResponse.redirect(`${PROD_ORIGIN}/course/${slug}/?enrolled=1`)
  }

  const { error } = await supabase
    .from('course_enrollments')
    .insert({
      user_id: userId,
      course_id: course.id,
      status: 'active',
    })

  if (error) {
    return NextResponse.redirect(`${PROD_ORIGIN}/course/${slug}/?error=enrollment-failed`)
  }

  return NextResponse.redirect(`${PROD_ORIGIN}/course/${slug}/?enrolled=1`)
}
