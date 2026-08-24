import Link from 'next/link';
import Layout from '@/components/Layout';
import { getManifest, getArticlesForAge } from '@/lib/young-learners';

export const metadata = {
  title: 'Young Learners — Bayt al-Hikmah',
};

export default function YoungLearnersPage() {
  const manifest = getManifest();
  const totalArticles = manifest.ageGroups.reduce(
    (sum, g) => sum + getArticlesForAge(g.id).length,
    0
  );

  return (
    <Layout>
      {/* Hero */}
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
        <div style={{ marginTop: '1.5rem' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '0.3rem 0.8rem',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#c4a35a',
              background: 'rgba(196, 163, 90, 0.15)',
              border: '1px solid rgba(196, 163, 90, 0.3)',
            }}
          >
            {totalArticles} articles across {manifest.ageGroups.length} age groups
          </span>
        </div>
      </section>

      {/* Age Group Cards */}
      <section style={{ padding: '3rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {manifest.ageGroups.map(group => {
            const articles = getArticlesForAge(group.id);
            return (
              <Link
                key={group.id}
                href={`/young-learners/${group.id}/`}
                style={{
                  display: 'block',
                  padding: '2rem',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  color: '#2C3E50',
                  backgroundColor: group.color,
                  border: '3px solid rgba(255,255,255,0.5)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                className="yl-age-card"
              >
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    color: '#2C3E50',
                    marginBottom: '0.25rem',
                    fontFamily: '"Source Sans 3", sans-serif',
                  }}
                >
                  {group.label}
                </div>
                <h2
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: '#34495E',
                    marginBottom: '0.75rem',
                    fontFamily: '"Source Sans 3", sans-serif',
                  }}
                >
                  {group.subtitle}
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span className="yl-badge">{group.cefr}</span>
                  <span className="yl-badge">{group.wordRange} words</span>
                  <span className="yl-badge">{articles.length} articles</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Articles */}
      <section style={{ padding: '2rem 2rem 3rem', maxWidth: '800px', margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '1.5rem',
            color: '#0a2540',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}
        >
          Recent Articles
        </h2>
        <div>
          {manifest.ageGroups.map(group => {
            const articles = getArticlesForAge(group.id);
            return articles.slice(0, 2).map(article => (
              <Link
                key={`${group.id}-${article.slug}`}
                href={`/young-learners/${group.id}/${article.slug}/`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  background: '#fff',
                  borderRadius: '10px',
                  marginBottom: '0.75rem',
                  textDecoration: 'none',
                  color: '#0a2540',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  borderLeft: `5px solid ${group.color}`,
                }}
                className="yl-article-card"
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{article.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.2rem' }}>
                    {group.label} · {article.topic} · {article.wordCount} words
                  </div>
                </div>
                <span style={{ color: '#c45c3e', fontSize: '0.85rem', fontWeight: 600 }}>Read →</span>
              </Link>
            ));
          })}
        </div>
      </section>
    </Layout>
  );
}