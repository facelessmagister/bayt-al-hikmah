import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse, type NextRequest } from 'next/server'

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { userId } = await auth()
  const path = request.nextUrl.pathname

  // Protect admin pages — require authentication
  if (path.startsWith('/admin/') || path.startsWith('/profile/') || path.startsWith('/dashboard/')) {
    if (!userId) {
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.url)
      return NextResponse.redirect(signInUrl)
    }
  }

  // Protect API routes — require authentication
  if (path.startsWith('/api/progress') ||
      path.startsWith('/api/courses/') && (path.includes('/enroll') || path.includes('/complete')) ||
      path.startsWith('/api/competitions/') && (path.includes('/register') || path.includes('/submit')) ||
      path.startsWith('/api/admin/')) {
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip static files and images, run on all other routes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}