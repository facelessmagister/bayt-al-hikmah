import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse, type NextRequest } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/admin/(.*)',
  '/profile/(.*)',
  '/dashboard/(.*)',
])

const isApiProtectedRoute = createRouteMatcher([
  '/api/progress(.*)',
  '/api/courses/(.*)/enroll(.*)',
  '/api/courses/(.*)/complete(.*)',
  '/api/courses/(.*)/lesson/(.*)/complete(.*)',
  '/api/competitions/(.*)/register(.*)',
  '/api/competitions/(.*)/submit(.*)',
  '/api/admin/(.*)',
])

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // Protect admin pages
  if (isProtectedRoute(request)) {
    const { userId } = await auth()
    if (!userId) {
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.url)
      return NextResponse.redirect(signInUrl)
    }
  }

  // Protect API routes
  if (isApiProtectedRoute(request)) {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip static files and images, but run on all other routes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    // Clerk auto-proxy route
    '/__clerk/:path*',
  ],
}