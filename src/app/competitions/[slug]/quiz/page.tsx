'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'

interface QuizQuestion {
  id: number
  question: string
  options: string[]
}

interface QuizData {
  title: string
  total_questions: number
  time_limit_minutes: number
  questions: QuizQuestion[]
}

export default function QuizPage({
  params,
}: {
  params: { slug: string }
}) {
  const slug = params.slug
  const router = useRouter()
  const supabase = createClient()

  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [startedAt, setStartedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load quiz data
  useEffect(() => {
    fetch(`/competitions/${slug}/quiz.json`)
      .then((res) => res.json())
      .then((data) => {
        setQuiz(data)
        setAnswers(new Array(data.total_questions).fill(-1))
        setTimeRemaining(data.time_limit_minutes * 60)
        setStartedAt(new Date().toISOString())
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load quiz.')
        setLoading(false)
      })
  }, [slug])

  // Timer
  useEffect(() => {
    if (timeRemaining <= 0 || isSubmitting) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, isSubmitting])

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)
  }

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    const completedAt = new Date().toISOString()

    try {
      const res = await fetch(`/api/competitions/${slug}/submit/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          started_at: startedAt,
          completed_at: completedAt,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Submission failed.')
        setIsSubmitting(false)
        return
      }

      // Redirect to results
      router.push(`/competitions/${slug}/result/`)
    } catch {
      setError('Submission failed. Please try again.')
      setIsSubmitting(false)
    }
  }, [answers, startedAt, slug, router, isSubmitting])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Loading quiz...</p>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <p style={{ color: '#c45c3e' }}>{error}</p>
        </div>
      </Layout>
    )
  }

  if (!quiz) return null

  const question = quiz.questions[currentQuestion]
  const answeredCount = answers.filter((a) => a >= 0).length

  return (
    <Layout>
      <div style={{ background: '#f8f6f2', minHeight: '100vh' }}>
        {/* Top bar */}
        <div
          style={{
            background: '#0a2540',
            color: '#f8f6f2',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <span style={{ fontSize: '0.85rem' }}>{quiz.title}</span>
          <span
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: timeRemaining < 60 ? '#c45c3e' : '#f8f6f2',
            }}
          >
            ⏱ {formatTime(timeRemaining)}
          </span>
        </div>

        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem' }}>
          {/* Progress */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: '#666' }}>
                Question {currentQuestion + 1} / {quiz.total_questions}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>
                {answeredCount} answered
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                background: '#eee',
                borderRadius: '3px',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${((currentQuestion + 1) / quiz.total_questions) * 100}%`,
                  background: '#0a2540',
                  borderRadius: '3px',
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>

          {/* Question */}
          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              marginBottom: '1.5rem',
            }}
          >
            <h2
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '1.25rem',
                color: '#0a2540',
                marginBottom: '1.5rem',
                lineHeight: 1.4,
              }}
            >
              {question.question}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {question.options.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    borderRadius: '8px',
                    border: '2px solid',
                    borderColor: answers[currentQuestion] === index ? '#0a2540' : '#eee',
                    background: answers[currentQuestion] === index ? '#e3eaf2' : '#fff',
                    color: '#0a2540',
                    textAlign: 'left',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: answers[currentQuestion] === index ? '#0a2540' : '#eee',
                      color: answers[currentQuestion] === index ? '#fff' : '#666',
                      textAlign: 'center',
                      lineHeight: '28px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      marginRight: '0.75rem',
                    }}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <button
              onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                background: '#fff',
                color: currentQuestion === 0 ? '#aaa' : '#0a2540',
                cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
              }}
            >
              ← Previous
            </button>

            {currentQuestion < quiz.total_questions - 1 ? (
              <button
                onClick={() => setCurrentQuestion((prev) => prev + 1)}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0a2540',
                  color: '#f8f6f2',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#c45c3e',
                  color: '#fff',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            )}
          </div>

          {/* Question dots */}
          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              justifyContent: 'center',
              marginTop: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: 'none',
                  background:
                    index === currentQuestion
                      ? '#0a2540'
                      : answers[index] >= 0
                        ? '#c4a35a'
                        : '#ddd',
                  color: index === currentQuestion || answers[index] >= 0 ? '#fff' : '#666',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
