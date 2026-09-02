'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { createClient } from '@/utils/supabase/client';

interface ChapterReaderProps {
  book: any;
  author: any;
  chapter: any;
  chapterNum: number;
  totalChapters: number;
  prev: any;
  next: any;
  availableLangs: string[];
  currentLang: string;
}

async function markdownToHtml(md: string): Promise<string> {
  const processed = await remark().use(remarkGfm).use(remarkHtml).process(md);
  return processed.toString();
}

export default function ChapterReader({
  book,
  author,
  chapter,
  chapterNum,
  totalChapters,
  prev,
  next,
  availableLangs,
  currentLang,
}: ChapterReaderProps) {
  const [fontSize, setFontSize] = useState(18);
  const [html, setHtml] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const isRTL = currentLang === 'ar';

  useEffect(() => {
    markdownToHtml(chapter.content).then(setHtml);
  }, [chapter.content]);

  // Auto-save reading progress when chapter loads
  const saveProgress = useCallback(async () => {
    const completionPercent = Math.round((chapterNum / totalChapters) * 100)
    try {
      const response = await fetch('/api/progress/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: 'book',
          content_slug: book.slug,
          chapter_num: chapterNum,
          completion_percent: completionPercent,
          language: currentLang,
        }),
      })
      if (response.ok) {
        setSaveStatus('Progress saved')
        setTimeout(() => setSaveStatus(''), 2000)
      }
    } catch (err) {
      console.error('Failed to save progress:', err)
    }
  }, [book.slug, chapterNum, totalChapters, currentLang])

  useEffect(() => {
    saveProgress()
  }, [saveProgress])

  return (
    <div
      style={{
        fontFamily: '"Source Sans 3", sans-serif',
        background: '#f8f6f2',
        minHeight: '100vh',
      }}
    >
      {/* Top bar */}
      <div
        className="reader-topbar"
        style={{
          position: 'sticky',
          top: 0,
          background: '#0a2540',
          color: '#f8f6f2',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 99,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            href={`/book/${book.slug}/`}
            style={{ color: '#f8f6f2', textDecoration: 'none', fontSize: '0.85rem' }}
          >
            ← {book.title.en}
          </Link>
        </div>

        {/* Language toggle */}
        {availableLangs.length > 1 && (
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {availableLangs.map((lang) => (
              <Link
                key={lang}
                href={`/chapter/${book.slug}/${chapterNum}/${lang}/`}
                style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  textDecoration: 'none',
                  fontWeight: 600,
                  background: lang === currentLang ? '#c45c3e' : 'transparent',
                  color: lang === currentLang ? '#fff' : '#b0c4de',
                  border: lang === currentLang ? '1px solid #c45c3e' : '1px solid rgba(255,255,255,0.3)',
                }}
              >
                {lang === 'ar' ? 'العربية' : 'English'}
              </Link>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#b0c4de' }}>
            Ch {chapterNum} / {totalChapters}
          </span>
          {saveStatus && (
            <span
              style={{
                fontSize: '0.75rem',
                color: '#4ade80',
                background: 'rgba(74, 222, 128, 0.15)',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                fontWeight: 500,
              }}
            >
              {saveStatus}
            </span>
          )}
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              onClick={() => setFontSize((f) => Math.max(14, f - 1))}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#f8f6f2',
                padding: '0.2rem 0.45rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.7rem',
              }}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize((f) => Math.min(26, f + 1))}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#f8f6f2',
                padding: '0.2rem 0.45rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.7rem',
              }}
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* Chapter header */}
      <div
        className="reader-header"
        style={{
          padding: '3rem 2rem 1rem',
          maxWidth: '760px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '0.8rem',
            color: '#c45c3e',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '0.5rem',
          }}
        >
          {book.title.en}
        </p>
        <h1
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '2rem',
            color: '#0a2540',
            marginBottom: '0.5rem',
            lineHeight: 1.3,
          }}
        >
          {chapter.title}
        </h1>
        <p style={{ fontSize: '0.8rem', color: '#888' }}>
          {author?.name || book.author} · Chapter {chapterNum}
        </p>
      </div>

      {/* Chapter content */}
      <article
        className="reader-content"
        style={{
          maxWidth: '760px',
          margin: '0 auto',
          padding: '2rem',
          fontSize: `${fontSize}px`,
          lineHeight: isRTL ? 2.0 : 1.8,
          color: '#1a1a1a',
          textAlign: isRTL ? 'right' : 'justify',
          direction: isRTL ? 'rtl' : 'ltr',
          fontFamily: isRTL ? '"Amiri", serif' : '"Source Sans 3", sans-serif',
          hyphens: 'auto',
        }}
      >
        <style jsx>{`
          article h1 { font-family: "DM Serif Display", serif; color: #0a2540; font-size: 1.5em; margin-top: 1.5em; margin-bottom: 0.75em; }
          article h2 { font-family: "DM Serif Display", serif; color: #0a2540; font-size: 1.35em; margin-top: 1.5em; margin-bottom: 0.6em; }
          article h3 { font-family: "DM Serif Display", serif; color: #0a2540; font-size: 1.2em; margin-top: 1.25em; margin-bottom: 0.5em; }
          article p { margin-bottom: 1.2em; }
          article blockquote {
            border-left: 3px solid #c45c3e;
            margin: 1.5em 0;
            padding-left: 1.5em;
            color: #333;
            font-style: italic;
          }
          article sup { color: #c45c3e; font-size: 0.7em; }
          article hr { border: none; border-top: 1px solid #ddd; margin: 2em 0; }
          article ul, article ol { margin-bottom: 1.2em; padding-left: 1.5em; }
          article li { margin-bottom: 0.5em; }
          article strong { color: #0a2540; font-weight: 700; }
          article em { color: #555; }
          article a { color: #c45c3e; text-decoration: underline; text-decoration-color: #c45c3e55; }
          article table { border-collapse: collapse; width: 100%; margin: 1.5em 0; }
          article th, article td { border: 1px solid #ddd; padding: 0.5em 0.75em; text-align: left; }
          article th { background: #f8f6f2; font-weight: 700; color: #0a2540; }
        `}</style>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>

      {/* Chapter navigation */}
      <div
        className="chapter-nav"
        style={{
          maxWidth: '760px',
          margin: '0 auto',
          padding: '0 2rem 3rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          {prev && (
            <Link
              href={`/chapter/${book.slug}/${prev.number}/${currentLang}/`}
              style={{ textDecoration: 'none', color: '#0a2540' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>←</span>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>
                    Previous
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{prev.title}</div>
                </div>
              </div>
            </Link>
          )}
        </div>

        <div>
          <Link href={`/book/${book.slug}/`} style={{ textDecoration: 'none' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a2540',
                color: '#f8f6f2',
                borderRadius: '50%',
                fontSize: '0.8rem',
              }}
            >
              ☰
            </div>
          </Link>
        </div>

        <div>
          {next && (
            <Link
              href={`/chapter/${book.slug}/${next.number}/${currentLang}/`}
              style={{ textDecoration: 'none', color: '#0a2540' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textAlign: 'right',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>
                    Next
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{next.title}</div>
                </div>
                <span style={{ fontSize: '1.5rem' }}>→</span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}