'use client'

import Link from 'next/link'
import { useReadingProgress } from '@/hooks/useReadingProgress'

interface ContinueReadingProps {
  books: any[]
  authors: any[]
}

export default function ContinueReading({ books, authors }: ContinueReadingProps) {
  const { progress, loading } = useReadingProgress()

  if (loading) return null
  if (progress.length === 0) return null

  // Map progress to book data
  const items = progress
    .map((p) => {
      const book = books.find((b) => b.slug === p.content_slug)
      const author = book ? authors.find((a) => a.slug === book.author_slug) : null
      return { progress: p, book, author }
    })
    .filter((item) => item.book)

  if (items.length === 0) return null

  return (
    <section
      style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '1.5rem 2rem',
        margin: '2rem auto',
        maxWidth: '1200px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '1.5rem',
            color: '#0a2540',
            margin: 0,
          }}
        >
          Continue Reading
        </h2>
        <Link
          href="/library/"
          style={{ color: '#c45c3e', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}
        >
          Browse Library →
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {items.map(({ progress, book, author }) => (
          <Link
            key={progress.id}
            href={`/chapter/${book.slug}/${progress.chapter_num}/${progress.language}/`}
            style={{
              display: 'flex',
              gap: '1rem',
              padding: '1rem',
              background: '#f8f6f2',
              borderRadius: '8px',
              textDecoration: 'none',
              color: '#0a2540',
              transition: 'transform 0.15s',
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  marginBottom: '0.25rem',
                  fontFamily: '"DM Serif Display", serif',
                }}
              >
                {book.title.en}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem' }}>
                Chapter {progress.chapter_num} · {author?.name || book.author}
              </div>
              {/* Progress bar */}
              <div
                style={{
                  width: '100%',
                  height: '4px',
                  background: '#e3eaf2',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${progress.completion_percent}%`,
                    height: '100%',
                    background: '#c45c3e',
                    borderRadius: '2px',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: '#888',
                  marginTop: '0.25rem',
                  textAlign: 'right',
                }}
              >
                {progress.completion_percent}%
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
