import Link from 'next/link';
import Layout from '@/components/Layout';
import BookCard from '@/components/BookCard';
import ContinueReadingWrapper from '@/components/ContinueReadingWrapper';
import { getAllBooks, getAllAuthors, getBooksByShelf, SHELVES } from '@/lib/catalog';

export default function HomePage() {
  const books = getAllBooks();
  const authors = getAllAuthors();

  const revivalistBooks = getBooksByShelf('revivalist');
  const qaradawiBooks = getBooksByShelf('qaradawi');

  const totalChapters = books.reduce((sum, b) => sum + (b.chapters?.length || 0), 0);
  const bilingualBooks = books.filter((b) => b.languages.length > 1).length;

  return (
    <Layout>
      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0a2540 0%, #0d2d4f 100%)',
          color: '#f8f6f2',
          padding: '5rem 2rem 4rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: '"Amiri", serif',
              fontSize: '2.5rem',
              color: '#c4a35a',
              marginBottom: '0.5rem',
            }}
          >
            بيت الحكمة
          </p>
          <h1
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '3rem',
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}
          >
            Bayt al-Hikmah
          </h1>
          <p
            style={{
              fontSize: '1.15rem',
              lineHeight: 1.7,
              color: '#b0c4de',
              maxWidth: '600px',
              margin: '0 auto 2.5rem',
            }}
          >
            A digital library of Islamic literature — books, tafsir, and hadith
            in Arabic, English, and more. Read freely, study deeply.
          </p>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2.5rem',
              flexWrap: 'wrap',
            }}
          >
            <StatBox value={books.length} label="Books" />
            <StatBox value={totalChapters} label="Chapters" />
            <StatBox value={authors.length} label="Scholars" />
            <StatBox value={bilingualBooks} label="Bilingual" accent />
          </div>
        </div>
      </section>

      {/* Continue Reading */}
      <ContinueReadingWrapper books={books} authors={authors} />

      {/* Shelves */}
      <section style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Revivalist Literature */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '0.5rem',
            }}
          >
            <h2
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '1.75rem',
                color: '#0a2540',
              }}
            >
              {SHELVES.revivalist.name}
            </h2>
            <span
              style={{
                fontFamily: '"Amiri", serif',
                fontSize: '1.2rem',
                color: '#c4a35a',
              }}
            >
              {SHELVES.revivalist.arabic}
            </span>
          </div>
          <p
            style={{
              fontSize: '0.9rem',
              color: '#666',
              marginBottom: '1.5rem',
              maxWidth: '700px',
              lineHeight: 1.6,
            }}
          >
            {SHELVES.revivalist.description}
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {revivalistBooks.map((book) => {
              const author = authors.find((a) => a.slug === book.author);
              return <BookCard key={book.slug} book={book} author={author} />;
            })}
          </div>
        </div>

        {/* Qaradawi Collection */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '0.5rem',
            }}
          >
            <h2
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '1.75rem',
                color: '#0a2540',
              }}
            >
              {SHELVES.qaradawi.name}
            </h2>
            <span
              style={{
                fontFamily: '"Amiri", serif',
                fontSize: '1.2rem',
                color: '#c4a35a',
              }}
            >
              {SHELVES.qaradawi.arabic}
            </span>
          </div>
          <p
            style={{
              fontSize: '0.9rem',
              color: '#666',
              marginBottom: '1.5rem',
              maxWidth: '700px',
              lineHeight: 1.6,
            }}
          >
            {SHELVES.qaradawi.description}
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {qaradawiBooks.map((book) => {
              const author = authors.find((a) => a.slug === book.author);
              return <BookCard key={book.slug} book={book} author={author} />;
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}

function StatBox({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          color: accent ? '#c4a35a' : '#f8f6f2',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: '0.8rem', color: '#b0c4de', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  );
}