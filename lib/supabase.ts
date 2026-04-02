import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Browser (client-side) Supabase client.
 * Use in Client Components ('use client').
 */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

/**
 * Server-side Supabase client.
 * Use in Server Components, Route Handlers, and Server Actions.
 */
export async function createServerSupabaseClient() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from Server Component — middleware handles session refresh
        }
      },
    },
  })
}

/**
 * Service-role client (bypasses RLS).
 * Only use in trusted server-only contexts (API routes, Edge Functions).
 * NEVER expose to the browser.
 */
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
