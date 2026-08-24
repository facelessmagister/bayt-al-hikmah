import Layout from '@/components/Layout';

export const metadata = {
  title: 'Young Learners — Bayt al-Hikmah',
};

export default function YoungLearnersPage() {
  return (
    <Layout>
      <section
        style={{
          background: 'linear-gradient(135deg, #0a2540 0%, #0d2d4f 100%)',
          color: '#f8f6f2',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: '"Amiri", serif',
            fontSize: '1.8rem',
            color: '#c4a35a',
            marginBottom: '0.5rem',
          }}
        >
          الناشئة
        </p>
        <h1
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '2.5rem',
            marginBottom: '0.75rem',
          }}
        >
          Young Learners
        </h1>
        <p
          style={{
            fontSize: '1.05rem',
            color: '#b0c4de',
            maxWidth: '550px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Graded reading materials for children ages 5 to 13 — building the next generation
          of readers and thinkers.
        </p>
      </section>

      <section style={{ padding: '3rem 2rem', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
          <h2
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.5rem',
              color: '#0a2540',
              marginBottom: '0.75rem',
            }}
          >
            Coming Soon
          </h2>
          <p style={{ color: '#666', fontSize: '1.05rem', marginBottom: '0.5rem', lineHeight: 1.6 }}>
            The Young Learners library is being prepared. It will feature graded reading
            materials across three age groups (5, 9, 12), covering Islamic studies, values,
            and the sciences — with age-appropriate vocabulary and readability leveling.
          </p>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>
            Check back soon for the first collection.
          </p>
        </div>
      </section>
    </Layout>
  );
}