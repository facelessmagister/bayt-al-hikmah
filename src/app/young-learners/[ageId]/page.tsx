import Link from 'next/link';
import Layout from '@/components/Layout';
import { getManifest, getArticlesForAge, getAgeGroup } from '@/lib/young-learners';

export async function generateStaticParams() {
  const manifest = getManifest();
  return manifest.ageGroups.map(g => ({ ageId: g.id }));
}

export function generateMetadata({ params }: { params: { ageId: string } }) {
  const group = getAgeGroup(params.ageId);
  return {
    title: `${group?.label || 'Age'} — Young Learners — Bayt al-Hikmah`,
  };
}

export default function AgeGroupPage({ params }: { params: { ageId: string } }) {
  const group = getAgeGroup(params.ageId);
  const articles = getArticlesForAge(params.ageId);

  if (!group) {
    return (
      <Layout>
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <p style={{ color: '#666' }}>Age group not found.</p>
          <Link href="/young-learners/" style={{ color: '#c45c3e' }}>← Back to Young Learners</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero with age-group color */}
      <section
        style={{
          background: group.color,
          padding: '2.5rem 2rem',
          textAlign: 'center',
        }}
      >
        <Link
          href="/young-learners/"
          style={{
            display: 'inline-block',
            color: '#2C3E50',
            textDecoration: 'none',
            fontWeight: 600,
            marginBottom: '0.5rem',
            fontSize: '0.9rem',
          }}
        >
          ← Back to Young Learners
        </Link>
        <h1
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '2.25rem',
            color: '#2C3E50',
            marginBottom: '0.5rem',
          }}
        >
          {group.label} — {group.subtitle}
        </h1>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginTop: '0.75rem',
          }}
        >
          <span className="yl-badge">{group.cefr}</span>
          <span className="yl-badge">{group.wordRange} words per article</span>
          <span className="yl-badge">Flesch Ease: {group.fleschEase}</span>
        </div>
      </section>

      {/* Article List */}
      <section style={{ padding: '2.5rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '1.5rem',
            color: '#0a2540',
            marginBottom: '1.25rem',
          }}
        >
          Articles ({articles.length})
        </h2>
        {articles.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
            No articles yet. Check back soon! ★
          </p>
        ) : (
          <div>
            {articles.map(article => (
              <Link
                key={article.slug}
                href={`/young-learners/${params.ageId}/${article.slug}/`}
                style={{
                  display: 'block',
                  padding: '1.25rem 1.5rem',
                  background: '#fff',
                  borderRadius: '10px',
                  marginBottom: '0.75rem',
                  textDecoration: 'none',
                  color: '#0a2540',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  borderLeft: `5px solid ${group.color}`,
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                className="yl-article-card"
              >
                <div
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 600,
                    marginBottom: '0.3rem',
                  }}
                >
                  {article.title}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.82rem',
                    color: '#888',
                  }}
                >
                  <span>{article.topic}</span>
                  <span>{article.wordCount} words</span>
                  <span>Flesch: {article.fleschEase}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}