import { createClient } from '@/utils/supabase/server'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function CoursePlayerPage({
  params,
}: {
  params: { slug: string; lessonId: string }
}) {
  const supabase = createClient()
  const { slug, lessonId } = params

  // Fetch course
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!course) {
    redirect('/courses/')
  }

  // Fetch all lessons
  const { data: lessons } = await supabase
    .from('course_lessons')
    .select('*')
    .eq('course_id', course.id)
    .order('"order"', { ascending: true })

  const sortedLessons = lessons || []
  const currentLesson = sortedLessons.find((l: any) => l.id === lessonId)

  if (!currentLesson) {
    redirect(`/course/${slug}/`)
  }

  const currentIndex = sortedLessons.findIndex((l: any) => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null

  // Check enrollment
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect(`/login/?next=/course/${slug}/lesson/${lessonId}/`)
  }

  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('course_id', course.id)
    .single()

  if (!enrollment) {
    redirect(`/course/${slug}/`)
  }

  // Fetch lesson content using content_slug from database
  let lessonContent = ''
  let lessonHtml = ''
  if (currentLesson?.content_slug) {
    try {
      const fs = await import('fs')
      const path = await import('path')
      // content_slug is like "iron-deficiency-anemia-in-women/lesson-1"
      const contentPath = path.join(process.cwd(), 'content', 'courses', `${currentLesson.content_slug}.md`)
      if (fs.existsSync(contentPath)) {
        lessonContent = fs.readFileSync(contentPath, 'utf-8')
        const { remark } = await import('remark')
        const remarkHtml = await import('remark-html')
        const processed = await remark().use(remarkHtml.default || remarkHtml).process(lessonContent)
        lessonHtml = processed.toString()
      }
    } catch (err) {
      console.error('Error loading lesson content:', err)
    }
  }

  return (
    <Layout>
      <div style={{ background: '#f8f6f2', minHeight: '100vh' }}>
        {/* Top bar */}
        <div
          style={{
            background: '#0a2540',
            color: '#f8f6f2',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <Link
            href={`/course/${slug}/`}
            style={{ color: '#f8f6f2', textDecoration: 'none', fontSize: '0.85rem' }}
          >
            ← {course.title}
          </Link>
          <span style={{ fontSize: '0.8rem', color: '#b0c4de' }}>
            Lesson {currentIndex + 1} / {sortedLessons.length}
          </span>
        </div>

        <div style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Sidebar: Lesson list */}
          <aside
            className="course-sidebar"
            style={{
              width: '280px',
              background: '#fff',
              borderRight: '1px solid #eee',
              padding: '1.5rem',
              display: 'none',
            }}
          >
            <h3
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '1rem',
                color: '#0a2540',
                marginBottom: '1rem',
              }}
            >
              Course Content
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sortedLessons.map((lesson: any, index: number) => (
                <Link
                  key={lesson.id}
                  href={`/course/${slug}/lesson/${lesson.id}/`}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    color: lesson.id === lessonId ? '#fff' : '#333',
                    background: lesson.id === lessonId ? '#0a2540' : 'transparent',
                  }}
                >
                  {index + 1}. {lesson.title}
                </Link>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <main className="course-main" style={{ flex: 1, padding: '2rem', maxWidth: '760px', margin: '0 auto' }}>
            <h1
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '1.75rem',
                color: '#0a2540',
                marginBottom: '1rem',
              }}
            >
              {currentLesson.title}
            </h1>

            {currentLesson.description && (
              <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.95rem' }}>{currentLesson.description}</p>
            )}

            {/* Lesson content */}
            {lessonContent ? (
              <article
                style={{
                  lineHeight: 1.8,
                  color: '#1a1a1a',
                  fontSize: '16px',
                }}
                dangerouslySetInnerHTML={{ __html: lessonHtml }}
              />
            ) : (
              <div
                style={{
                  background: '#fff',
                  borderRadius: '8px',
                  padding: '2rem',
                  border: '1px dashed #ddd',
                  textAlign: 'center',
                  color: '#888',
                }}
              >
                <p>Lesson content coming soon.</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  This lesson is still being prepared.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div
              style={{
                marginTop: '3rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #ddd',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                {prevLesson && (
                  <Link
                    href={`/course/${slug}/lesson/${prevLesson.id}/`}
                    style={{ color: '#0a2540', textDecoration: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>←</span>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#888' }}>Previous</div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{prevLesson.title}</div>
                      </div>
                    </div>
                  </Link>
                )}
              </div>

              {nextLesson ? (
                <Link
                  href={`/course/${slug}/lesson/${nextLesson.id}/`}
                  style={{ color: '#0a2540', textDecoration: 'none' }}
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
                      <div style={{ fontSize: '0.7rem', color: '#888' }}>Next</div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{nextLesson.title}</div>
                    </div>
                    <span>→</span>
                  </div>
                </Link>
              ) : (
                <form action={`/api/courses/${slug}/complete/`} method="POST">
                  <button
                    type="submit"
                    style={{
                      padding: '0.6rem 1.2rem',
                      background: '#c45c3e',
                      color: '#fff',
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Mark Course Complete
                  </button>
                </form>
              )}
            </div>
          </main>
        </div>
      </div>
    </Layout>
  )
}
