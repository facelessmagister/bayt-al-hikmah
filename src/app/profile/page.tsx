'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@/utils/supabase/client'
import Layout from '@/components/Layout'
import Link from 'next/link'

interface Profile {
  id: string
  name: string
  first_name: string | null
  second_name: string | null
  age: number | null
  phone_number: string | null
  bank_name: string | null
  bank_account_number: string | null
  role: string
  created_at: string
}

interface Enrollment {
  id: string
  course_id: string
  enrolled_at: string
  status: string
  courses: {
    title: string
    slug: string
  }
}

interface CourseProgress {
  lesson_id: string
}

interface Registration {
  id: string
  competition_id: string
  registered_at: string
  payment_status: string
  competitions: {
    title: string
    slug: string
  }
}

export default function ProfilePage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [courseProgress, setCourseProgress] = useState<Record<string, { completed: number; total: number; percent: number }>>({})
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Form state
  const [form, setForm] = useState({
    first_name: '',
    second_name: '',
    age: '',
    phone_number: '',
    bank_name: '',
    bank_account_number: '',
  })

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn || !user) {
      window.location.href = '/sign-in'
      return
    }
    fetchData()
  }, [isLoaded, isSignedIn, user])

  async function fetchData() {
    if (!user) return
    const userId = user.id

    // Profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(profileData || null)
    if (profileData) {
      setForm({
        first_name: profileData.first_name || '',
        second_name: profileData.second_name || '',
        age: profileData.age ? String(profileData.age) : '',
        phone_number: profileData.phone_number || '',
        bank_name: profileData.bank_name || '',
        bank_account_number: profileData.bank_account_number || '',
      })
    }

    // Course enrollments
    const { data: enrollData } = await supabase
      .from('course_enrollments')
      .select('*, courses(title, slug)')
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false })
    const enrollArray = (enrollData as any) || []
    setEnrollments(enrollArray)

    // Fetch lesson counts and progress for each enrolled course
    const progressMap: Record<string, { completed: number; total: number; percent: number }> = {}
    for (const e of enrollArray) {
      const { data: lessons } = await supabase
        .from('course_lessons')
        .select('id')
        .eq('course_id', e.course_id)

      const totalLessons = lessons?.length || 0
      if (totalLessons === 0) {
        progressMap[e.course_id] = { completed: 0, total: 0, percent: 0 }
        continue
      }

      const lessonIds = lessons!.map(l => (l as any).id)
      const { data: completed } = await supabase
        .from('course_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .in('lesson_id', lessonIds)

      const completedCount = completed?.length || 0
      progressMap[e.course_id] = {
        completed: completedCount,
        total: totalLessons,
        percent: Math.round((completedCount / totalLessons) * 100),
      }
    }
    setCourseProgress(progressMap)

    // Competition registrations
    const { data: regData } = await supabase
      .from('competition_registrations')
      .select('*, competitions(title, slug)')
      .eq('user_id', userId)
      .order('registered_at', { ascending: false })
    setRegistrations((regData as any) || [])

    setLoading(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || null,
        name: user.fullName || null,
        first_name: form.first_name || null,
        second_name: form.second_name || null,
        age: form.age ? parseInt(form.age) : null,
        phone_number: form.phone_number || null,
        bank_name: form.bank_name || null,
        bank_account_number: form.bank_account_number || null,
        role: profile?.role || 'student',
      })

    setSaving(false)
    if (error) {
      setMessage('Error saving: ' + error.message)
    } else {
      setMessage('✓ Profile updated successfully')
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
    }
  }

  if (!isLoaded || loading) {
    return (
      <Layout>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
      </Layout>
    )
  }

  const displayName = profile?.first_name && profile?.second_name
    ? `${profile.first_name} ${profile.second_name}`
    : profile?.name || user?.fullName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User'
  const displayEmail = user?.primaryEmailAddress?.emailAddress || ''

  return (
    <Layout>
      {/* Hero */}
      <section
        style={{
          background: '#0a2540',
          color: '#f8f6f2',
          padding: '3rem 2rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Your Profile
        </h1>
        <p style={{ fontSize: '1rem', color: '#b0c4de' }}>
          Manage your account, certificates & prize details
        </p>
      </section>

      <section style={{ padding: '3rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        {/* Personal Info Card */}
        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: '#c4a35a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#0a2540',
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontFamily: '"DM Serif Display", serif', color: '#0a2540', marginBottom: '0.25rem' }}>
                {displayName}
              </h2>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>{displayEmail}</p>
              <span
                style={{
                  display: 'inline-block',
                  marginTop: '0.35rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: '#e3eaf2',
                  color: '#0a2540',
                }}
              >
                {profile?.role || 'student'}
              </span>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSave}>
            <h3
              style={{
                fontFamily: '"DM Serif Display", serif',
                color: '#0a2540',
                marginBottom: '1.25rem',
                fontSize: '1.15rem',
              }}
            >
              Personal Details
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <label style={labelStyle}>First Name</label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  placeholder="e.g. Ahmad"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Second / Family Name</label>
                <input
                  type="text"
                  value={form.second_name}
                  onChange={(e) => setForm({ ...form, second_name: e.target.value })}
                  placeholder="e.g. bin Ismail"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Age</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="e.g. 22"
                  min={0}
                  max={120}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Phone Number (Touch & Go)</label>
                <input
                  type="tel"
                  value={form.phone_number}
                  onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                  placeholder="e.g. +60 12-345 6789"
                  style={inputStyle}
                />
              </div>
            </div>

            <h3
              style={{
                fontFamily: '"DM Serif Display", serif',
                color: '#0a2540',
                marginBottom: '1.25rem',
                fontSize: '1.15rem',
              }}
            >
              Prize Transfer Details
            </h3>
            <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Required if you win a competition prize. Used for certificate printing and bank transfers.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <label style={labelStyle}>Bank Name</label>
                <input
                  type="text"
                  value={form.bank_name}
                  onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                  placeholder="e.g. Maybank, CIMB, Bank Islam"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Bank Account Number</label>
                <input
                  type="text"
                  value={form.bank_account_number}
                  onChange={(e) => setForm({ ...form, bank_account_number: e.target.value })}
                  placeholder="e.g. 1234567890123"
                  style={inputStyle}
                />
              </div>
            </div>

            {message && (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  background: message.startsWith('✓') ? 'rgba(74,222,128,0.15)' : 'rgba(196,92,62,0.1)',
                  color: message.startsWith('✓') ? '#16a34a' : '#c45c3e',
                  fontSize: '0.9rem',
                }}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: '#0a2540',
                color: '#f8f6f2',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.95rem',
              }}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* My Courses */}
        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            marginBottom: '2rem',
          }}
        >
          <h3
            style={{
              fontFamily: '"DM Serif Display", serif',
              color: '#0a2540',
              marginBottom: '1rem',
              fontSize: '1.25rem',
            }}
          >
            My Courses
          </h3>
          {enrollments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {enrollments.map((e) => {
                const prog = courseProgress[e.course_id]
                return (
                  <Link
                    key={e.id}
                    href={`/course/${e.courses?.slug}/`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '1rem',
                      background: '#f8f6f2',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#0a2540',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>{e.courses?.title}</span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          background: e.status === 'completed' ? '#4ade80' : '#c4a35a',
                          color: e.status === 'completed' ? '#fff' : '#0a2540',
                          fontWeight: 600,
                        }}
                      >
                        {e.status === 'completed' ? 'Completed' : 'Active'}
                      </span>
                    </div>
                    {prog && prog.total > 0 && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>
                          <span>{prog.completed} / {prog.total} lessons</span>
                          <span style={{ fontWeight: 600, color: prog.percent === 100 ? '#16a34a' : '#c45c3e' }}>{prog.percent}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#e3eaf2', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${prog.percent}%`,
                            background: prog.percent === 100 ? '#16a34a' : '#c45c3e',
                            borderRadius: '3px',
                            transition: 'width 0.3s',
                          }} />
                        </div>
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          ) : (
            <p style={{ color: '#666' }}>You haven't enrolled in any courses yet.</p>
          )}
        </div>

        {/* My Competitions */}
        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            marginBottom: '2rem',
          }}
        >
          <h3
            style={{
              fontFamily: '"DM Serif Display", serif',
              color: '#0a2540',
              marginBottom: '1rem',
              fontSize: '1.25rem',
            }}
          >
            My Competitions
          </h3>
          {registrations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {registrations.map((r) => (
                <Link
                  key={r.id}
                  href={`/competitions/${r.competitions?.slug}/`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: '#f8f6f2',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#0a2540',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{r.competitions?.title}</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      background:
                        r.payment_status === 'verified'
                          ? '#4ade80'
                          : r.payment_status === 'pending'
                            ? '#fbbf24'
                            : '#eee',
                      color: r.payment_status === 'verified' ? '#fff' : '#0a2540',
                      fontWeight: 600,
                    }}
                  >
                    {r.payment_status === 'verified' ? 'Paid' : r.payment_status === 'pending' ? 'Payment Pending' : r.payment_status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666' }}>You haven't registered for any competitions yet.</p>
          )}
        </div>
      </section>
    </Layout>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  color: '#555',
  marginBottom: '0.35rem',
  fontWeight: 600,
} as const

const inputStyle = {
  width: '100%',
  padding: '0.65rem 0.85rem',
  borderRadius: '6px',
  border: '1px solid #ddd',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
} as const