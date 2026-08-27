import Link from 'next/link'
import Layout from '@/components/Layout'

export const metadata = {
  title: 'Auth Error — Bayt al-Hikmah',
}

export default function AuthCodeErrorPage() {
  return (
    <Layout>
      <div style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h1
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '1.75rem',
            color: '#0a2540',
            marginBottom: '0.75rem',
          }}
        >
          Authentication Error
        </h1>
        <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Something went wrong during the sign-in process. This could be a temporary issue.
          Please try signing in again.
        </p>
        <Link
          href="/auth/"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: '#0a2540',
            color: '#f8f6f2',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Try Again →
        </Link>
      </div>
    </Layout>
  )
}