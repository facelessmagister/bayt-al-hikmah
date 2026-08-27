import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { auth } from '@clerk/nextjs/server'

/**
 * Server-side Supabase client for DATABASE ACCESS ONLY.
 * Authentication is handled by Clerk. This client uses the service role key
 * to bypass RLS and perform DB operations scoped to the Clerk user ID.
 *
 * The Clerk user ID is used as the `user_id` column in all tables,
 * replacing the old Supabase Auth user ID.
 */
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Called from a Server Component — ignored
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Called from a Server Component — ignored
          }
        },
      },
    }
  )
}

/**
 * Get the current Clerk user's ID on the server.
 * Returns null if not authenticated.
 */
export async function getAuthUserId(): Promise<string | null> {
  const { userId } = await auth()
  return userId
}

/**
 * Get the current Clerk user's ID, or throw a redirect to sign-in.
 * Use in server components / route handlers that require auth.
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('UNAUTHORIZED')
  }
  return userId
}