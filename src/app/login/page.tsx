'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      window.location.href = '/'
    }
  }

  async function handleOAuthLogin(provider: 'google' | 'github') {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback/`,
      },
    })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8f6f2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Source Sans 3", sans-serif',
        padding: '2rem',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.75rem',
              color: '#0a2540',
              marginBottom: '0.5rem',
            }}
          >
            Sign In
          </h1>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Welcome back to Bayt al-Hikmah
          </p>
        </div>

        {/* OAuth buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #c4a35a',
              background: 'rgba(196, 163, 90, 0.1)',
              fontSize: '0.85rem',
              color: '#0a2540',
              textAlign: 'center',
            }}
          >
            🔒 OAuth login (Google/GitHub) is being configured.
            <br />
            Please use email/password below.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#eee' }} />
          <span style={{ color: '#999', fontSize: '0.8rem' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#eee' }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.35rem', fontWeight: 600 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.35rem', fontWeight: 600 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {error && (
            <div style={{ color: '#c45c3e', fontSize: '0.85rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              background: '#0a2540',
              color: '#f8f6f2',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '0.5rem',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#666' }}>
          Don't have an account?{' '}
          <Link href="/signup/" style={{ color: '#c45c3e', textDecoration: 'none', fontWeight: 600 }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
