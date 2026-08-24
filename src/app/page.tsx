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
              maxWidth: '620px',
              margin: '0 auto 2.5rem',
            }}
          >
            House of Wisdom — a center for Islamic education, translation, and the sciences.
            Read books, take courses, learn, and build new knowledge.
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

      {/* Five Pillars */}
      <section style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '1.75rem',
            color: '#0a2540',
            textAlign: 'center',
            marginBottom: '0.5rem',
          }}
        >
          Five Pillars of Knowledge
        </h2>
        <p
          style={{
            fontSize: '0.95rem',
            color: '#666',
            textAlign: 'center',
            marginBottom: '2.5rem',
            maxWidth: '600px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}
        >
          Named after the legendary House of Wisdom of Baghdad, this project revives its mission
          for the digital age — combining a library, academy, translation center, writing center,
          and a community of learners.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <PillarCard
            icon="📚"
            title="Library"
            description="Books, tafsir, and hadith in Arabic and English — read freely, study deeply."
            href="/library/"
          />
          <PillarCard
            icon="🎓"
            title="Academy"
            description="Structured courses, quizzes, and competitions to deepen your understanding."
            href="/courses/"
          />
          <PillarCard
            icon="🔤"
            title="Translation"
            description="Making Islamic scholarship accessible across languages — Arabic, English, Malay, and more."
            href="/translation/"
          />
          <PillarCard
            icon="✍️"
            title="Writing Center"
            description="Original research, essays, and knowledge production by our community."
          />
          <PillarCard
            icon="🌱"
            title="Young Learners"
            description="Graded reading materials for children ages 5 to 13 — building the next generation."
            href="/young-learners/"
          />
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

function PillarCard({
  icon,
  title,
  description,
  href,
}: {
  icon: string;
  title: string;
  description: string;
  href?: string;
}) {
  const content = (
    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #eee',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        height: '100%',
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <h3
        style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: '1.2rem',
          color: '#0a2540',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.6, margin: 0 }}>
        {description}
      </p>
      {href && (
        <p style={{ fontSize: '0.8rem', color: '#c45c3e', fontWeight: 600, marginTop: '0.75rem' }}>
          Explore →
        </p>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        {content}
      </Link>
    );
  }
  return content;
}