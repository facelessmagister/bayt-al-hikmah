import { createClient } from '@/utils/supabase/server'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Translation Admin — Bayt al-Hikmah',
}

export default async function AdminTranslationsPage() {
  const supabase = createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login/?next=/admin/translations/')
  }

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

  const { data: projects } = await supabase
    .from('translation_projects')
    .select('*')
    .order('updated_at', { ascending: false })

  const byStatus = {
    planning: (projects || []).filter(p => p.status === 'planning'),
    in_progress: (projects || []).filter(p => p.status === 'in_progress'),
    review: (projects || []).filter(p => p.status === 'review'),
    published: (projects || []).filter(p => p.status === 'published'),
  }

  return (
    <Layout>
      <section
        style={{
          background: '#0a2540',
          color: '#f8f6f2',
          padding: '2rem 2rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Link
            href="/admin/competitions/"
            style={{ color: '#b0c4de', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'inline-block' }}
          >
            ← Admin
          </Link>
          <h1
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.75rem',
            }}
          >
            Translation Admin
          </h1>
        </div>
      </section>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          <StatBox label="Planning" value={byStatus.planning.length} color="#0a2540" />
          <StatBox label="In Progress" value={byStatus.in_progress.length} color="#c45c3e" />
          <StatBox label="In Review" value={byStatus.review.length} color="#c4a35a" />
          <StatBox label="Published" value={byStatus.published.length} color="#16a34a" />
        </div>

        {/* New project form */}
        <div
          style={{
            background: '#f8f6f2',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #e8e4dc',
            marginBottom: '2.5rem',
          }}
        >
          <h2
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.2rem',
              color: '#0a2540',
              marginBottom: '1rem',
            }}
          >
            Create New Translation Project
          </h2>
          <form action="/api/admin/translation-project/" method="POST" style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input
                type="text"
                name="title"
                placeholder="Book title"
                required
                style={inputStyle}
              />
              <input
                type="text"
                name="slug"
                placeholder="url-slug (e.g. book-title)"
                required
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <input type="text" name="author" placeholder="Author" style={inputStyle} />
              <input type="text" name="source_language" placeholder="Source lang (ar)" value="ar" style={inputStyle} />
              <input type="text" name="target_language" placeholder="Target lang (en)" value="en" style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input type="number" name="total_chapters" placeholder="Total chapters" min="0" style={inputStyle} />
              <input type="text" name="translator_name" placeholder="Translator name" style={inputStyle} />
            </div>
            <textarea
              name="source_description"
              placeholder="Source text description (optional)"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
            <button
              type="submit"
              style={{
                padding: '0.6rem 1.25rem',
                background: '#0a2540',
                color: '#f8f6f2',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                justifySelf: 'start',
              }}
            >
              Create Project →
            </button>
          </form>
        </div>

        {/* All projects */}
        <h2
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '1.3rem',
            color: '#0a2540',
            marginBottom: '1rem',
          }}
        >
          All Projects
        </h2>
        <div>
          {(projects || []).map(proj => {
            const progress = proj.total_chapters > 0
              ? Math.round((proj.completed_chapters / proj.total_chapters) * 100)
              : 0
            return (
              <Link
                key={proj.id}
                href={`/translation/${proj.slug}/`}
                style={{
                  display: 'block',
                  padding: '1rem 1.25rem',
                  background: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #eee',
                  marginBottom: '0.5rem',
                  textDecoration: 'none',
                  color: '#0a2540',
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
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{proj.title}</span>
                    <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '0.5rem' }}>
                      {proj.source_language}→{proj.target_language}
                      {proj.author && ` · ${proj.author}`}
                      {' · '}{proj.completed_chapters}/{proj.total_chapters} ch
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      background: '#e3eaf2',
                      color: '#0a2540',
                    }}
                  >
                    {proj.status}
                  </span>
                </div>
                {proj.total_chapters > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div
                      style={{
                        width: '100%',
                        height: '4px',
                        background: '#eee',
                        borderRadius: '2px',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${progress}%`,
                          background: progress === 100 ? '#16a34a' : '#c4a35a',
                          borderRadius: '2px',
                        }}
                      />
                    </div>
                  </div>
                )}
              </Link>
            )
          })}
          {(!projects || projects.length === 0) && (
            <p style={{ color: '#888', fontStyle: 'italic' }}>No translation projects yet.</p>
          )}
        </div>
      </div>
    </Layout>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderRadius: '6px',
  border: '1px solid #ddd',
  fontSize: '0.9rem',
  fontFamily: '"Source Sans 3", sans-serif',
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
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
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>
        {label}
      </div>
    </div>
  )
}