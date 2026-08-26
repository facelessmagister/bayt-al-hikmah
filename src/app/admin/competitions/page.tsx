import { createClient } from '@/utils/supabase/server'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function AdminCompetitionsPage() {
  const supabase = createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/?next=/admin/competitions/')
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
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

  // Fetch all competitions with registration counts
  const { data: competitions } = await supabase
    .from('competitions')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch all registrations with profile data
  const { data: registrations } = await supabase
    .from('competition_registrations')
    .select(`
      *,
      competitions:competition_id (title, slug),
      profiles:user_id (name, email)
    `)
    .order('registered_at', { ascending: false })

  // Fetch all submissions with profile data
  const { data: submissions } = await supabase
    .from('competition_submissions')
    .select(`
      *,
      competitions:competition_id (title, slug),
      profiles:user_id (name, email)
    `)
    .not('score', 'is', null)
    .order('score', { ascending: false })

  const pendingPayments = (registrations || []).filter(r => r.payment_status === 'pending')
  const verifiedPayments = (registrations || []).filter(r => r.payment_status === 'verified')

  return (
    <Layout>
      {/* Admin Header */}
      <section
        style={{
          background: '#0a2540',
          color: '#f8f6f2',
          padding: '2rem 2rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: '"Amiri", serif',
              fontSize: '1rem',
              color: '#c4a35a',
              marginBottom: '0.25rem',
            }}
          >
            لوحة التحكم
          </p>
          <h1
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.75rem',
            }}
          >
            Competition Admin
          </h1>
        </div>
      </section>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          <AdminStat label="Total Competitions" value={competitions?.length || 0} color="#0a2540" />
          <AdminStat label="Pending Payments" value={pendingPayments.length} color="#c4a35a" />
          <AdminStat label="Verified Payments" value={verifiedPayments.length} color="#16a34a" />
          <AdminStat label="Total Submissions" value={submissions?.length || 0} color="#c45c3e" />
        </div>

        {/* Competitions List */}
        <h2
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '1.3rem',
            color: '#0a2540',
            marginBottom: '1rem',
          }}
        >
          Competitions
        </h2>
        <div style={{ marginBottom: '2.5rem' }}>
          {(competitions || []).map(comp => {
            const compRegs = (registrations || []).filter(r => r.competition_id === comp.id)
            const compSubs = (submissions || []).filter(s => s.competition_id === comp.id)
            const compPending = compRegs.filter(r => r.payment_status === 'pending')
            return (
              <div
                key={comp.id}
                style={{
                  background: '#fff',
                  borderRadius: '10px',
                  padding: '1.25rem 1.5rem',
                  border: '1px solid #eee',
                  marginBottom: '0.75rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <Link
                      href={`/competitions/${comp.slug}/`}
                      style={{
                        fontWeight: 600,
                        color: '#0a2540',
                        fontSize: '1rem',
                        textDecoration: 'none',
                      }}
                    >
                      {comp.title}
                    </Link>
                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.2rem' }}>
                      Status: <span style={{ fontWeight: 600, color: comp.status === 'open' ? '#16a34a' : '#666' }}>{comp.status}</span>
                      {' · '}Entry: {comp.entry_fee}
                      {' · '}{compRegs.length} registered
                      {' · '}{compPending.length} pending payment
                      {' · '}{compSubs.length} submissions
                    </div>
                  </div>
                  <Link
                    href={`/admin/competitions/${comp.slug}/`}
                    style={{
                      padding: '0.4rem 0.8rem',
                      background: '#0a2540',
                      color: '#f8f6f2',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                    }}
                  >
                    Manage →
                  </Link>
                </div>
              </div>
            )
          })}
          {(!competitions || competitions.length === 0) && (
            <p style={{ color: '#888', fontStyle: 'italic' }}>No competitions created yet.</p>
          )}
        </div>

        {/* Pending Payments */}
        {pendingPayments.length > 0 && (
          <>
            <h2
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '1.3rem',
                color: '#c4a35a',
                marginBottom: '1rem',
              }}
            >
              Pending Payments ({pendingPayments.length})
            </h2>
            <div style={{ marginBottom: '2.5rem' }}>
              {pendingPayments.map(reg => (
                <div
                  key={reg.id}
                  style={{
                    background: '#fff8e7',
                    borderRadius: '10px',
                    padding: '1rem 1.25rem',
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
                    <div style={{ fontWeight: 600, color: '#0a2540' }}>
                      {reg.profiles?.name || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {reg.competitions?.title || 'Unknown'}
                      {' · '}Registered {new Date(reg.registered_at).toLocaleDateString('en-MY')}
                    </div>
                  </div>
                  <form action={`/api/admin/verify-payment/`} method="POST">
                    <input type="hidden" name="registration_id" value={reg.id} />
                    <button
                      type="submit"
                      style={{
                        padding: '0.4rem 0.9rem',
                        background: '#16a34a',
                        color: '#fff',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ✓ Verify Payment
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Submissions Leaderboard */}
        {submissions && submissions.length > 0 && (
          <>
            <h2
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '1.3rem',
                color: '#0a2540',
                marginBottom: '1rem',
              }}
            >
              All Submissions (sorted by score)
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
                    <div style={{ fontSize: '0.78rem', color: '#888' }}>
                      {sub.competitions?.title}
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
      </div>
    </Layout>
  )
}

function AdminStat({ label, value, color }: { label: string; value: number; color: string }) {
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
      <div style={{ fontSize: '2rem', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '0.78rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
        {label}
      </div>
    </div>
  )
}