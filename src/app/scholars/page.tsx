import Link from 'next/link';
import Layout from '@/components/Layout';
import { getAllAuthors, getBooksByAuthor } from '@/lib/catalog';

export const metadata = {
  title: 'Scholars — Bayt al-Hikmah',
};

export default function ScholarsPage() {
  const authors = getAllAuthors().sort((a, b) => (a.priority || 99) - (b.priority || 99));

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
          Scholars
        </h1>
        <p style={{ fontSize: '1rem', color: '#b0c4de' }}>
          The authors behind the books
        </p>
      </section>

      <section style={{ padding: '3rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {authors.map((author) => {
            const books = getBooksByAuthor(author.slug);
            return (
              <Link
                key={author.slug}
                href={`/scholar/${author.slug}/`}
                style={{
                  display: 'block',
                  background: '#fff',
                  borderRadius: '10px',
                  padding: '1.75rem',
                  textDecoration: 'none',
                  color: '#0a2540',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #eee',
                  transition: 'all 0.2s',
                }}
                className="scholar-card"
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: '"DM Serif Display", serif',
                      fontSize: '1.3rem',
                      color: '#0a2540',
                    }}
                  >
                    {author.name}
                  </h3>
                  <span
                    style={{
                      fontFamily: '"Amiri", serif',
                      fontSize: '1.15rem',
                      color: '#c4a35a',
                      direction: 'rtl',
                    }}
                  >
                    {author.native_name}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#c45c3e', marginBottom: '0.5rem' }}>
                  {author.role}
                </p>
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: '#666',
                    lineHeight: 1.5,
                    marginBottom: '0.75rem',
                  }}
                >
                  {author.bio.slice(0, 120)}
                  {author.bio.length > 120 ? '...' : ''}
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.75rem',
                    color: '#888',
                  }}
                >
                  <span>📚 {books.length} book{books.length !== 1 ? 's' : ''}</span>
                  <span>🌍 {author.nationality}</span>
                  {author.birth_year && (
                    <span>
                      📅 {author.birth_year}–{author.death_year || 'present'}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

    </Layout>
  );
}