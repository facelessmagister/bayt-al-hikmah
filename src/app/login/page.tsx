import { redirect } from 'next/navigation'

export default function LoginRedirect({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const next = searchParams?.next
  const query = next ? `?redirect_url=${encodeURIComponent(next as string)}` : ''
  redirect(`/sign-in${query}`)
}