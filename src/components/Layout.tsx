'use client';

import Link from 'next/link';
import UserNav from './UserNav';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header
        style={{
          background: '#0a2540',
          color: '#f8f6f2',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: '"Source Sans 3", sans-serif',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        }}
      >
        <Link
          href="/"
          style={{
            color: '#f8f6f2',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <span style={{ fontFamily: '"Amiri", serif', fontSize: '1.5rem', color: '#c4a35a' }}>
            بيت الحكمة
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.02em' }}>
            Bayt al-Hikmah
          </span>
        </Link>
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link
            href="/library/"
            style={{ color: '#b0c4de', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
            className="nav-link"
          >
            Library
          </Link>
          <Link
            href="/courses/"
            style={{ color: '#b0c4de', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
            className="nav-link"
          >
            Academy
          </Link>
          <Link
            href="/young-learners/"
            style={{ color: '#b0c4de', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
            className="nav-link"
          >
            Young Learners
          </Link>
          <Link
            href="/competitions/"
            style={{ color: '#b0c4de', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
            className="nav-link"
          >
            Competitions
          </Link>
          <Link
            href="/translation/"
            style={{ color: '#b0c4de', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
            className="nav-link"
          >
            Translation
          </Link>
          <Link
            href="/scholars/"
            style={{ color: '#b0c4de', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
            className="nav-link"
          >
            Scholars
          </Link>
          <Link
            href="/about/"
            style={{ color: '#b0c4de', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
            className="nav-link"
          >
            About
          </Link>
          <UserNav />
        </nav>
      </header>
      <main>{children}</main>
      <footer
        style={{
          background: '#0a2540',
          color: '#f8f6f2',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          fontFamily: '"Source Sans 3", sans-serif',
          fontSize: '0.85rem',
          marginTop: '4rem',
        }}
      >
        <p style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontFamily: '"Amiri", serif', color: '#c4a35a', fontSize: '1.1rem' }}>
            بيت الحكمة
          </span>{' '}
          — Bayt al-Hikmah
        </p>
        <p style={{ color: '#b0c4de', fontSize: '0.8rem' }}>
          House of Wisdom — a center for Islamic education, translation, and the sciences.
        </p>
        <p style={{ color: '#6b8ca0', fontSize: '0.75rem', marginTop: '0.75rem' }}>
          All content is freely available for reading and study.
        </p>
      </footer>
    </>
  );
}