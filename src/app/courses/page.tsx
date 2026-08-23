import { createClient } from '@/utils/supabase/server'
import Layout from '@/components/Layout'
import Link from 'next/link'

export default async function CoursesPage() {
  const supabase = createClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('*, course_lessons(id)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  const coursesWithLessonCount = (courses || []).map((course) => ({
    ...course,
    lessonCount: course.course_lessons?.length || 0,
  }))

  return (
    <Layout>
      <section
        style={{
          background: 'linear-gradient(135deg, #0a2540 0%, #0d2d4f 100%)',
          color: '#f8f6f2',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '2.5rem',
            marginBottom: '0.5rem',
          }}
        >
          Courses
        </h1>
        <p style={{ fontSize: '1rem', color: '#b0c4de', maxWidth: '600px', margin: '0 auto' }}>
          Structured learning paths to deepen your understanding of Islamic knowledge and beyond.
        </p>
      </section>

      <section style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {coursesWithLessonCount.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '1rem' }}>No courses available yet.</p>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>Check back soon for new educational content.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {coursesWithLessonCount.map((course) => (
              <Link
                key={course.id}
                href={`/course/${course.slug}/`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '1.75rem',
                  textDecoration: 'none',
                  color: '#0a2540',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #eee',
                  transition: 'transform 0.2s',
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: '#e3eaf2',
                    color: '#0a2540',
                    marginBottom: '0.75rem',
                    alignSelf: 'flex-start',
                  }}
                >
                  {course.lessonCount} lessons
                </div>
                <h2
                  style={{
                    fontFamily: '"DM Serif Display", serif',
                    fontSize: '1.35rem',
                    marginBottom: '0.5rem',
                    lineHeight: 1.3,
                  }}
                >
                  {course.title}
                </h2>
                <p
                  style={{
                    color: '#666',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    marginBottom: '1rem',
                  }}
                >
                  {course.description}
                </p>
                <div
                  style={{
                    marginTop: 'auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>
                    Free
                  </span>
                  <span
                    style={{
                      color: '#c45c3e',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    Enroll →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
}
