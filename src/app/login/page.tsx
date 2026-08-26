import { redirect } from 'next/navigation'

export default function LoginRedirect({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const next = searchParams?.next
  const query = next ? `?next=${encodeURIComponent(next as string)}` : ''
  redirect(`/auth/${query}`)
}