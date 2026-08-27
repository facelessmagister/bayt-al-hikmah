import { createClient } from '@/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// POST: Create or update a translation project (admin only)
export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  // Parse form data
  const contentType = request.headers.get('content-type') || ''
  let fields: Record<string, any>

  if (contentType.includes('application/json')) {
    fields = await request.json()
  } else {
    const formData = await request.formData()
    const entries = Array.from(formData.entries())
    fields = {}
    for (const [key, value] of entries) {
      fields[key] = value
    }
  }

  const slug = fields.slug
  if (!slug || !fields.title) {
    return NextResponse.json({ error: 'slug and title are required' }, { status: 400 })
  }

  // Build the record
  const record: Record<string, any> = {
    slug,
    title: fields.title,
    source_language: fields.source_language || 'ar',
    target_language: fields.target_language || 'en',
    author: fields.author || null,
    source_description: fields.source_description || null,
    total_chapters: parseInt(fields.total_chapters) || 0,
    completed_chapters: 0,
    translator_name: fields.translator_name || null,
    status: 'planning',
  }

  // Upsert (insert or update if slug exists)
  const { data, error } = await supabase
    .from('translation_projects')
    .upsert(record, { onConflict: 'slug' })
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Redirect back to admin translations (for form POST)
  return NextResponse.redirect(new URL('/admin/translations/', request.url))
}

// PATCH: Update project progress (admin only)
export async function PATCH(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json()
  const { slug, ...updates } = body

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('translation_projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('slug', slug)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ project: data })
}