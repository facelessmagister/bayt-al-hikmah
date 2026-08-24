import Link from 'next/link';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import matter from 'gray-matter';
import Layout from '@/components/Layout';
import { getManifest, getArticlesForAge, getAgeGroup, getArticleContent } from '@/lib/young-learners';

export async function generateStaticParams() {
  const manifest = getManifest();
  const params: { ageId: string; slug: string }[] = [];
  for (const group of manifest.ageGroups) {
    const articles = getArticlesForAge(group.id);
    for (const article of articles) {
      params.push({ ageId: group.id, slug: article.slug });
    }
  }
  return params;
}

export function generateMetadata({ params }: { params: { ageId: string; slug: string } }) {
  const articles = getArticlesForAge(params.ageId);
  const meta = articles.find(a => a.slug === params.slug);
  return {
    title: meta ? `${meta.title} — Young Learners — Bayt al-Hikmah` : 'Young Learners — Bayt al-Hikmah',
  };
}

export default async function ArticlePage({ params }: { params: { ageId: string; slug: string } }) {
  const group = getAgeGroup(params.ageId);
  const articles = getArticlesForAge(params.ageId);
  const meta = articles.find(a => a.slug === params.slug);

  if (!group || !meta) {
    return (
      <Layout>
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <p style={{ color: '#666' }}>Article not found.</p>
          <Link href="/young-learners/" style={{ color: '#c45c3e' }}>← Back to Young Learners</Link>
        </div>
      </Layout>
    );
  }

  const raw = getArticleContent(params.ageId, params.slug);
  const { content } = matter(raw);

  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml)
    .process(content);

  // Add lazy loading + no-referrer to images
  const html = String(processed).replace(
    /<img /g,
    '<img loading="lazy" referrerpolicy="no-referrer" '
  );

  return (
    <Layout>
      {/* Breadcrumb bar */}
      <div
        style={{
          background: group.color,
          padding: '0.75rem 2rem',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', fontSize: '0.85rem' }}>
          <Link
            href="/young-learners/"
            style={{ color: '#2C3E50', textDecoration: 'none', fontWeight: 600 }}
          >
            Young Learners
          </Link>
          <span style={{ color: '#2C3E50', opacity: 0.6, margin: '0 0.4rem' }}>/</span>
          <Link
            href={`/young-learners/${params.ageId}/`}
            style={{ color: '#2C3E50', textDecoration: 'none', fontWeight: 600 }}
          >
            {group.label}
          </Link>
          <span style={{ color: '#2C3E50', opacity: 0.6, margin: '0 0.4rem' }}>/</span>
          <span style={{ color: '#2C3E50', opacity: 0.8 }}>{meta.title}</span>
        </div>
      </div>

      {/* Article */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>
        {/* Meta bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <span className="yl-meta-badge" style={{ background: group.color }}>{group.label}</span>
          <span className="yl-meta-badge">{meta.topic}</span>
          <span className="yl-meta-badge">{meta.wordCount} words</span>
          <span className="yl-meta-badge">Flesch: {meta.fleschEase}</span>
        </div>

        <article
          className="yl-article-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Footer */}
        <div
          style={{
            marginTop: '2.5rem',
            paddingTop: '1.5rem',
            borderTop: '2px dashed #e0e0e0',
          }}
        >
          <Link
            href={`/young-learners/${params.ageId}/`}
            style={{
              color: '#c45c3e',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            ← More articles for {group.label}
          </Link>
        </div>
      </div>
    </Layout>
  );
}