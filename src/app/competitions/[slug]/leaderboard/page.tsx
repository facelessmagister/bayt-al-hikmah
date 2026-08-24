import { createClient } from '@/utils/supabase/server'
import Layout from '@/components/Layout'
import Link from 'next/link'

export default async function LeaderboardPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const slug = params.slug

  const { data: competition } = await supabase
    .from('competitions')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!competition) {
    return (
      <Layout>
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <p style={{ color: '#666' }}>Competition not found.</p>
          <Link href="/competitions/" style={{ color: '#c45c3e' }}>← Back to Competitions</Link>
        </div>
      </Layout>
    )
  }

  // Fetch all scored submissions, ordered by score desc then by submission time asc
  const { data: submissions } = await supabase
    .from('competition_submissions')
    .select(`
      score,
      submitted_at,
      submission_data,
      user_id,
      profiles:user_id (name)
    `)
    .eq('competition_id', competition.id)
    .not('score', 'is', null)
    .order('score', { ascending: false })
    .order('submitted_at', { ascending: true })

  const leaderboard = (submissions || []).map((s: any, i: number) => ({
    rank: i + 1,
    name: s.profiles?.name || 'Anonymous',
    score: s.score,
    correct: s.submission_data?.correct_count || 0,
    total: s.submission_data?.total_questions || 0,
    duration: s.submission_data?.completed_at && s.submission_data?.started_at
      ? formatDuration(s.submission_data.completed_at, s.submission_data.started_at)
      : '—',
  }))

  return (
    <Layout>
      <section
        style={{
          background: 'linear-gradient(135deg, #0a2540 0%, #0d2d4f 100%)',
          color: '#f8f6f2',
          padding: '3rem 2rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '0.25rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            background: '#c4a35a',
            color: '#0a2540',
            marginBottom: '0.75rem',
          }}
        >
          🏆 Leaderboard
        </div>
        <h1
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '2rem',
            marginBottom: '0.5rem',
          }}
        >
          {competition.title}
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#b0c4de' }}>
          {leaderboard.length} participant{leaderboard.length !== 1 ? 's' : ''} scored
        </p>
      </section>

      <section style={{ padding: '2.5rem 2rem', maxWidth: '700px', margin: '0 auto' }}>
        {leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <p style={{ color: '#666', fontSize: '1.05rem' }}>
              No scores yet. Be the first to take the quiz!
            </p>
          </div>
        ) : (
          <div>
            {leaderboard.map((entry, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 1fr auto auto',
                  gap: '1rem',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  background: i === 0 ? '#f8f6f2' : '#fff',
                  borderRadius: i === 0 ? '12px' : '8px',
                  marginBottom: '0.5rem',
                  border: i === 0 ? '2px solid #c4a35a' : '1px solid #eee',
                }}
              >
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    color: i < 3 ? '#c4a35a' : '#aaa',
                  }}
                >
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${entry.rank}`}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#0a2540', fontSize: '0.95rem' }}>
                    {entry.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#888' }}>
                    {entry.correct}/{entry.total} correct · {entry.duration}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: entry.score >= 80 ? '#16a34a' : entry.score >= 60 ? '#c4a35a' : '#c45c3e',
                  }}
                >
                  {entry.score}%
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link
            href={`/competitions/${slug}/`}
            style={{
              display: 'inline-block',
              padding: '0.6rem 1.2rem',
              background: 'transparent',
              color: '#0a2540',
              borderRadius: '6px',
              border: '1px solid #0a2540',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            ← Back to Competition
          </Link>
        </div>
      </section>
    </Layout>
  )
}

function formatDuration(completedAt: string, startedAt: string): string {
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime()
  const mins = Math.floor(ms / 60000)
  const secs = Math.floor((ms % 60000) / 1000)
  return `${mins}m ${secs}s`
}