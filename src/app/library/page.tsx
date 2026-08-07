import Layout from '@/components/Layout';
import BookCard from '@/components/BookCard';
import { getAllBooks, getAllAuthors, SHELVES } from '@/lib/catalog';

export const metadata = {
  title: 'Library — Bayt al-Hikmah',
};

export default function LibraryPage() {
  const books = getAllBooks();
  const authors = getAllAuthors();

  const shelves = Object.entries(SHELVES);

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
          The Library
        </h1>
        <p style={{ fontSize: '1rem', color: '#b0c4de' }}>
          Browse all {books.length} books in the collection
        </p>
      </section>

      {shelves.map(([shelfKey, shelf]) => {
        const shelfBooks = books.filter((b) => b.shelf === shelfKey);
        if (shelfBooks.length === 0) return null;

        return (
          <section
            key={shelfKey}
            style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}
          >
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
                {shelf.name}
              </h2>
              <span
                style={{
                  fontFamily: '"Amiri", serif',
                  fontSize: '1.2rem',
                  color: '#c4a35a',
                }}
              >
                {shelf.arabic}
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
              {shelf.description}
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {shelfBooks.map((book) => {
                const author = authors.find((a) => a.slug === book.author);
                return <BookCard key={book.slug} book={book} author={author} />;
              })}
            </div>
          </section>
        );
      })}
    </Layout>
  );
}