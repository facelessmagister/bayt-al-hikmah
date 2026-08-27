import { createClient } from '@/utils/supabase/server'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function CompetitionResultPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const slug = params.slug

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect(`/auth/?next=/competitions/${slug}/result/`)
  }

  // Fetch competition
  const { data: competition } = await supabase
    .from('competitions')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!competition) {
    redirect('/')
  }

  // Fetch user's submission
  const { data: submission } = await supabase
    .from('competition_submissions')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('competition_id', competition.id)
    .single()

  if (!submission) {
    redirect(`/competitions/${slug}/`)
  }

  const submissionData = submission.submission_data || {}
  const startedAt = new Date(submissionData.started_at)
  const completedAt = new Date(submissionData.completed_at)
  const durationMs = completedAt.getTime() - startedAt.getTime()
  const durationMinutes = Math.floor(durationMs / 60000)
  const durationSeconds = Math.floor((durationMs % 60000) / 1000)

  const score = submission.score || 0
  const correctCount = submissionData.correct_count || 0
  const totalQuestions = submissionData.total_questions || 10

  // Determine status based on score
  const isTop3 = score >= 80

  return (
    <Layout>
      <div style={{ minHeight: '80vh', background: '#f8f6f2', padding: '4rem 2rem' }}>
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            background: '#fff',
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}
        >
          {/* Header */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: score >= 80 ? '#4ade80' : score >= 60 ? '#c4a35a' : '#c45c3e',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 1.5rem',
            }}
          >
            {score >= 80 ? '🏆' : score >= 60 ? '⭐' : '📚'}
          </div>

          <h1
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.75rem',
              color: '#0a2540',
              marginBottom: '0.5rem',
            }}
          >
            Quiz Complete!
          </h1>
          <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '2rem' }}>
            {competition.title}
          </p>

          {/* Score */}
          <div
            style={{
              background: '#f8f6f2',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                fontSize: '3.5rem',
                fontWeight: 700,
                color:
                  score >= 80 ? '#16a34a' : score >= 60 ? '#c4a35a' : '#c45c3e',
                lineHeight: 1,
              }}
            >
              {score}%
            </div>
            <div style={{ fontSize: '1rem', color: '#666', marginTop: '0.5rem' }}>
              {correctCount} / {totalQuestions} correct
            </div>
          </div>

          {/* Timing */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                background: '#e3eaf2',
                borderRadius: '8px',
                padding: '1rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Started</div>
              <div style={{ fontWeight: 600, color: '#0a2540', marginTop: '0.25rem' }}>{startedAt.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}
</div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>{startedAt.toLocaleDateString('en-MY')}</div>
            </div>

            <div
              style={{
                background: '#e3eaf2',
                borderRadius: '8px',
                padding: '1rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</div>
              <div style={{ fontWeight: 600, color: '#0a2540', marginTop: '0.25rem' }}>{completedAt.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}</div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>{completedAt.toLocaleDateString('en-MY')}</div>
            </div>
          </div>

          <div
            style={{
              background: '#0a2540',
              color: '#f8f6f2',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: '#b0c4de', marginBottom: '0.25rem' }}>Time Taken</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{durationMinutes}m {durationSeconds}s</div>
          </div>

          {/* Status message */}
          {isTop3 && (
            <div
              style={{
                background: 'rgba(196, 163, 90, 0.15)',
                border: '1px solid #c4a35a',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '2rem',
              }}
            >
              <p style={{ margin: 0, fontWeight: 600, color: '#0a2540' }}>🎉 Excellent score! You're in the running for a prize.</p>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#666' }}>Winners will be announced after the competition closes. In case of a tie, the earliest completion time wins.</p>
            </div>
          )}

          {!isTop3 && (
            <div
              style={{
                background: '#f8f6f2',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '2rem',
              }}
            >
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                Thank you for participating! Your score has been recorded. All participants are eligible for the FREE live course session in Kota Bharu, Kelantan.
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              href={`/competitions/${slug}/`}
              style={{
                display: 'block',
                padding: '0.75rem',
                background: '#0a2540',
                color: '#f8f6f2',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Back to Competition Page
            </Link>
            <Link
              href="/courses/"
              style={{
                display: 'block',
                padding: '0.75rem',
                background: '#fff',
                color: '#0a2540',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                border: '1px solid #ddd',
              }}
            >
              Browse More Courses
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
