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
        <p style={{ fontSize: '1.05rem', color: '#b0c4de', maxWidth: '650px', margin: '0 auto' }}>
          House of Wisdom — an education center for Islamic studies and the sciences
        </p>
      </section>

      <section style={{ padding: '3rem 2rem', maxWidth: '750px', margin: '0 auto' }}>
        <div style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#333' }}>
          {/* Historical inspiration */}
          <p style={{ marginBottom: '1.5rem' }}>
            <strong style={{ color: '#0a2540' }}>Bayt al-Hikmah</strong> (بيت الحكمة, &ldquo;House of
            Wisdom&rdquo;) was a legendary library, academy, and translation center established
            during the Islamic Golden Age in Baghdad, Iraq. Between the late 8th and mid-13th
            centuries, it stood as the intellectual epicenter of the world, fostering unprecedented
            developments in science, mathematics, medicine, astronomy, and philosophy.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            The original House of Wisdom was not merely a library. It was five things at once: a
            <strong style={{ color: '#0a2540' }}> library</strong> that preserved and translated
            Greek, Persian, and Indian works; an <strong style={{ color: '#0a2540' }}>academy</strong>
            {' '}where scholars taught, debated, and produced original research; a{' '}
            <strong style={{ color: '#0a2540' }}>translation center</strong> where Hunayn ibn Ishaq
            and others rendered hundreds of works into Arabic; a{' '}
            <strong style={{ color: '#0a2540' }}>writing center</strong> where original works were
            composed — al-Khwarizmi wrote algebra there; and an engine of{' '}
            <strong style={{ color: '#0a2540' }}>knowledge production</strong> that created new
            knowledge, not merely stored it.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            That House of Wisdom was destroyed. This project revives its mission for the digital age.
          </p>

          {/* Our mission */}
          <h2
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.5rem',
              color: '#0a2540',
              marginTop: '2.5rem',
              marginBottom: '1rem',
            }}
          >
            Our Mission
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            To build a new House of Wisdom — an online education center that serves as a library,
            academy, translation center, writing center, and a community for learning and the
            production of new knowledge, with a focus on Islamic studies and the various sciences.
          </p>

          {/* Five Pillars */}
          <h2
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.5rem',
              color: '#0a2540',
              marginTop: '2.5rem',
              marginBottom: '1rem',
            }}
          >
            The Five Pillars
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <PillarTile
              number="I"
              title="Library"
              description="Academic books, Quran with tafsir, hadith collections, and scholarly works in Arabic, English, and more. Bilingual reader with RTL support."
            />
            <PillarTile
              number="II"
              title="Academy"
              description="Structured courses, quizzes, and competitions to foster learning and research across Islamic studies and the sciences."
            />
            <PillarTile
              number="III"
              title="Translation Center"
              description="Translating Islamic scholarship across languages — making Arabic works accessible in English, Malay, Indonesian, and beyond."
            />
            <PillarTile
              number="IV"
              title="Writing Center"
              description="Original research publications, essays, and a peer review workflow for producing new knowledge."
            />
            <PillarTile
              number="V"
              title="Young Learners"
              description="Graded reading materials for children ages 5 to 13, building the next generation of readers and thinkers."
            />
          </div>

          {/* Current content stats */}
          <h2
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.5rem',
              color: '#0a2540',
              marginTop: '2.5rem',
              marginBottom: '1rem',
            }}
          >
            What&rsquo;s Available Now
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

          <p style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#c45c3e' }}>Revivalist Literature</strong> — Foundational
            works of the modern Islamic revivalist movement, including thinkers from the Muslim
            Brotherhood tradition: Fathi Yakan, Said Hawwa, Majdi al-Hilali, and others.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#c45c3e' }}>Qaradawi Collection</strong> — The fiqh, ethics,
            and spiritual writings of Dr. Yusuf al-Qaradawi (1926&ndash;2022), covering topics from
            zakah and halal/haram to hadith methodology and Islamic arts.
          </p>

          {/* Languages */}
          <h2
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.5rem',
              color: '#0a2540',
              marginTop: '2.5rem',
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

          {/* Coming Soon */}
          <h2
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.5rem',
              color: '#0a2540',
              marginTop: '2.5rem',
              marginBottom: '1rem',
            }}
          >
            Roadmap
          </h2>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>📖 Full Quran with translations and tafsir</li>
            <li style={{ marginBottom: '0.5rem' }}>📗 Hadith collections (Bukhari, Muslim, Sunan)</li>
            <li style={{ marginBottom: '0.5rem' }}>🌱 Young Learners library (children&rsquo;s reading materials)</li>
            <li style={{ marginBottom: '0.5rem' }}>📝 Writing Center for original research and essays</li>
            <li style={{ marginBottom: '0.5rem' }}>🏆 Competitions and quizzes to foster learning</li>
            <li style={{ marginBottom: '0.5rem' }}>🔤 Full-text search across all content</li>
            <li>🌏 Malay and Indonesian translations</li>
          </ul>

          {/* Access */}
          <h2
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.5rem',
              color: '#0a2540',
              marginTop: '2.5rem',
              marginBottom: '1rem',
            }}
          >
            Access
          </h2>
          <p>
            All content is freely available for reading and study. No login required to browse the
            library. Create a free account to track reading progress, enroll in courses, and
            join competitions.
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

function PillarTile({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        background: '#f8f6f2',
        borderRadius: '10px',
        padding: '1.25rem',
        border: '1px solid #e8e4dc',
      }}
    >
      <div
        style={{
          fontFamily: '"Amiri", serif',
          fontSize: '1rem',
          color: '#c4a35a',
          marginBottom: '0.25rem',
        }}
      >
        {number}
      </div>
      <h3
        style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: '1.15rem',
          color: '#0a2540',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: '0.82rem', color: '#555', lineHeight: 1.55, margin: 0 }}>
        {description}
      </p>
    </div>
  );
}