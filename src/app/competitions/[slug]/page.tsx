import { createClient } from '@/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'
import Layout from '@/components/Layout'
import Link from 'next/link'

export default async function CompetitionPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()
  const slug = params.slug
  const justRegistered = searchParams?.registered === '1'

  const { data: competition } = await supabase
    .from('competitions')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!competition) {
    return (
      <Layout>
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h1 style={{ color: '#0a2540', fontFamily: '"DM Serif Display", serif' }}>Competition Not Found</h1>
          <Link href="/competitions/" style={{ color: '#c45c3e' }}>← Back to Competitions</Link>
        </div>
      </Layout>
    )
  }

  // Check if user is registered (Clerk auth)
  const { userId } = await auth()
  let isRegistered = false
  let registrationStatus = null

  if (userId) {
    const { data: reg } = await supabase
      .from('competition_registrations')
      .select('*')
      .eq('user_id', userId)
      .eq('competition_id', competition.id)
      .single()

    if (reg) {
      isRegistered = true
      registrationStatus = reg.payment_status
    }
  }

  // Parse prize structure from DB (JSONB array of {rank, prize})
  const prizes: Array<{ rank: string; prize: string }> = competition.prize_structure || []
  const rules: Array<string> = competition.rules || []
  const paymentInstructions = competition.payment_instructions ||
    'Join our Telegram channel and message the admin to arrange payment.'

  return (
    <Layout>
      {/* Success banner after registration */}
      {justRegistered && (
        <div
          style={{
            background: 'rgba(74, 222, 128, 0.15)',
            border: '1px solid #4ade80',
            borderRadius: '8px',
            padding: '1rem 1.5rem',
            margin: '1.5rem auto',
            maxWidth: '800px',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, color: '#0a2540' }}>✓ Successfully registered!</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#666' }}>
            Your payment status is pending. You can take the quiz now and complete payment later.
          </p>
        </div>
      )}

      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0a2540 0%, #0d2d4f 100%)',
          color: '#f8f6f2',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '0.35rem 0.9rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: '#c4a35a',
              color: '#0a2540',
              marginBottom: '1.25rem',
            }}
          >
            🏆 Competition
          </div>
          <h1
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '2.25rem',
              marginBottom: '0.75rem',
              lineHeight: 1.2,
            }}
          >
            {competition.title}
          </h1>
          <p style={{ fontSize: '1rem', color: '#b0c4de', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {competition.description}
          </p>

          {!userId && (
            <Link
              href={`/sign-in?redirect_url=/competitions/${slug}/`}
              style={{
                display: 'inline-block',
                padding: '0.85rem 1.75rem',
                background: '#c4a35a',
                color: '#0a2540',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              Log In to Register →
            </Link>
          )}

          {userId && !isRegistered && (
            <form action={`/api/competitions/${slug}/register/`} method="POST">
              <button
                type="submit"
                style={{
                  padding: '0.85rem 1.75rem',
                  background: '#c4a35a',
                  color: '#0a2540',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
              >
                Register Now — {competition.entry_fee}
              </button>
            </form>
          )}

          {userId && isRegistered && registrationStatus === 'pending' && (
            <div
              style={{
                background: 'rgba(196, 163, 90, 0.15)',
                border: '1px solid #c4a35a',
                borderRadius: '8px',
                padding: '1rem 1.5rem',
                display: 'inline-block',
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>✓ Registered — Payment Pending</p>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#b0c4de' }}>
                You can take the quiz now! Payment can be completed later.
              </p>
              <div style={{ marginTop: '0.75rem' }}>
                <Link
                  href={`/competitions/${slug}/quiz/`}
                  style={{
                    display: 'inline-block',
                    padding: '0.6rem 1.2rem',
                    background: '#c45c3e',
                    color: '#fff',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Start Quiz →
                </Link>
              </div>
            </div>
          )}

          {userId && isRegistered && (registrationStatus === 'verified' || registrationStatus === 'waived') && (
            <div
              style={{
                background: 'rgba(74, 222, 128, 0.15)',
                border: '1px solid #4ade80',
                borderRadius: '8px',
                padding: '1rem 1.5rem',
                display: 'inline-block',
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>✓ {registrationStatus === 'waived' ? 'Entry Fee Waived' : "Payment Verified — You're In!"}</p>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#b0c4de' }}>Good luck! Click below to start the quiz.</p>
              <div style={{ marginTop: '0.75rem' }}>
                <Link
                  href={`/competitions/${slug}/quiz/`}
                  style={{
                    display: 'inline-block',
                    padding: '0.6rem 1.2rem',
                    background: '#c45c3e',
                    color: '#fff',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Start Quiz →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Details */}
      <section style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        {/* Detail Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          <DetailCard icon="🎯" title="Entry Fee" value={competition.entry_fee} />
          {competition.registration_close && (
            <DetailCard
              icon="📅"
              title="Registration Closes"
              value={new Date(competition.registration_close).toLocaleDateString('en-MY', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            />
          )}
          {competition.competition_date && (
            <DetailCard
              icon="🗓️"
              title="Competition Date"
              value={new Date(competition.competition_date).toLocaleDateString('en-MY', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            />
          )}
        </div>

        {/* Prizes */}
        {prizes.length > 0 && (
          <>
            <h2
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '1.5rem',
                color: '#0a2540',
                marginBottom: '1.5rem',
              }}
            >
              Prize Structure
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '3rem' }}>
              {prizes.map((prize, i) => (
                <PrizeRow
                  key={i}
                  rank={prize.rank}
                  prize={prize.prize}
                  highlight={i === 0}
                />
              ))}
            </div>
          </>
        )}

        {/* Rules */}
        {rules.length > 0 && (
          <>
            <h2
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '1.5rem',
                color: '#0a2540',
                marginBottom: '1.5rem',
              }}
            >
              How It Works
            </h2>
            <ol
              style={{
                color: '#333',
                lineHeight: 1.8,
                paddingLeft: '1.5rem',
                marginBottom: '3rem',
              }}
            >
              {rules.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ol>
          </>
        )}

        {/* Related Course */}
        {competition.related_course_slug && (
          <div
            style={{
              background: '#e3eaf2',
              borderRadius: '12px',
              padding: '1.75rem',
              marginBottom: '3rem',
            }}
          >
            <h3
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '1.25rem',
                color: '#0a2540',
                marginBottom: '0.75rem',
              }}
            >
              📚 Study Material
            </h3>
            <p style={{ color: '#333', lineHeight: 1.6, margin: 0 }}>
              Prepare by studying the{' '}
              <Link
                href={`/course/${competition.related_course_slug}/`}
                style={{ color: '#c45c3e', fontWeight: 600 }}
              >
                {competition.related_course_slug.replace(/-/g, ' ')} course
              </Link>
              {' '}— free for all registered participants.
            </p>
          </div>
        )}

        {/* Payment Instructions (shown when pending) */}
        {userId && isRegistered && registrationStatus === 'pending' && (
          <div
            style={{
              background: '#fff8e7',
              border: '2px solid #c4a35a',
              borderRadius: '12px',
              padding: '1.75rem',
              marginBottom: '3rem',
            }}
          >
            <h3
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '1.25rem',
                color: '#0a2540',
                marginBottom: '0.75rem',
              }}
            >
              💬 Complete Your Payment
            </h3>
            <p style={{ color: '#333', lineHeight: 1.7, marginBottom: '1rem' }}>
              To activate your participation, please pay the entry fee of{' '}
              <strong>{competition.entry_fee}</strong> and notify the admin:
            </p>
            <ol style={{ paddingLeft: '1.5rem', color: '#333', lineHeight: 1.8, marginBottom: '1rem' }}>
              <li>Join our official Telegram channel:{' '}
                <a
                  href="https://t.me/bayt_al_hikmah_xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#c45c3e', fontWeight: 600 }}
                >
                  @bayt_al_hikmah_xyz
                </a>
              </li>
              <li>Send a message to the admin with your registered email and payment proof.</li>
              <li>The admin will verify your payment and unlock the quiz for you.</li>
              <li>You will be notified once your payment is verified.</li>
            </ol>
            <div
              style={{
                background: 'rgba(196, 163, 90, 0.1)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                color: '#666',
              }}
            >
              <strong style={{ color: '#0a2540' }}>Note:</strong> Your quiz is unlocked — you can
              take it now. Payment verification is only required for leaderboard ranking and prizes.
              This usually takes a few hours after you send your proof.
            </div>
          </div>
        )}

        {/* Leaderboard link */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link
            href={`/competitions/${slug}/leaderboard/`}
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
            🏆 View Leaderboard
          </Link>
        </div>
      </section>
    </Layout>
  )
}

function DetailCard({ icon, title, value }: { icon: string; title: string; value: string }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '10px',
        padding: '1.25rem',
        border: '1px solid #eee',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>{title}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a2540' }}>{value}</div>
    </div>
  )
}

function PrizeRow({ rank, prize, highlight }: { rank: string; prize: string; highlight?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.25rem',
        background: highlight ? '#f8f6f2' : '#fff',
        borderRadius: '8px',
        border: '1px solid #eee',
      }}
    >
      <span style={{ fontWeight: 600, color: '#0a2540', fontSize: '0.95rem' }}>{rank}</span>
      <span style={{ fontWeight: 700, color: '#c45c3e', fontSize: '1rem' }}>{prize}</span>
    </div>
  )
}