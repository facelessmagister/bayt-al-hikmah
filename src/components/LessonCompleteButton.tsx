'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface LessonCompleteButtonProps {
  courseSlug: string
  lessonId: string
  alreadyCompleted: boolean
  isLastLesson: boolean
  nextLessonId?: string
}

export default function LessonCompleteButton({
  courseSlug,
  lessonId,
  alreadyCompleted,
  isLastLesson,
  nextLessonId,
}: LessonCompleteButtonProps) {
  const [completed, setCompleted] = useState(alreadyCompleted)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleComplete() {
    if (completed || loading) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/courses/${courseSlug}/lesson/${lessonId}/complete/`, {
        method: 'POST',
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to mark lesson complete.')
        setLoading(false)
        return
      }

      setCompleted(true)
      setLoading(false)

      // If there's a next lesson, navigate to it after a brief delay
      if (nextLessonId) {
        setTimeout(() => {
          router.push(`/course/${courseSlug}/lesson/${nextLessonId}/`)
        }, 800)
      } else {
        // Last lesson — refresh to show completion
        setTimeout(() => {
          router.refresh()
        }, 800)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (completed) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span
          style={{
            padding: '0.6rem 1.2rem',
            background: 'rgba(74, 222, 128, 0.15)',
            color: '#16a34a',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          ✓ Lesson Complete
        </span>
        {nextLessonId && (
          <button
            onClick={() => router.push(`/course/${courseSlug}/lesson/${nextLessonId}/`)}
            style={{
              padding: '0.6rem 1.2rem',
              background: '#0a2540',
              color: '#f8f6f2',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Next Lesson →
          </button>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
      {error && <span style={{ color: '#c45c3e', fontSize: '0.85rem' }}>{error}</span>}
      <button
        onClick={handleComplete}
        disabled={loading}
        style={{
          padding: '0.6rem 1.2rem',
          background: loading ? '#999' : '#c45c3e',
          color: '#fff',
          borderRadius: '6px',
          border: 'none',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '0.9rem',
        }}
      >
        {loading ? 'Saving...' : isLastLesson ? 'Mark Lesson Complete' : 'Mark as Complete & Next →'}
      </button>
    </div>
  )
}