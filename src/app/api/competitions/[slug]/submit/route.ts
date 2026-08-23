import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// POST: Submit quiz answers
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

  // Verify registration and payment
  const { data: registration } = await supabase
    .from('competition_registrations')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('competition_id', competition.id)
    .single()

  if (!registration) {
    return NextResponse.json({ error: 'Not registered' }, { status: 403 })
  }

  if (registration.payment_status !== 'verified' && registration.payment_status !== 'waived') {
    return NextResponse.json({ error: 'Payment not verified' }, { status: 403 })
  }

  // Parse answers from request body
  const body = await request.json()
  const { answers, started_at, completed_at } = body

  if (!answers || !Array.isArray(answers)) {
    return NextResponse.json({ error: 'Invalid answers' }, { status: 400 })
  }

  // Load quiz to calculate score
  const fs = await import('fs')
  const path = await import('path')
  let quizData = null
  try {
    const quizPath = path.join(process.cwd(), 'content', 'competitions', slug, 'quiz.json')
    if (fs.existsSync(quizPath)) {
      quizData = JSON.parse(fs.readFileSync(quizPath, 'utf-8'))
    }
  } catch {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
  }

  // Calculate score
  let correctCount = 0
  const questions = quizData?.questions || []
  for (let i = 0; i < questions.length; i++) {
    if (answers[i] === questions[i].correct_answer) {
      correctCount++
    }
  }
  const score = Math.round((correctCount / questions.length) * 100)

  // Check if submission already exists
  const { data: existingSubmission } = await supabase
    .from('competition_submissions')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('competition_id', competition.id)
    .single()

  if (existingSubmission) {
    return NextResponse.json({ error: 'Already submitted' }, { status: 400 })
  }

  // Save submission
  const { data, error } = await supabase
    .from('competition_submissions')
    .insert({
      user_id: session.user.id,
      competition_id: competition.id,
      submission_data: {
        answers,
        started_at,
        completed_at,
        total_questions: questions.length,
        correct_count: correctCount,
      },
      score,
    })
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    submission: data,
    score,
    correct_count: correctCount,
    total_questions: questions.length,
  })
}
