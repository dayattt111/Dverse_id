import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect /id (locale probe from browser) to root
  if (pathname === '/id' || pathname.startsWith('/id/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname === '/id' ? '/' : pathname.replace(/^\/id/, '')
    return NextResponse.redirect(url, 308)
  }

  // --- Admin route protection ---
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/admin/login'

  if (isAdminRoute) {
    // Skip auth if Supabase URL is not configured (build-time / local dev without env)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl.includes('dummy-url') || supabaseUrl.includes('placeholder')) {
      return NextResponse.next()
    }

    const { supabase, user, supabaseResponse } = await createMiddlewareClient(request)

    // Prevent admin pages from being indexed
    supabaseResponse.headers.set('X-Robots-Tag', 'noindex, nofollow')

    if (!isLoginPage) {
      // Protected admin page — must be authenticated admin
      if (!user) {
        const loginUrl = new URL('/admin/login', request.url)
        return NextResponse.redirect(loginUrl)
      }

      // Check role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (roleData?.role !== 'admin') {
        const unauthorizedUrl = new URL('/unauthorized', request.url)
        return NextResponse.redirect(unauthorizedUrl)
      }
    } else {
      // Login page — redirect authenticated admin to dashboard
      if (user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (roleData?.role === 'admin') {
          const dashboardUrl = new URL('/admin', request.url)
          return NextResponse.redirect(dashboardUrl)
        }
      }
    }

    return supabaseResponse
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/id', '/id/:path*', '/admin/:path*'],
}
