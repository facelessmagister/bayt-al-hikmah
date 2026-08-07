import Layout from '@/components/Layout';
import { getAllBooks, getAllAuthors } from '@/lib/catalog';

export const metadata = {
  title: 'About — Bayt al-Hikmah',
};

export default function AboutPage() {
  const books = getAllBooks();
  const authors = getAllAuthors();
  const totalChapters = books.reduce((sum, b) => sum + (b.chapters?.length || 0), 0);

  return (
    <Layout>
      <section
        style={{
          background: '#0a2540',
          color: '#f8f6f2',
          padding: '3.5rem 2rem',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: '"Amiri", serif',
            fontSize: '2rem',
            color: '#c4a35a',
            marginBottom: '0.5rem',
          }}
        >
          بيت الحكمة
        </p>
        <h1
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '2.5rem',
            marginBottom: '1rem',
          }}
        >
          About Bayt al-Hikmah
        </h1>
        <p style={{ fontSize: '1rem', color: '#b0c4de', maxWidth: '600px', margin: '0 auto' }}>
          House of Wisdom — a digital library of Islamic literature
        </p>
      </section>

      <section style={{ padding: '3rem 2rem', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#333' }}>
          <p style={{ marginBottom: '1.5rem' }}>
            <strong style={{ color: '#0a2540' }}>Bayt al-Hikmah</strong> (بيت الحكمة, "House of
            Wisdom") is a digital library dedicated to making Islamic literature accessible to
            readers worldwide. Named after the legendary library of Baghdad, this project collects
            books by prominent Islamic scholars and thinkers — in their original Arabic and in
            English translation.
          </p>

          <h2
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.5rem',
              color: '#0a2540',
              marginTop: '2rem',
              marginBottom: '1rem',
            }}
          >
            What's in the Library
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <StatCard value={books.length} label="Books" />
            <StatCard value={totalChapters} label="Chapters" />
            <StatCard value={authors.length} label="Scholars" />
            <StatCard value={2} label="Shelves" />
          </div>

          <h2
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.5rem',
              color: '#0a2540',
              marginTop: '2rem',
              marginBottom: '1rem',
            }}
          >
            The Shelves
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#c45c3e' }}>Revivalist Literature</strong> — Foundational
            works of the modern Islamic revivalist movement, including thinkers from the Muslim
            Brotherhood tradition: Fathi Yakan, Said Hawwa, Majdi al-Hilali, and others.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#c45c3e' }}>Qaradawi Collection</strong> — The fiqh, ethics,
            and spiritual writings of Dr. Yusuf al-Qaradawi (1926–2022), covering topics from zakah
            and halal/haram to hadith methodology and Islamic arts.
          </p>

          <h2
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.5rem',
              color: '#0a2540',
              marginTop: '2rem',
              marginBottom: '1rem',
            }}
          >
            Languages
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Books are available in their original Arabic and in English translation. Some books are
            bilingual — you can switch between Arabic and English while reading. Arabic text uses
            the beautiful Amiri font for optimal readability.
          </p>

          <h2
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.5rem',
              color: '#0a2540',
              marginTop: '2rem',
              marginBottom: '1rem',
            }}
          >
            Coming Soon
          </h2>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>📖 Full Quran with translations and tafsir</li>
            <li style={{ marginBottom: '0.5rem' }}>📗 Hadith collections (Bukhari, Muslim, Sunan)</li>
            <li style={{ marginBottom: '0.5rem' }}>📙 Concept wiki — cross-referenced Islamic concepts</li>
            <li style={{ marginBottom: '0.5rem' }}>🔤 Full-text search across all content</li>
            <li style={{ marginBottom: '0.5rem' }}>🌏 Malay and Indonesian translations</li>
            <li>🔖 Reading bookmarks and progress tracking</li>
          </ul>

          <h2
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.5rem',
              color: '#0a2540',
              marginTop: '2rem',
              marginBottom: '1rem',
            }}
          >
            Access
          </h2>
          <p>
            All content is freely available for reading and study. No login required.
          </p>
        </div>
      </section>
    </Layout>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '1.25rem',
        textAlign: 'center',
        border: '1px solid #eee',
      }}
    >
      <div
        style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: '2rem',
          color: '#c45c3e',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  );
}