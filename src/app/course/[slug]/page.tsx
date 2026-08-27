import { createClient } from '@/utils/supabase/server'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()
  const slug = params.slug
  const justEnrolled = searchParams?.enrolled === '1'

  // Fetch course with lessons
  const { data: course } = await supabase
    .from('courses')
    .select('*, course_lessons(*)')
    .eq('slug', slug)
    .single()

  if (!course) {
    redirect('/courses/')
  }

  const lessons = course.course_lessons || []
  const sortedLessons = lessons.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

  // Check enrollment status
  const { data: { session } } = await supabase.auth.getSession()
  let isEnrolled = false
  let enrollmentStatus = null
  let completedLessonIds = new Set<string>()
  let completedCount = 0
  let progressPercent = 0

  if (session) {
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('course_id', course.id)
      .single()

    if (enrollment) {
      isEnrolled = true
      enrollmentStatus = enrollment.status

      // Fetch completed lessons
      const lessonIds = sortedLessons.map((l: any) => l.id)
      if (lessonIds.length > 0) {
        const { data: progress } = await supabase
          .from('course_progress')
          .select('lesson_id')
          .eq('user_id', session.user.id)
          .in('lesson_id', lessonIds)

        completedLessonIds = new Set((progress || []).map((p: any) => p.lesson_id))
        completedCount = completedLessonIds.size
        progressPercent = sortedLessons.length > 0
          ? Math.round((completedCount / sortedLessons.length) * 100)
          : 0
      }
    }
  }

  return (
    <Layout>
      {/* Success banner after enrollment */}
      {justEnrolled && (
        <div
          style={{
            background: 'rgba(74, 222, 128, 0.15)',
            border: '1px solid #4ade80',
            borderRadius: '8px',
            padding: '1rem 1.5rem',
            margin: '1.5rem auto',
            maxWidth: '800px',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, color: '#0a2540' }}>✓ Successfully enrolled!</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#666' }}>You can now access all lessons.</p>
        </div>
      )}

      <section
        style={{
          background: 'linear-gradient(135deg, #0a2540 0%, #0d2d4f 100%)',
          color: '#f8f6f2',
          padding: '4rem 2rem',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Link
            href="/courses/"
            style={{ color: '#b0c4de', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-block', marginBottom: '1rem' }}
          >
            ← All Courses
          </Link>
          <h1
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '2.5rem',
              marginBottom: '0.75rem',
              lineHeight: 1.2,
            }}
          >
            {course.title}
          </h1>
          <p style={{ fontSize: '1rem', color: '#b0c4de', lineHeight: 1.6 }}>
            {course.description}
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <Stat label="Lessons" value={sortedLessons.length} />
            <Stat label="Status" value={course.status === 'open' ? 'Open for enrollment' : course.status} />
            <Stat label="Price" value="Free" />
          </div>

          {/* Progress bar for enrolled users */}
          {isEnrolled && (
            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#b0c4de' }}>Your Progress</span>
                <span style={{ fontSize: '0.85rem', color: '#c4a35a', fontWeight: 700 }}>
                  {completedCount} / {sortedLessons.length} lessons · {progressPercent}%
                </span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.15)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: progressPercent === 100 ? '#4ade80' : '#c4a35a',
                  borderRadius: '5px',
                  transition: 'width 0.3s',
                }} />
              </div>
            </div>
          )}

          {/* Enrollment CTA */}
          <div style={{ marginTop: '2rem' }}>
            {isEnrolled ? (
              <div>
                {sortedLessons.length > 0 && (
                  <Link
                    href={`/course/${course.slug}/lesson/${completedCount < sortedLessons.length
                      ? (sortedLessons.find((l: any) => !completedLessonIds.has(l.id)) || sortedLessons[0])?.id
                      : sortedLessons[0]?.id}/`}
                    style={{
                      display: 'inline-block',
                      padding: '0.85rem 1.75rem',
                      background: '#c4a35a',
                      color: '#0a2540',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '1rem',
                    }}
                  >
                    {enrollmentStatus === 'completed' ? 'Review Course' :
                     completedCount > 0 ? 'Continue Learning →' : 'Start Course →'}
                  </Link>
                )}
                {enrollmentStatus === 'completed' && (
                  <span style={{ marginLeft: '1rem', color: '#4ade80', fontSize: '0.85rem' }}>✓ Completed</span>
                )}
              </div>
            ) : (
              <form action={`/api/courses/${course.slug}/enroll/`} method="POST">
                <button
                  type="submit"
                  style={{
                    padding: '0.85rem 1.75rem',
                    background: '#c4a35a',
                    color: '#0a2540',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: 'pointer',
                  }}
                >
                  Enroll Now — Free
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Lessons */}
      <section style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '1.5rem',
            color: '#0a2540',
            marginBottom: '1.5rem',
          }}
        >
          Course Content
        </h2>

        {sortedLessons.length === 0 ? (
          <p style={{ color: '#666' }}>No lessons published yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {sortedLessons.map((lesson: any, index: number) => {
              const isCompleted = completedLessonIds.has(lesson.id)
              return (
                <Link
                  key={lesson.id}
                  href={`/course/${course.slug}/lesson/${lesson.id}/`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    background: '#fff',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#0a2540',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s',
                    border: '1px solid #eee',
                    opacity: isEnrolled ? 1 : 0.6,
                  }}
                  className="chapter-row"
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isCompleted ? '#16a34a' : isEnrolled ? '#c4a35a' : '#e3eaf2',
                      color: isCompleted ? '#fff' : isEnrolled ? '#0a2540' : '#888',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      flexShrink: 0,
                    }}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#0a2540', fontSize: '0.95rem' }}>
                      {lesson.title}
                    </div>
                    {lesson.description && (
                      <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '500px' }}>
                        {lesson.description.slice(0, 100)}...
                      </div>
                    )}
                  </div>
                  {isEnrolled && (
                    <span style={{ color: '#c45c3e', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {isCompleted ? 'Review' : 'Start'} →
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </Layout>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8f6f2' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#b0c4de', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  )
}