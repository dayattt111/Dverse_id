import { supabase } from './config'

// ---------------------------------------------------------------------------
// Dashboard Statistics
// ---------------------------------------------------------------------------

export interface AdminStats {
  totalParticipants: number
  totalEvents: number
  totalPackagesSold: number
  totalRevenue: number
}

export async function getAdminStats(): Promise<AdminStats> {
  const [participantsRes, eventsRes, packagesRes] = await Promise.all([
    supabase.from('event_participant').select('id', { count: 'exact', head: true }),
    supabase.from('events').select('id', { count: 'exact', head: true }),
    supabase
      .from('event_participant')
      .select('package_id, event_packages(price)')
      .not('package_id', 'is', null),
  ])

  const totalParticipants = participantsRes.count ?? 0
  const totalEvents = eventsRes.count ?? 0

  // Calculate revenue from packages
  const packageRows = packagesRes.data ?? []
  const totalPackagesSold = packageRows.length
  const totalRevenue = packageRows.reduce((sum, row) => {
    const pkg = row.event_packages as unknown as { price: number } | null
    return sum + (pkg?.price ?? 0)
  }, 0)

  return {
    totalParticipants,
    totalEvents,
    totalPackagesSold,
    totalRevenue,
  }
}

// ---------------------------------------------------------------------------
// Recent Participants (for Dashboard)
// ---------------------------------------------------------------------------

export interface RecentParticipant {
  id: number
  name: string
  email: string
  institution: string
  status: string
  eventName: string
  packageName: string | null
  createdAt: string
}

export async function getRecentParticipants(limit = 10): Promise<RecentParticipant[]> {
  const { data, error } = await supabase
    .from('event_participant')
    .select(`
      id,
      name,
      email,
      institution,
      status,
      created_at,
      events(name),
      event_packages(name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    institution: row.institution,
    status: row.status,
    eventName: (row.events as unknown as { name: string } | null)?.name ?? '-',
    packageName: (row.event_packages as unknown as { name: string } | null)?.name ?? null,
    createdAt: row.created_at,
  }))
}
