import { createClient } from '@/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const PROD_ORIGIN = 'https://bayt-al-hikmah-nine.vercel.app'

// POST: Mark course as complete
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.redirect(`${PROD_ORIGIN}/sign-in?redirect_url=${PROD_ORIGIN}/course/${params.slug}/`)
  }

  const supabase = createClient()
  const slug = params.slug

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!course) {
    return NextResponse.redirect(`${PROD_ORIGIN}/courses/?error=not-found`)
  }

  const { data, error } = await supabase
    .from('course_enrollments')
    .update({ status: 'completed' })
    .eq('user_id', userId)
    .eq('course_id', course.id)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}