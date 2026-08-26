'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useSearchParams } from 'next/navigation'

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f8f6f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#666' }}>Loading...</p></div>}>
      <AuthForm />
    </Suspense>
  )
}

function AuthForm() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') || '/'

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        setSuccess(true)
        setLoading(false)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Provide helpful message for Google OAuth users who try email/password
        if (error.message === 'Invalid login credentials') {
          setError('Invalid email or password. If you signed up with Google, please use the "Continue with Google" button above.')
        } else {
          setError(error.message)
        }
        setLoading(false)
      } else {
        window.location.href = nextUrl
      }
    }
  }

  async function handleGoogleAuth() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `https://bayt-al-hikmah-nine.vercel.app/auth/callback/?next=${encodeURIComponent(nextUrl)}`,
      },
    })
  }

  if (success) {
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
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}
        >
          <h1
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.75rem',
              color: '#0a2540',
              marginBottom: '1rem',
            }}
          >
            Welcome!
          </h1>
          <p style={{ color: '#555', marginBottom: '1.5rem' }}>
            Your account has been created. You are now signed in.
          </p>
          <a
            href="/"
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
            Go to Home
          </a>
        </div>
      </div>
    )
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
          <p
            style={{
              fontFamily: '"Amiri", serif',
              fontSize: '1.5rem',
              color: '#c4a35a',
              marginBottom: '0.25rem',
            }}
          >
            بيت الحكمة
          </p>
          <h1
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '1.75rem',
              color: '#0a2540',
              marginBottom: '0.5rem',
            }}
          >
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h1>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            {mode === 'signin'
              ? 'Welcome back to Bayt al-Hikmah'
              : 'Join Bayt al-Hikmah — the House of Wisdom'}
          </p>
        </div>

        {/* Mode toggle */}
        <div
          style={{
            display: 'flex',
            background: '#f8f6f2',
            borderRadius: '8px',
            padding: '0.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <button
            onClick={() => { setMode('signin'); setError(null) }}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '6px',
              border: 'none',
              background: mode === 'signin' ? '#0a2540' : 'transparent',
              color: mode === 'signin' ? '#f8f6f2' : '#666',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('signup'); setError(null) }}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '6px',
              border: 'none',
              background: mode === 'signup' ? '#0a2540' : 'transparent',
              color: mode === 'signup' ? '#f8f6f2' : '#666',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Google button */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #ddd',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '0.9rem',
              color: '#333',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.793 2.716v2.254h2.9c1.7-1.564 2.683-3.87 2.683-6.611z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.9-2.254c-.806.54-1.836.86-3.056.86-2.35 0-4.344-1.587-5.053-3.727H.96v2.332C2.44 15.983 5.48 18 9 18z"/>
              <path fill="#FBBC05" d="M3.947 10.7c-.18-.54-.282-1.116-.282-1.71s.102-1.17.282-1.71V5.948H.96C.348 7.173 0 8.548 0 9.99s.348 2.817.96 4.042l2.987-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.508.454 3.44 1.345l2.58-2.58C13.463.891 11.426 0 9 0 5.48 0 2.44 2.017.96 4.958L3.947 7.29c.71-2.14 2.703-3.71 5.053-3.71z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#eee' }} />
          <span style={{ color: '#999', fontSize: '0.8rem' }}>or with email</span>
          <div style={{ flex: 1, height: '1px', background: '#eee' }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.35rem', fontWeight: 600 }}>
                Name (optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your display name"
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
          )}
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
              minLength={6}
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
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.35rem', fontWeight: 600 }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
          )}

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
            {loading
              ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
              : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: '#888' }}>
          {mode === 'signin' ? (
            <>
              New to Bayt al-Hikmah?{' '}
              <button
                onClick={() => { setMode('signup'); setError(null) }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c45c3e',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                }}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('signin'); setError(null) }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c45c3e',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                }}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}