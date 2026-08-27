import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// GET: Fetch user's reading progress
export async function GET(request: Request) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const contentType = searchParams.get('content_type')
  const contentSlug = searchParams.get('content_slug')

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let query = supabase
    .from('reading_progress')
    .select('*')
    .eq('user_id', session.user.id)
    .order('last_read_at', { ascending: false })

  if (contentType) {
    query = query.eq('content_type', contentType)
  }
  if (contentSlug) {
    query = query.eq('content_slug', contentSlug)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST: Save or update reading progress
export async function POST(request: Request) {
  const supabase = createClient()
  const body = await request.json()
  const { content_type, content_slug, chapter_num, completion_percent, language } = body

  if (!content_type || !content_slug || !language) {
    return NextResponse.json(
      { error: 'Missing required fields: content_type, content_slug, language' },
      { status: 400 }
    )
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('reading_progress')
    .upsert(
      {
        user_id: session.user.id,
        content_type,
        content_slug,
        chapter_num,
        completion_percent: Math.min(100, Math.max(0, completion_percent || 0)),
        language,
        last_read_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,content_slug,language',
      }
    )
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE: Remove reading progress entry
export async function DELETE(request: Request) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const contentSlug = searchParams.get('content_slug')
  const language = searchParams.get('language')

  if (!contentSlug || !language) {
    return NextResponse.json(
      { error: 'Missing content_slug or language' },
      { status: 400 }
    )
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('reading_progress')
    .delete()
    .eq('user_id', session.user.id)
    .eq('content_slug', contentSlug)
    .eq('language', language)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
