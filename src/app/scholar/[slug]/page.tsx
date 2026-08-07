import Link from 'next/link';
import { notFound } from 'next/navigation';
import Layout from '@/components/Layout';
import BookCard from '@/components/BookCard';
import { getAuthorBySlug, getBooksByAuthor } from '@/lib/catalog';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  const { getAllAuthors } = require('@/lib/catalog');
  return getAllAuthors().map((a: any) => ({ slug: a.slug }));
}

export default function ScholarPage({ params }: Props) {
  const author = getAuthorBySlug(params.slug);
  if (!author) notFound();

  const books = getBooksByAuthor(params.slug);

  return (
    <Layout>
      <section
        style={{
          background: 'linear-gradient(135deg, #0a2540 0%, #0d2d4f 100%)',
          color: '#f8f6f2',
          padding: '3.5rem 2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h1
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '2.5rem',
              marginBottom: '0.25rem',
            }}
          >
            {author.name}
          </h1>
          <p
            style={{
              fontFamily: '"Amiri", serif',
              fontSize: '1.5rem',
              color: '#c4a35a',
              marginBottom: '1rem',
              direction: 'rtl',
            }}
          >
            {author.native_name}
          </p>
          <p style={{ fontSize: '0.95rem', color: '#b0c4de', marginBottom: '0.5rem' }}>
            {author.role}
          </p>
          <p style={{ fontSize: '0.85rem', color: '#6b8ca0' }}>
            {author.nationality} · {author.movement}
            {author.birth_year && ` · ${author.birth_year}–${author.death_year || 'present'}`}
          </p>
        </div>
      </section>

      <section style={{ padding: '2.5rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: '#333',
            textAlign: 'justify',
          }}
        >
          {author.bio}
        </p>
      </section>

      <section style={{ padding: '1rem 2rem 3rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '1.5rem',
            color: '#0a2540',
            marginBottom: '1.5rem',
          }}
        >
          Books in the Library
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {books.map((book) => (
            <BookCard key={book.slug} book={book} author={author} />
          ))}
        </div>
      </section>
    </Layout>
  );
}