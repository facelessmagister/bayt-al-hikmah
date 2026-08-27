import { createClient } from '@/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function AdminCompetitionDetailPage({ params }: { params: { slug: string } }) {
  const { userId } = await auth()
  if (!userId) {
    redirect(`/sign-in?redirect_url=/admin/competitions/${params.slug}/`)
  }

  const supabase = createClient()
  const slug = params.slug

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (!profile || profile.role !== 'admin') {
    return (
      <Layout>
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <p style={{ color: '#c45c3e', fontWeight: 600 }}>Access denied.</p>
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            You need admin access to view this page.
          </p>
        </div>
      </Layout>
    )
  }

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
          <Link href="/admin/competitions/" style={{ color: '#c45c3e' }}>← Back to Admin</Link>
        </div>
      </Layout>
    )
  }

  // Fetch registrations for this competition
  const { data: registrations } = await supabase
    .from('competition_registrations')
    .select(`
      *,
      profiles:user_id (name, email)
    `)
    .eq('competition_id', competition.id)
    .order('registered_at', { ascending: false })

  // Fetch submissions for this competition
  const { data: submissions } = await supabase
    .from('competition_submissions')
    .select(`
      *,
      profiles:user_id (name, email)
    `)
    .eq('competition_id', competition.id)
    .order('score', { ascending: false })

  const pending = (registrations || []).filter(r => r.payment_status === 'pending')
  const verified = (registrations || []).filter(r => r.payment_status === 'verified')
  const waived = (registrations || []).filter(r => r.payment_status === 'waived')

  return (
    <Layout>
      <section
        style={{
          background: '#0a2540',
          color: '#f8f6f2',
          padding: '2rem 2rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Link
            href="/admin/competitions/"
            style={{ color: '#b0c4de', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'inline-block' }}
          >
            ← Admin Dashboard
          </Link>
          <h1
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.75rem',
            }}
          >
            {competition.title}
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#b0c4de' }}>
            Status: {competition.status} · Entry fee: {competition.entry_fee}
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <StatBox label="Total Registered" value={registrations?.length || 0} />
          <StatBox label="Pending Payment" value={pending.length} color="#c4a35a" />
          <StatBox label="Verified" value={verified.length} color="#16a34a" />
          <StatBox label="Submissions" value={submissions?.length || 0} color="#c45c3e" />
        </div>

        {/* Registrations */}
        <h2
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '1.3rem',
            color: '#0a2540',
            marginBottom: '1rem',
          }}
        >
          Registrations
        </h2>

        {pending.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#c4a35a', marginBottom: '0.75rem' }}>
              Pending Payment ({pending.length})
            </h3>
            {pending.map(reg => (
              <div
                key={reg.id}
                style={{
                  background: '#fff8e7',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  border: '1px solid #c4a35a',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#0a2540', fontSize: '0.9rem' }}>
                    {reg.profiles?.name || 'Unknown'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#666' }}>
                    {new Date(reg.registered_at).toLocaleDateString('en-MY')}
                  </div>
                </div>
                <form action="/api/admin/verify-payment/" method="POST">
                  <input type="hidden" name="registration_id" value={reg.id} />
                  <button
                    type="submit"
                    style={{
                      padding: '0.35rem 0.8rem',
                      background: '#16a34a',
                      color: '#fff',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ✓ Verify
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        {verified.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#16a34a', marginBottom: '0.75rem' }}>
              Verified ({verified.length})
            </h3>
            {verified.map(reg => (
              <div
                key={reg.id}
                style={{
                  background: '#f0fdf4',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  border: '1px solid #86efac',
                  marginBottom: '0.5rem',
                }}
              >
                <div style={{ fontWeight: 600, color: '#0a2540', fontSize: '0.9rem' }}>
                  {reg.profiles?.name || 'Unknown'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#666' }}>
                  Verified: {reg.payment_verified_at ? new Date(reg.payment_verified_at).toLocaleDateString('en-MY') : '—'}
                </div>
              </div>
            ))}
          </div>
        )}

        {waived.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#888', marginBottom: '0.75rem' }}>
              Fee Waived ({waived.length})
            </h3>
            {waived.map(reg => (
              <div
                key={reg.id}
                style={{
                  background: '#f8f6f2',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  border: '1px solid #eee',
                  marginBottom: '0.5rem',
                }}
              >
                <div style={{ fontWeight: 600, color: '#0a2540', fontSize: '0.9rem' }}>
                  {reg.profiles?.name || 'Unknown'}
                </div>
              </div>
            ))}
          </div>
        )}

        {(!registrations || registrations.length === 0) && (
          <p style={{ color: '#888', fontStyle: 'italic' }}>No registrations yet.</p>
        )}

        {/* Submissions */}
        {submissions && submissions.length > 0 && (
          <>
            <h2
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '1.3rem',
                color: '#0a2540',
                marginBottom: '1rem',
                marginTop: '2rem',
              }}
            >
              Submissions
            </h2>
            <div>
              {submissions.map((sub, i) => (
                <div
                  key={sub.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr auto auto',
                    gap: '0.75rem',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    background: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #eee',
                    marginBottom: '0.4rem',
                  }}
                >
                  <div style={{ fontWeight: 700, color: i < 3 ? '#c4a35a' : '#aaa', textAlign: 'center' }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0a2540', fontSize: '0.9rem' }}>
                      {sub.profiles?.name || 'Anonymous'}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {sub.submission_data?.correct_count || 0}/{sub.submission_data?.total_questions || 0}
                  </div>
                  <div style={{ fontWeight: 700, color: '#0a2540', fontSize: '1.1rem' }}>
                    {sub.score}%
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ marginTop: '2rem' }}>
          <Link
            href={`/competitions/${slug}/leaderboard/`}
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              background: '#0a2540',
              color: '#f8f6f2',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            View Public Leaderboard →
          </Link>
        </div>
      </div>
    </Layout>
  )
}

function StatBox({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '1rem',
        border: '1px solid #eee',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: color || '#0a2540' }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>
        {label}
      </div>
    </div>
  )
}