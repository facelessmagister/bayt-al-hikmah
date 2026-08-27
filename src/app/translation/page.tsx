import { createClient } from '@/utils/supabase/server'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { getAllBooks, getAllAuthors } from '@/lib/catalog'

export const metadata = {
  title: 'Translation Center — Bayt al-Hikmah',
}

export default async function TranslationPage() {
  const supabase = createClient()

  // Fetch translation projects from DB
  const { data: projects } = await supabase
    .from('translation_projects')
    .select('*')
    .order('created_at', { ascending: false })

  // Also get published translations from the library (existing books that were translated)
  const books = getAllBooks()
  const authors = getAllAuthors()
  const translatedBooks = books.filter(b => b.languages.includes('en') && b.original_language === 'ar')

  // Group DB projects by status
  const inProgress = (projects || []).filter(p => p.status === 'in_progress' || p.status === 'planning')
  const inReview = (projects || []).filter(p => p.status === 'review')
  const dbPublished = (projects || []).filter(p => p.status === 'published')

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
            fontSize: '1.8rem',
            color: '#c4a35a',
            marginBottom: '0.5rem',
          }}
        >
          مركز الترجمة
        </p>
        <h1
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '2.5rem',
            marginBottom: '0.75rem',
          }}
        >
          Translation Center
        </h1>
        <p
          style={{
            fontSize: '1.05rem',
            color: '#b0c4de',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Making Islamic scholarship accessible across languages — translating Arabic works
          into English, Malay, Indonesian, and beyond.
        </p>
      </section>

      {/* Mission */}
      <section style={{ padding: '3rem 2rem', maxWidth: '750px', margin: '0 auto' }}>
        <div style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#333' }}>
          <p style={{ marginBottom: '1.5rem' }}>
            The original House of Wisdom in Baghdad was a translation center where Hunayn ibn Ishaq
            and his students rendered hundreds of Greek, Persian, Syriac, and Indian works into
            Arabic. This project continues that tradition — translating Islamic scholarship from
            Arabic into English and other languages, making knowledge accessible to readers
            worldwide.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            Our translation team works from original Arabic texts, carefully preserving meaning,
            terminology, and citation integrity. Each translation undergoes review before
            publication.
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '3rem',
          }}
        >
          <StatCard value={translatedBooks.length} label="Published Translations" />
          <StatCard value={inProgress.length} label="In Progress" />
          <StatCard value={inReview.length} label="In Review" />
          <StatCard value={2} label="Languages" accent />
        </div>

        {/* Published Translations (from library) */}
        <h2
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '1.5rem',
            color: '#0a2540',
            marginBottom: '1.5rem',
          }}
        >
          Published Translations
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          These works have been translated from Arabic to English and are available in our library.
          Click to read.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
            marginBottom: '3rem',
          }}
        >
          {translatedBooks.map(book => {
            const author = authors.find(a => a.slug === book.author)
            return (
              <Link
                key={book.slug}
                href={`/book/${book.slug}/`}
                style={{
                  display: 'block',
                  background: '#fff',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  border: '1px solid #eee',
                  textDecoration: 'none',
                  color: '#0a2540',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
                className="translation-card"
              >
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.3rem' }}>
                  {book.title?.en || book.slug}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#888' }}>
                  {author?.name || 'Unknown'} · {book.chapters?.length || 0} chapters
                </div>
                <div style={{ fontSize: '0.78rem', color: '#c45c3e', marginTop: '0.4rem' }}>
                  AR → EN
                </div>
              </Link>
            )
          })}
        </div>

        {/* In Progress */}
        {inProgress.length > 0 && (
          <>
            <h2
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '1.5rem',
                color: '#0a2540',
                marginBottom: '1.5rem',
              }}
            >
              In Progress
            </h2>
            <div style={{ marginBottom: '3rem' }}>
              {inProgress.map(proj => (
                <TranslationProjectCard key={proj.id} project={proj} />
              ))}
            </div>
          </>
        )}

        {/* In Review */}
        {inReview.length > 0 && (
          <>
            <h2
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '1.5rem',
                color: '#0a2540',
                marginBottom: '1.5rem',
              }}
            >
              In Review
            </h2>
            <div style={{ marginBottom: '3rem' }}>
              {inReview.map(proj => (
                <TranslationProjectCard key={proj.id} project={proj} />
              ))}
            </div>
          </>
        )}

        {/* Methodology */}
        <h2
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '1.5rem',
            color: '#0a2540',
            marginBottom: '1rem',
          }}
        >
          Translation Methodology
        </h2>
        <ol style={{ paddingLeft: '1.5rem', marginBottom: '2rem', color: '#333', lineHeight: 1.85 }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong style={{ color: '#0a2540' }}>Source Selection</strong> — Original Arabic texts
            are sourced from archives, libraries, and verified editions.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong style={{ color: '#0a2540' }}>OCR & Extraction</strong> — Arabic text is
            extracted using 300 DPI OCR, then cleaned and structured into chapters.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong style={{ color: '#0a2540' }}>Translation</strong> — Chapter-by-chapter
            translation with attention to Islamic terminology, Quranic/hadith citations, and
            scholarly conventions.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong style={{ color: '#0a2540' }}>Review</strong> — Translations undergo review for
            accuracy, readability, and citation integrity.
          </li>
          <li>
            <strong style={{ color: '#0a2540' }}>Publication</strong> — Approved translations are
            published to the library with bilingual reading support.
          </li>
        </ol>

        {/* Contribute */}
        <div
          style={{
            background: '#f8f6f2',
            borderRadius: '12px',
            padding: '1.75rem',
            border: '1px solid #e8e4dc',
          }}
        >
          <h3
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.2rem',
              color: '#0a2540',
              marginBottom: '0.5rem',
            }}
          >
            Contribute as a Translator
          </h3>
          <p style={{ color: '#555', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            If you know Arabic and English (or Malay/Indonesian) and want to contribute to
            translating Islamic scholarship, we welcome your help. Register on Bayt al-Hikmah and
            contact the admin via our Telegram channel.
          </p>
          <Link
            href="/sign-in"
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
            Create an Account →
          </Link>
        </div>
      </section>
    </Layout>
  )
}

function StatCard({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '1.25rem',
        border: '1px solid #eee',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: '2rem',
          color: accent ? '#c4a35a' : '#c45c3e',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  )
}

function TranslationProjectCard({ project }: { project: any }) {
  const progress = project.total_chapters > 0
    ? Math.round((project.completed_chapters / project.total_chapters) * 100)
    : 0

  return (
    <Link
      href={`/translation/${project.slug}/`}
      style={{
        display: 'block',
        background: '#fff',
        borderRadius: '10px',
        padding: '1.25rem 1.5rem',
        border: '1px solid #eee',
        marginBottom: '0.75rem',
        textDecoration: 'none',
        color: '#0a2540',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
      className="translation-card"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.5rem',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{project.title}</div>
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            background: project.status === 'in_progress' ? '#fff3e0' : '#e3eaf2',
            color: project.status === 'in_progress' ? '#c45c3e' : '#0a2540',
          }}
        >
          {project.status === 'in_progress' ? 'In Progress' : 'Planning'}
        </span>
      </div>
      <div style={{ fontSize: '0.82rem', color: '#888', marginBottom: '0.5rem' }}>
        {project.source_language.toUpperCase()} → {project.target_language.toUpperCase()}
        {project.author && ` · ${project.author}`}
      </div>
      {project.total_chapters > 0 && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              color: '#666',
              marginBottom: '0.25rem',
            }}
          >
            <span>{project.completed_chapters}/{project.total_chapters} chapters</span>
            <span>{progress}%</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              background: '#eee',
              borderRadius: '3px',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: progress === 100 ? '#16a34a' : '#c4a35a',
                borderRadius: '3px',
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
      )}
    </Link>
  )
}