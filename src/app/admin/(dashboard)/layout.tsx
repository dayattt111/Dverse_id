import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/admin-shell'

export const metadata = {
  title: 'Admin Panel — D-Verse',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()

  if (!user || user.role !== 'admin') {
    redirect('/admin/login')
  }

  return (
    <AdminShell userEmail={user.email ?? 'admin'}>
      {children}
    </AdminShell>
  )
}
