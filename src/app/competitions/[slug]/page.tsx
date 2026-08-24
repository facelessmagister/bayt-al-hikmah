import { createClient } from '@/utils/supabase/server'
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
          <Link href="/" style={{ color: '#c45c3e' }}>← Back to Home</Link>
        </div>
      </Layout>
    )
  }

  // Check if user is registered
  const { data: { session } } = await supabase.auth.getSession()
  let isRegistered = false
  let registrationStatus = null

  if (session) {
    const { data: reg } = await supabase
      .from('competition_registrations')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('competition_id', competition.id)
      .single()

    if (reg) {
      isRegistered = true
      registrationStatus = reg.payment_status
    }
  }

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
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#666' }}>Your payment status is pending. Please complete your RM25 payment to unlock the quiz.</p>
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

          {!session && (
            <Link
              href={`/login/?next=/competitions/${slug}/`}
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

          {session && !isRegistered && (
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

          {session && isRegistered && registrationStatus === 'pending' && (
            <div
              style={{
                background: 'rgba(196, 163, 90, 0.15)',
                border: '1px solid #c4a35a',
                borderRadius: '8px',
                padding: '1rem 1.5rem',
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>✓ Registered — Payment Pending</p>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#b0c4de' }}>Please complete your payment of {competition.entry_fee}. Instructions will be sent via email.</p>
            </div>
          )}

          {session && isRegistered && registrationStatus === 'verified' && (
            <div
              style={{
                background: 'rgba(74, 222, 128, 0.15)',
                border: '1px solid #4ade80',
                borderRadius: '8px',
                padding: '1rem 1.5rem',
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>✓ Payment Verified — You're In!</p>
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          <DetailCard
            icon="🎯"
            title="Entry Fee"
            value={competition.entry_fee}
          />
          <DetailCard
            icon="🎁"
            title="Prizes"
            value="RM150 / RM100 / RM50"
          />
          <DetailCard
            icon="📅"
            title="Registration Closes"
            value={new Date(competition.registration_close).toLocaleDateString('en-MY', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          />
        </div>

        {/* Prizes */}
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
          <PrizeRow rank="🥇 1st Place" prize="RM 150" highlight />
          <PrizeRow rank="🥈 2nd Place" prize="RM 100" />
          <PrizeRow rank="🥉 3rd Place" prize="RM 50" />
        </div>

        {/* Rules */}
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
          <li>Register and pay the {competition.entry_fee} entry fee.</li>
          <li>Study the <Link href="/course/iron-deficiency-anemia-in-women/" style={{ color: '#c45c3e' }}>Iron Deficiency Anemia course</Link> (5 lessons, free).</li>
          <li>Take the 10-question multiple-choice quiz.</li>
          <li>Your score and completion time are recorded privately.</li>
          <li>Winners are determined by highest score. In case of ties, the earliest completion wins.</li>
          <li>All participants receive a FREE spot at the live course in Kota Bharu, Kelantan.</li>
        </ol>

        {/* Live Course */}
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
            📍 Live Course Session
          </h3>
          <p style={{ color: '#333', lineHeight: 1.6, margin: 0 }}>
            All participants — regardless of score — are invited to attend a live course session in
            <strong>Kota Bharu, Kelantan</strong>. Date and venue will be announced after registration closes.
          </p>
        </div>

        {/* Eligibility */}
        <div
          style={{
            borderLeft: '4px solid #c45c3e',
            paddingLeft: '1.25rem',
            marginBottom: '3rem',
          }}
        >
          <h3
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.1rem',
              color: '#0a2540',
              marginBottom: '0.5rem',
            }}
          >
            Eligibility
          </h3>
          <p style={{ color: '#666', lineHeight: 1.6, margin: 0 }}>
            Open to all Malaysians. You must be registered on Bayt al-Hikmah and have completed payment
            to be eligible for prizes and the live course session.
          </p>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          {!session && (
            <Link
              href={`/login/?next=/competitions/${slug}/`}
              style={{
                display: 'inline-block',
                padding: '0.85rem 1.75rem',
                background: '#0a2540',
                color: '#f8f6f2',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              Log In to Register →
            </Link>
          )}

          {session && !isRegistered && (
            <form action={`/api/competitions/${slug}/register/`} method="POST">
              <button
                type="submit"
                style={{
                  padding: '0.85rem 1.75rem',
                  background: '#0a2540',
                  color: '#f8f6f2',
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

          {session && isRegistered && registrationStatus === 'verified' && (
            <Link
              href={`/competitions/${slug}/quiz/`}
              style={{
                display: 'inline-block',
                padding: '0.85rem 1.75rem',
                background: '#c45c3e',
                color: '#fff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              Start the Quiz →
            </Link>
          )}
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
