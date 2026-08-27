'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export interface ReadingProgress {
  id: string
  user_id: string
  content_type: string
  content_slug: string
  chapter_num: number
  completion_percent: number
  last_read_at: string
  language: string
}

export function useReadingProgress() {
  const supabase = createClient()
  const [progress, setProgress] = useState<ReadingProgress[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchProgress() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', session.user.id)
      .order('last_read_at', { ascending: false })

    if (error) {
      console.error('Error fetching progress:', error)
      setLoading(false)
      return
    }

    setProgress(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchProgress()
  }, [])

  const saveProgress = useCallback(
    async (params: {
      content_type: string
      content_slug: string
      chapter_num: number
      completion_percent: number
      language: string
    }) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { error } = await supabase
        .from('reading_progress')
        .upsert(
          {
            user_id: session.user.id,
            ...params,
            last_read_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,content_slug,language' }
        )

      if (error) {
        console.error('Error saving progress:', error)
        return
      }

      await fetchProgress()
    },
    []
  )

  return { progress, loading, saveProgress, refreshProgress: fetchProgress }
}
