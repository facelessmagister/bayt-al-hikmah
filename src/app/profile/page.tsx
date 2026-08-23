import { createClient } from '@/utils/supabase/server'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAllBooks, getAllAuthors } from '@/lib/catalog'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login/')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Fetch reading progress
  const { data: readingProgress } = await supabase
    .from('reading_progress')
    .select('*')
    .eq('user_id', session.user.id)
    .order('last_read_at', { ascending: false })
    .limit(5)

  // Get book data for progress
  const books = getAllBooks()
  const authors = getAllAuthors()

  const progressItems = (readingProgress || [])
    .map((p) => {
      const book = books.find((b) => b.slug === p.content_slug)
      return { progress: p, book }
    })
    .filter((item): item is { progress: typeof item.progress; book: NonNullable<typeof item.book> } => item.book !== undefined)

  return (
    <Layout>
      <section
        style={{
          background: '#0a2540',
          color: '#f8f6f2',
          padding: '3rem 2rem',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '2.5rem',
            marginBottom: '0.5rem',
          }}
        >
          Your Profile
        </h1>
        <p style={{ fontSize: '1rem', color: '#b0c4de' }}>
          Manage your account and view your progress
        </p>
      </section>

      <section style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#c4a35a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#0a2540',
              }}
            >
              {(profile?.name || session.user.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontFamily: '"DM Serif Display", serif', color: '#0a2540', marginBottom: '0.25rem' }}>
                {profile?.name || session.user.email?.split('@')[0] || 'User'}
              </h2>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>{session.user.email}</p>
              <span
                style={{
                  display: 'inline-block',
                  marginTop: '0.35rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: profile?.role === 'admin' ? '#c45c3e' : '#e3eaf2',
                  color: profile?.role === 'admin' ? '#fff' : '#0a2540',
                }}
              >
                {profile?.role || 'student'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <StatCard label="Books Read" value="0" />
            <StatCard label="Courses Enrolled" value="0" />
            <StatCard label="Competitions" value="0" />
            <StatCard label="Joined" value={new Date(profile?.created_at || session.user.created_at).toLocaleDateString()} />
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <h3
            style={{
              fontFamily: '"DM Serif Display", serif',
              color: '#0a2540',
              marginBottom: '1rem',
              fontSize: '1.25rem',
            }}
          >
            Continue Reading
          </h3>
          {progressItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {progressItems.map(({ progress, book }) => (
                <Link
                  key={progress.id}
                  href={`/chapter/${book.slug}/${progress.chapter_num}/${progress.language}/`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: '#f8f6f2',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#0a2540',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{book.title.en}</div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                      Chapter {progress.chapter_num}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        width: '120px',
                        height: '4px',
                        background: '#e3eaf2',
                        borderRadius: '2px',
                        overflow: 'hidden',
                        marginBottom: '0.25rem',
                      }}
                    >
                      <div
                        style={{
                          width: `${progress.completion_percent}%`,
                          height: '100%',
                          background: '#c45c3e',
                          borderRadius: '2px',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{progress.completion_percent}%</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                Your reading progress will appear here. Start reading a book to see your progress.
              </p>
              <Link
                href="/library/"
                style={{
                  display: 'inline-block',
                  marginTop: '1rem',
                  padding: '0.6rem 1.2rem',
                  background: '#0a2540',
                  color: '#f8f6f2',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                Browse Library
              </Link>
            </>
          )}
        </div>
      </section>
    </Layout>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f6f2', borderRadius: '8px' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a2540', marginBottom: '0.25rem' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  )
}
