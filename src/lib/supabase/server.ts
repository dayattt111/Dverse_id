import { createServerClient as _createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Create a Supabase client for use in Server Components and Route Handlers.
 * Reads/writes auth tokens via Next.js cookies (next/headers).
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  return _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          } catch {
            // setAll is called from Server Components where cookies cannot be set.
            // This can be ignored if middleware is refreshing sessions.
          }
        },
      },
    }
  )
}

/**
 * Get the current authenticated user + their role from user_roles table.
 * Returns null if not authenticated.
 */
export async function getAuthUser() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) return null

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('id', user.id)
    .single()

  return {
    ...user,
    role: (roleData?.role as 'admin' | 'peserta') ?? 'peserta',
  }
}
