import { createClient } from '@/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// POST: Mark a single lesson as complete
export async function POST(
  request: Request,
  { params }: { params: { slug: string; lessonId: string } }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Please log in to track your progress.' }, { status: 401 })
  }

  const supabase = createClient()
  const { slug, lessonId } = params

  // Find course
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!course) {
    return NextResponse.json({ error: 'Course not found.' }, { status: 404 })
  }

  // Verify lesson exists and belongs to this course
  const { data: lesson } = await supabase
    .from('course_lessons')
    .select('id, course_id')
    .eq('id', lessonId)
    .eq('course_id', course.id)
    .single()

  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 })
  }

  // Check if already completed
  const { data: existing } = await supabase
    .from('course_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single()

  if (existing) {
    return NextResponse.json({ alreadyCompleted: true })
  }

  // Mark lesson as complete
  const { error } = await supabase
    .from('course_progress')
    .insert({
      user_id: userId,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
    })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ alreadyCompleted: true })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Count total and completed lessons to calculate progress
  const { data: allLessons } = await supabase
    .from('course_lessons')
    .select('id')
    .eq('course_id', course.id)

  const { data: completedLessons } = await supabase
    .from('course_progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .in('lesson_id', (allLessons || []).map(l => l.id))

  const total = allLessons?.length || 0
  const completed = completedLessons?.length || 0
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  // If all lessons complete, mark enrollment as completed
  if (total > 0 && completed >= total) {
    await supabase
      .from('course_enrollments')
      .update({ status: 'completed' })
      .eq('user_id', userId)
      .eq('course_id', course.id)
  } else {
    await supabase
      .from('course_enrollments')
      .update({ status: 'active' })
      .eq('user_id', userId)
      .eq('course_id', course.id)
  }

  return NextResponse.json({
    completed: true,
    progress: {
      completed,
      total,
      percent,
    },
  })
}