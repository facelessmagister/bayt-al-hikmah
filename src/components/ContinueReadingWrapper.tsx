'use client'

import dynamic from 'next/dynamic'

const ContinueReading = dynamic(() => import('@/components/ContinueReading'), { ssr: false })

interface ContinueReadingWrapperProps {
  books: any[]
  authors: any[]
}

export default function ContinueReadingWrapper({ books, authors }: ContinueReadingWrapperProps) {
  return <ContinueReading books={books} authors={authors} />
}
