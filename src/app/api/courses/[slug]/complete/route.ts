import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// POST: Mark course as complete
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

  // Update enrollment status
  const { data, error } = await supabase
    .from('course_enrollments')
    .update({ status: 'completed' })
    .eq('user_id', session.user.id)
    .eq('course_id', course.id)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
