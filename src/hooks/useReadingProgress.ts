'use client'

import { useCallback, useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
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
  const { user, isLoaded, isSignedIn } = useUser()
  const supabase = createClient()
  const [progress, setProgress] = useState<ReadingProgress[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProgress = useCallback(async () => {
    if (!isLoaded || !isSignedIn || !user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('last_read_at', { ascending: false })

    if (error) {
      console.error('Error fetching progress:', error)
      setLoading(false)
      return
    }

    setProgress(data || [])
    setLoading(false)
  }, [isLoaded, isSignedIn, user, supabase])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  const saveProgress = useCallback(
    async (params: {
      content_type: string
      content_slug: string
      chapter_num: number
      completion_percent: number
      language: string
    }) => {
      if (!isLoaded || !isSignedIn || !user) return

      const { error } = await supabase
        .from('reading_progress')
        .upsert(
          {
            user_id: user.id,
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
    [isLoaded, isSignedIn, user, supabase, fetchProgress]
  )

  return { progress, loading, saveProgress, refreshProgress: fetchProgress }
}