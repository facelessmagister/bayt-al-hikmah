import { createClient } from '@/utils/supabase/server'
import Layout from '@/components/Layout'
import Link from 'next/link'

export const metadata = {
  title: 'Competitions — Bayt al-Hikmah',
}

export default async function CompetitionsPage() {
  const supabase = createClient()
  const { data: competitions } = await supabase
    .from('competitions')
    .select('*')
    .order('created_at', { ascending: false })

  const activeCompetitions = (competitions || []).filter(c => c.status === 'open')
  const upcomingCompetitions = (competitions || []).filter(c => c.status === 'draft')
  const completedCompetitions = (competitions || []).filter(c => c.status === 'completed')

  return (
    <Layout>
      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0a2540 0%, #0d2d4f 100%)',
          color: '#f8f6f2',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: '"Amiri", serif',
            fontSize: '1.6rem',
            color: '#c4a35a',
            marginBottom: '0.25rem',
          }}
        >
          المسابقات
        </p>
        <h1
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '2.5rem',
            marginBottom: '0.5rem',
          }}
        >
          Competitions
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: '#b0c4de',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Test your knowledge, challenge yourself, and compete for prizes.
          Open to all registered members of Bayt al-Hikmah.
        </p>
      </section>

      <section style={{ padding: '3rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        {(!competitions || competitions.length === 0) && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              No competitions available yet.
            </p>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>
              Check back soon for new competitions and challenges.
            </p>
          </div>
        )}

        {activeCompetitions.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h2
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '1.5rem',
                color: '#0a2540',
                marginBottom: '1.5rem',
              }}
            >
              Active Competitions
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {activeCompetitions.map(comp => (
                <CompetitionCard key={comp.id} competition={comp} />
              ))}
            </div>
          </div>
        )}

        {upcomingCompetitions.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h2
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '1.25rem',
                color: '#0a2540',
                marginBottom: '1.5rem',
              }}
            >
              Upcoming
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {upcomingCompetitions.map(comp => (
                <CompetitionCard key={comp.id} competition={comp} upcoming />
              ))}
            </div>
          </div>
        )}

        {completedCompetitions.length > 0 && (
          <div>
            <h2
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '1.25rem',
                color: '#0a2540',
                marginBottom: '1.5rem',
              }}
            >
              Past Competitions
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {completedCompetitions.map(comp => (
                <CompetitionCard key={comp.id} competition={comp} completed />
              ))}
            </div>
          </div>
        )}
      </section>
    </Layout>
  )
}

function CompetitionCard({
  competition,
  upcoming,
  completed,
}: {
  competition: any
  upcoming?: boolean
  completed?: boolean
}) {
  const prizes: Array<{ rank: string; prize: string }> = competition.prize_structure || []
  const topPrize = prizes.length > 0 ? prizes[0].prize : null

  return (
    <Link
      href={`/competitions/${competition.slug}/`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        borderRadius: '12px',
        padding: '1.75rem',
        textDecoration: 'none',
        color: '#0a2540',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid #eee',
        transition: 'transform 0.2s',
      }}
      className="competition-card"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.75rem',
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
            background: upcoming ? '#e3eaf2' : completed ? '#f0f0f0' : '#fff3e0',
            color: upcoming ? '#0a2540' : completed ? '#999' : '#c45c3e',
          }}
        >
          {upcoming ? 'Upcoming' : completed ? 'Completed' : '🏆 Active'}
        </div>
        {topPrize && (
          <span style={{ fontSize: '0.8rem', color: '#c4a35a', fontWeight: 700 }}>
            Top prize: {topPrize}
          </span>
        )}
      </div>

      <h2
        style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: '1.35rem',
          marginBottom: '0.5rem',
          lineHeight: 1.3,
        }}
      >
        {competition.title}
      </h2>
      <p
        style={{
          color: '#666',
          fontSize: '0.9rem',
          lineHeight: 1.6,
          marginBottom: '1rem',
        }}
      >
        {competition.description}
      </p>
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '0.8rem', color: '#888' }}>
          Entry: {competition.entry_fee || 'Free'}
        </span>
        {!completed && !upcoming && (
          <span style={{ color: '#c45c3e', fontSize: '0.85rem', fontWeight: 600 }}>
            View Details →
          </span>
        )}
        {completed && (
          <span style={{ color: '#888', fontSize: '0.85rem', fontWeight: 600 }}>
            View Results →
          </span>
        )}
      </div>
    </Link>
  )
}