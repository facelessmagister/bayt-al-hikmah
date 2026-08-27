import { createClient } from '@/utils/supabase/server'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import LessonCompleteButton from '@/components/LessonCompleteButton'

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
    redirect(`/auth/?next=/course/${slug}/lesson/${lessonId}/`)
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

  // Fetch user's progress for this course (which lessons are completed)
  const allLessonIds = sortedLessons.map((l: any) => l.id)
  const { data: progressRecords } = await supabase
    .from('course_progress')
    .select('lesson_id')
    .eq('user_id', session.user.id)
    .in('lesson_id', allLessonIds)

  const completedLessonIds = new Set((progressRecords || []).map((p: any) => p.lesson_id))
  const completedCount = completedLessonIds.size
  const totalLessons = sortedLessons.length
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  const isCurrentCompleted = completedLessonIds.has(lessonId)

  // Fetch lesson content using content_slug from database
  let lessonContent = ''
  let lessonHtml = ''
  if (currentLesson?.content_slug) {
    try {
      const fs = await import('fs')
      const path = await import('path')
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
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <Link
            href={`/course/${slug}/`}
            style={{ color: '#f8f6f2', textDecoration: 'none', fontSize: '0.85rem' }}
          >
            ← {course.title}
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#b0c4de' }}>
              Lesson {currentIndex + 1} / {sortedLessons.length}
            </span>
            {/* Progress bar in top bar */}
            <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPercent}%`, background: '#c4a35a', borderRadius: '3px', transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#c4a35a', fontWeight: 600 }}>{progressPercent}%</span>
          </div>
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
              {sortedLessons.map((lesson: any, index: number) => {
                const isCompleted = completedLessonIds.has(lesson.id)
                const isCurrent = lesson.id === lessonId
                return (
                  <Link
                    key={lesson.id}
                    href={`/course/${slug}/lesson/${lesson.id}/`}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      color: isCurrent ? '#fff' : '#333',
                      background: isCurrent ? '#0a2540' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem' }}>
                      {isCompleted ? '✓' : `${index + 1}.`}
                    </span>
                    <span>{lesson.title}</span>
                  </Link>
                )
              })}
            </div>
          </aside>

          {/* Main content */}
          <main className="course-main" style={{ flex: 1, padding: '2rem', maxWidth: '760px', margin: '0 auto' }}>
            {/* Phase/Week indicator */}
            <div
              style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: '#e3eaf2',
                color: '#0a2540',
                marginBottom: '1rem',
              }}
            >
              Week {currentIndex + 1} of {totalLessons}
            </div>

            <h1
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '1.75rem',
                color: '#0a2540',
                marginBottom: '1rem',
                lineHeight: 1.3,
              }}
            >
              {currentLesson.title}
            </h1>

            {currentLesson.description && (
              <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.6 }}>{currentLesson.description}</p>
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

            {/* Completion + Navigation */}
            <div
              style={{
                marginTop: '3rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #ddd',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
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

              <LessonCompleteButton
                courseSlug={slug}
                lessonId={lessonId}
                alreadyCompleted={isCurrentCompleted}
                isLastLesson={!nextLesson}
                nextLessonId={nextLesson?.id}
              />
            </div>

            {/* Course progress summary */}
            <div
              style={{
                marginTop: '2rem',
                padding: '1rem 1.25rem',
                background: '#fff',
                borderRadius: '8px',
                border: '1px solid #eee',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                Course Progress: {completedCount} of {totalLessons} lessons complete
              </div>
              <div style={{ width: '100%', height: '8px', background: '#e3eaf2', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progressPercent}%`, background: progressPercent === 100 ? '#16a34a' : '#c45c3e', borderRadius: '4px', transition: 'width 0.3s' }} />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.35rem' }}>
                {progressPercent === 100 ? '✓ Course Complete!' : `${progressPercent}% complete`}
              </div>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  )
}