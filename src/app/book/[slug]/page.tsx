import Link from 'next/link';
import { notFound } from 'next/navigation';
import Layout from '@/components/Layout';
import { getBookBySlug, getBookChapters, getAllAuthors, getBooksByShelf, SHELVES } from '@/lib/catalog';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  const { getAllBooks } = require('@/lib/catalog');
  return getAllBooks().map((book: any) => ({ slug: book.slug }));
}

export default function BookPage({ params }: Props) {
  const book = getBookBySlug(params.slug);
  if (!book) notFound();

  const authors = getAllAuthors();
  const author = authors.find((a) => a.slug === book.author);

  // Get chapters for each available language
  const chaptersByLang: Record<string, any[]> = {};
  for (const lang of book.languages) {
    chaptersByLang[lang] = getBookChapters(params.slug, lang);
  }

  // Use the language with most chapters as the primary list
  const primaryLang = book.languages.sort(
    (a, b) => (chaptersByLang[b]?.length || 0) - (chaptersByLang[a]?.length || 0)
  )[0];
  const primaryChapters = chaptersByLang[primaryLang] || [];

  // Related books (same shelf)
  const relatedBooks = getBooksByShelf(book.shelf)
    .filter((b) => b.slug !== book.slug)
    .slice(0, 3);

  return (
    <Layout>
      {/* Book header */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0a2540 0%, #0d2d4f 100%)',
          color: '#f8f6f2',
          padding: '3.5rem 2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {/* Shelf badge */}
          <div
            style={{
              display: 'inline-block',
              background: '#c45c3e',
              color: '#fff',
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1.25rem',
            }}
          >
            {SHELVES[book.shelf]?.name || book.shelf}
          </div>

          <h1
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '2.5rem',
              marginBottom: '0.5rem',
              lineHeight: 1.2,
            }}
          >
            {book.title.en}
          </h1>
          <p
            style={{
              fontFamily: '"Amiri", serif',
              fontSize: '1.4rem',
              color: '#c4a35a',
              marginBottom: '1rem',
              direction: 'rtl',
            }}
          >
            {book.title.ar}
          </p>

          {author && (
            <Link
              href={`/scholar/${author.slug}/`}
              style={{
                color: '#b0c4de',
                textDecoration: 'none',
                fontSize: '0.95rem',
              }}
            >
              <strong style={{ color: '#f8f6f2' }}>{author.name}</strong>
              <span style={{ fontFamily: '"Amiri", serif', color: '#c4a35a', marginRight: '0.5rem' }}>
                {' '}
                · {author.native_name}
              </span>
              {author.birth_year && (
                <span style={{ color: '#6b8ca0' }}>
                  {' '}
                  ({author.birth_year}–{author.death_year || 'present'})
                </span>
              )}
            </Link>
          )}

          {/* Translation info */}
          <div
            style={{
              marginTop: '1.5rem',
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              fontSize: '0.8rem',
              color: '#b0c4de',
            }}
          >
            {book.translated_by && <span>✍️ Translated by {book.translated_by}</span>}
            {book.translated_at && <span>📅 {book.translated_at}</span>}
            {book.languages.includes('ar') && book.languages.includes('en') && (
              <span>🌐 Bilingual (AR + EN)</span>
            )}
            {book.status.en === 'partial' && <span>⚠️ Partial translation</span>}
          </div>
        </div>
      </section>

      {/* Chapters list */}
      <section style={{ padding: '2.5rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <h2
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.5rem',
              color: '#0a2540',
            }}
          >
            Chapters
          </h2>
          {book.languages.length > 1 && (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {book.languages.map((lang) => (
                <span
                  key={lang}
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '3px',
                    textTransform: 'uppercase',
                    background: lang === 'ar' ? '#e8dcc8' : '#e3eaf2',
                    color: lang === 'ar' ? '#8a6d3b' : '#0a2540',
                  }}
                >
                  {lang === 'ar' ? 'العربية' : 'English'}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {primaryChapters.length === 0 ? (
            <p style={{ color: '#555' }}>No chapters available.</p>
          ) : (
            primaryChapters.map((ch, index) => {
              // Check which languages have this chapter
              const availableLangs = book.languages.filter((lang) => {
                const langChapters = chaptersByLang[lang] || [];
                return langChapters[ index];
              });

              return (
                <Link
                  key={index}
                  href={`/chapter/${params.slug}/${ch.number}/${primaryLang}/`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem 1.25rem',
                    background: '#fff',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#0a2540',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s',
                    border: '1px solid #eee',
                  }}
                  className="chapter-row"
                >
                  <span
                    style={{
                      width: '2.25rem',
                      height: '2.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#0a2540',
                      color: '#f8f6f2',
                      borderRadius: '50%',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      marginRight: '1rem',
                      flexShrink: 0,
                    }}
                  >
                    {String(ch.number).padStart(2, '0')}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', flex: 1 }}>
                    {ch.title}
                  </span>
                  {/* Language availability dots */}
                  <div style={{ display: 'flex', gap: '0.3rem', marginRight: '0.75rem' }}>
                    {book.languages.map((lang) => (
                      <span
                        key={lang}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: availableLangs.includes(lang) ? '#c45c3e' : '#ddd',
                          display: 'inline-block',
                        }}
                        title={lang === 'ar' ? 'Arabic' : 'English'}
                      />
                    ))}
                  </div>
                  <span style={{ color: '#c45c3e', fontSize: '1.1rem' }}>→</span>
                </Link>
              );
            })
          )}
        </div>
      </section>

      {/* Related books */}
      {relatedBooks.length > 0 && (
        <section style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <h3
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.25rem',
              color: '#0a2540',
              marginBottom: '1rem',
            }}
          >
            More from {SHELVES[book.shelf]?.name}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {relatedBooks.map((rb) => {
              const ra = authors.find((a) => a.slug === rb.author);
              return (
                <Link
                  key={rb.slug}
                  href={`/book/${rb.slug}/`}
                  style={{
                    background: '#fff',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    textDecoration: 'none',
                    color: '#0a2540',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    border: '1px solid #eee',
                  }}
                  className="chapter-row"
                >
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                    {rb.title.en}
                  </div>
                  <div
                    style={{
                      fontFamily: '"Amiri", serif',
                      fontSize: '0.85rem',
                      color: '#c45c3e',
                      direction: 'rtl',
                      textAlign: 'right',
                    }}
                  >
                    {rb.title.ar}
                  </div>
                  {ra && (
                    <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>
                      {ra.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

    </Layout>
  );
}