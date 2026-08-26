'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

interface UserProfile {
  id: string
  name: string | null
  email: string
  avatar_url: string | null
  role: string
}

export default function UserNav() {
  const supabase = createClient()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          setUser({
            id: session.user.id,
            name: profile.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            avatar_url: profile.avatar_url,
            role: profile.role,
          })
        } else {
          // Profile not yet created — use basic info
          setUser({
            id: session.user.id,
            name: session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            avatar_url: null,
            role: 'student',
          })
        }
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        getUser()
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div style={{ color: '#b0c4de', fontSize: '0.9rem' }}>
        Loading...
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <Link
          href="/auth/"
          style={{
            color: '#0a2540',
            background: '#c4a35a',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            padding: '0.4rem 0.9rem',
            borderRadius: '6px',
            transition: 'background 0.2s',
          }}
        >
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#f8f6f2',
          fontFamily: '"Source Sans 3", sans-serif',
          fontSize: '0.9rem',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#c4a35a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: '0.85rem',
            color: '#0a2540',
          }}
        >
          {user.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.name}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#b0c4de" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {dropdownOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 50,
            }}
            onClick={() => setDropdownOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 0.5rem)',
              right: 0,
              background: '#fff',
              borderRadius: '8px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
              padding: '0.5rem',
              minWidth: '180px',
              zIndex: 60,
            }}
          >
            <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #eee', marginBottom: '0.25rem' }}>
              <div style={{ fontWeight: 600, color: '#0a2540', fontSize: '0.85rem' }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>{user.email}</div>
            </div>
            <Link
              href="/profile/"
              onClick={() => setDropdownOpen(false)}
              style={{
                display: 'block',
                padding: '0.5rem 0.75rem',
                color: '#333',
                textDecoration: 'none',
                fontSize: '0.85rem',
                borderRadius: '4px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f6f2')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Profile
            </Link>
            <button
              onClick={handleSignOut}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '0.5rem 0.75rem',
                color: '#c45c3e',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                borderRadius: '4px',
                transition: 'background 0.15s',
                marginTop: '0.25rem',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f6f2')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
