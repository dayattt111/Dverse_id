import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Create a Supabase client for use in Next.js middleware.
 * Handles reading cookies from the request and writing them to the response.
 */
export async function createMiddlewareClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Set cookies on the request (for downstream server components)
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          // Set cookies on the response (for the browser)
          supabaseResponse = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  // Refresh session — IMPORTANT: call getUser(), not getSession()
  const { data: { user } } = await supabase.auth.getUser()

  return { supabase, user, supabaseResponse }
}
