'use client';

import { useState } from 'react';
import Link from 'next/link';
import UserNav from './UserNav';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header
        style={{
          background: '#0a2540',
          color: '#f8f6f2',
          padding: '0.75rem 1rem',
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
            gap: '0.5rem',
          }}
        >
          <span style={{ fontFamily: '"Amiri", serif', fontSize: '1.3rem', color: '#c4a35a' }}>
            بيت الحكمة
          </span>
          <span className="header-title" style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '0.02em' }}>
            Bayt al-Hikmah
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="nav-desktop" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <NavLink href="/library/">Library</NavLink>
          <NavLink href="/courses/">Academy</NavLink>
          <NavLink href="/young-learners/">Young Learners</NavLink>
          <NavLink href="/competitions/">Competitions</NavLink>
          <NavLink href="/translation/">Translation</NavLink>
          <NavLink href="/scholars/">Scholars</NavLink>
          <NavLink href="/about/">About</NavLink>
          <UserNav />
        </nav>

        {/* Mobile right side: user nav + hamburger */}
        <div className="nav-mobile-toggle" style={{ display: 'none', alignItems: 'center', gap: '0.75rem' }}>
          <UserNav />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <span style={{ width: '22px', height: '2px', background: '#f8f6f2', borderRadius: '1px', transition: 'transform 0.2s', transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
            <span style={{ width: '22px', height: '2px', background: '#f8f6f2', borderRadius: '1px', opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
            <span style={{ width: '22px', height: '2px', background: '#f8f6f2', borderRadius: '1px', transition: 'transform 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(3px, -3px)' : 'none' }} />
          </button>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <>
          <div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 98 }}
            onClick={() => setMenuOpen(false)}
          />
          <nav
            className="nav-mobile"
            style={{
              position: 'fixed',
              top: '56px',
              left: 0,
              right: 0,
              background: '#0a2540',
              padding: '1rem',
              zIndex: 99,
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
            }}
          >
            <MobileLink href="/library/" onClick={() => setMenuOpen(false)}>Library</MobileLink>
            <MobileLink href="/courses/" onClick={() => setMenuOpen(false)}>Academy</MobileLink>
            <MobileLink href="/young-learners/" onClick={() => setMenuOpen(false)}>Young Learners</MobileLink>
            <MobileLink href="/competitions/" onClick={() => setMenuOpen(false)}>Competitions</MobileLink>
            <MobileLink href="/translation/" onClick={() => setMenuOpen(false)}>Translation</MobileLink>
            <MobileLink href="/scholars/" onClick={() => setMenuOpen(false)}>Scholars</MobileLink>
            <MobileLink href="/about/" onClick={() => setMenuOpen(false)}>About</MobileLink>
          </nav>
        </>
      )}

      <main>{children}</main>

      <footer
        style={{
          background: '#0a2540',
          color: '#f8f6f2',
          padding: '2.5rem 1rem',
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

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{ color: '#b0c4de', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
      className="nav-link"
    >
      {children}
    </Link>
  );
}

function MobileLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        color: '#b0c4de',
        textDecoration: 'none',
        fontSize: '1rem',
        padding: '0.85rem 0.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        transition: 'color 0.2s',
      }}
      className="nav-link"
    >
      {children}
    </Link>
  );
}