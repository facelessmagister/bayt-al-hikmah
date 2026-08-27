import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-side Supabase client for DATABASE ACCESS ONLY.
 * Authentication is handled by Clerk. The Clerk user ID is passed
 * explicitly as the `user_id` parameter in all queries.
 *
 * This uses the anon key — RLS policies should allow access based on
 * the Clerk user ID stored in the user_id column.
 *
 * For admin operations, use the server client (service role key).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}