import { createClient } from '@/utils/supabase/server'
import Layout from '@/components/Layout'
import Link from 'next/link'

export default async function TranslationProjectPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const slug = params.slug

  const { data: project } = await supabase
    .from('translation_projects')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!project) {
    return (
      <Layout>
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <p style={{ color: '#666' }}>Translation project not found.</p>
          <Link href="/translation/" style={{ color: '#c45c3e' }}>← Back to Translation Center</Link>
        </div>
      </Layout>
    )
  }

  // Fetch chapter progress
  const { data: chapters } = await supabase
    .from('translation_chapters')
    .select('*')
    .eq('project_id', project.id)
    .order('chapter_num', { ascending: true })

  const progress = project.total_chapters > 0
    ? Math.round((project.completed_chapters / project.total_chapters) * 100)
    : 0

  const statusLabels: Record<string, string> = {
    planning: 'Planning',
    in_progress: 'In Progress',
    review: 'In Review',
    published: 'Published',
    archived: 'Archived',
  }

  const statusColors: Record<string, string> = {
    planning: '#e3eaf2',
    in_progress: '#fff3e0',
    review: '#fff8e7',
    published: '#f0fdf4',
    archived: '#f0f0f0',
  }

  const statusTextColors: Record<string, string> = {
    planning: '#0a2540',
    in_progress: '#c45c3e',
    review: '#c4a35a',
    published: '#16a34a',
    archived: '#999',
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <div style={{ background: '#f8f6f2', padding: '0.5rem 2rem' }}>
        <div style={{ maxWidth: '750px', margin: '0 auto', fontSize: '0.85rem' }}>
          <Link href="/translation/" style={{ color: '#c45c3e', textDecoration: 'none' }}>Translation Center</Link>
          <span style={{ color: '#aaa', margin: '0 0.4rem' }}>/</span>
          <span style={{ color: '#666' }}>{project.title}</span>
        </div>
      </div>

      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0a2540 0%, #0d2d4f 100%)',
          color: '#f8f6f2',
          padding: '3rem 2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '0.25rem 0.7rem',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: statusColors[project.status] || '#e3eaf2',
              color: statusTextColors[project.status] || '#0a2540',
              marginBottom: '0.75rem',
            }}
          >
            {statusLabels[project.status] || project.status}
          </div>
          <h1
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '2rem',
              marginBottom: '0.5rem',
              lineHeight: 1.2,
            }}
          >
            {project.title}
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#b0c4de' }}>
            {project.source_language.toUpperCase()} → {project.target_language.toUpperCase()}
            {project.author && ` · by ${project.author}`}
          </p>
        </div>
      </section>

      <section style={{ padding: '2.5rem 2rem', maxWidth: '750px', margin: '0 auto' }}>
        {/* Description */}
        {project.source_description && (
          <p style={{ color: '#333', lineHeight: 1.8, marginBottom: '2rem' }}>
            {project.source_description}
          </p>
        )}

        {/* Progress */}
        {project.total_chapters > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.9rem',
                color: '#666',
                marginBottom: '0.5rem',
              }}
            >
              <span style={{ fontWeight: 600, color: '#0a2540' }}>
                {project.completed_chapters} / {project.total_chapters} chapters completed
              </span>
              <span style={{ fontWeight: 700, color: '#c45c3e' }}>{progress}%</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '10px',
                background: '#eee',
                borderRadius: '5px',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: progress === 100 ? '#16a34a' : '#c4a35a',
                  borderRadius: '5px',
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        )}

        {/* Team */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          {project.translator_name && (
            <InfoCard label="Translator" value={project.translator_name} />
          )}
          {project.reviewer_name && (
            <InfoCard label="Reviewer" value={project.reviewer_name} />
          )}
        </div>

        {/* Chapter list */}
        {chapters && chapters.length > 0 && (
          <>
            <h2
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '1.3rem',
                color: '#0a2540',
                marginBottom: '1rem',
              }}
            >
              Chapters
            </h2>
            <div style={{ marginBottom: '2rem' }}>
              {chapters.map(ch => (
                <div
                  key={ch.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    background: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #eee',
                    marginBottom: '0.4rem',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, color: '#0a2540', fontSize: '0.9rem' }}>
                      Ch {ch.chapter_num}
                    </span>
                    {ch.title && (
                      <span style={{ color: '#666', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                        {ch.title}
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      background:
                        ch.status === 'completed' ? '#f0fdf4' :
                        ch.status === 'review' ? '#fff8e7' :
                        ch.status === 'translating' ? '#fff3e0' : '#f0f0f0',
                      color:
                        ch.status === 'completed' ? '#16a34a' :
                        ch.status === 'review' ? '#c4a35a' :
                        ch.status === 'translating' ? '#c45c3e' : '#999',
                    }}
                  >
                    {ch.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Notes */}
        {project.notes && (
          <>
            <h2
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '1.3rem',
                color: '#0a2540',
                marginBottom: '0.75rem',
              }}
            >
              Notes
            </h2>
            <p style={{ color: '#555', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '2rem' }}>
              {project.notes}
            </p>
          </>
        )}

        {/* Link to published book */}
        {project.status === 'published' && (
          <div
            style={{
              background: '#f0fdf4',
              borderRadius: '10px',
              padding: '1.25rem 1.5rem',
              border: '1px solid #86efac',
            }}
          >
            <p style={{ margin: 0, color: '#16a34a', fontWeight: 600 }}>
              ✓ This translation is published!
            </p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#666' }}>
              Read it in the{' '}
              <Link href="/library/" style={{ color: '#c45c3e', fontWeight: 600 }}>library</Link>.
            </p>
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          <Link
            href="/translation/"
            style={{
              color: '#c45c3e',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            ← Back to Translation Center
          </Link>
        </div>
      </section>
    </Layout>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: '#f8f6f2',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        border: '1px solid #e8e4dc',
      }}
    >
      <div style={{ fontSize: '0.72rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontWeight: 600, color: '#0a2540', fontSize: '0.9rem', marginTop: '0.2rem' }}>
        {value}
      </div>
    </div>
  )
}