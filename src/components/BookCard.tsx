import Link from 'next/link';
import type { Book, Author } from '@/lib/catalog';

interface BookCardProps {
  book: Book;
  author?: Author;
}

export default function BookCard({ book, author }: BookCardProps) {
  const langCount = book.languages.length;
  const chapterCount = book.chapters?.length || 0;

  return (
    <Link
      href={`/book/${book.slug}/`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        borderRadius: '10px',
        padding: '1.5rem',
        textDecoration: 'none',
        color: '#0a2540',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'all 0.25s ease',
        height: '100%',
        border: '1px solid #eee',
      }}
      className="book-card"
    >
      {/* Language badges */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
        {book.languages.map((lang) => (
          <span
            key={lang}
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '3px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: lang === 'ar' ? '#e8dcc8' : '#e3eaf2',
              color: lang === 'ar' ? '#8a6d3b' : '#0a2540',
            }}
          >
            {lang === 'ar' ? 'العربية' : 'EN'}
          </span>
        ))}
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: '1.25rem',
          lineHeight: 1.3,
          marginBottom: '0.35rem',
          color: '#0a2540',
        }}
      >
        {book.title.en}
      </h3>

      {/* Arabic title */}
      <p
        style={{
          fontFamily: '"Amiri", serif',
          fontSize: '1rem',
          color: '#c45c3e',
          marginBottom: '0.75rem',
          direction: 'rtl',
          textAlign: 'right',
        }}
      >
        {book.title.ar}
      </p>

      {/* Author */}
      {author && (
        <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>{author.name}</span>
          <span style={{ fontFamily: '"Amiri", serif', color: '#c45c3e', marginRight: '0.4rem' }}>
            {' '}
            · {author.native_name}
          </span>
        </p>
      )}

      {/* Meta */}
      <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#888' }}>
        <span>📖 {chapterCount} chapters</span>
        {book.translated_by && <span>✍️ Translated</span>}
      </div>

      </Link>
    );
}