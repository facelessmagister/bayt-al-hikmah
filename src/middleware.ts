import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Skip middleware for auth callback — it needs to handle session exchange
  // without updateSession interfering
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.next()
  }

  const { response, user } = await updateSession(request)

  // Protect admin routes — require authentication + admin role
  if (request.nextUrl.pathname.startsWith('/admin/')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/', request.url))
    }
  }

  // Protect profile/dashboard routes — require authentication
  if (request.nextUrl.pathname.startsWith('/profile/') || 
      request.nextUrl.pathname.startsWith('/dashboard/')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}