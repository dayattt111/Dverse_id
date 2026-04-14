'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * Only renders children when NOT on /admin routes.
 * Used to hide the public AppBar & Footer on admin pages.
 */
export default function PublicOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null
  return <>{children}</>
}
