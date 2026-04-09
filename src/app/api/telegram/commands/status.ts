import { supabase } from '@/lib/supabase/config'

export async function statusCommand(): Promise<string> {
  const statuses = ['pending', 'verified', 'rejected'] as const

  const counts: Record<string, number> = {}

  for (const status of statuses) {
    const { count, error } = await supabase
      .from('event_participant')
      .select('*', { count: 'exact', head: true })
      .eq('status', status)

    if (error) {
      return `Gagal mengambil data: ${error.message}`
    }
    counts[status] = count ?? 0
  }

  const total = counts.pending + counts.verified + counts.rejected

  return (
    `<b>Rekap Status Pendaftaran</b>\n` +
    `------------------------------\n` +
    `Pending: <b>${counts.pending}</b>\n` +
    `Verified: <b>${counts.verified}</b>\n` +
    `Rejected: <b>${counts.rejected}</b>\n` +
    `------------------------------\n` +
    `Total: <b>${total}</b>`
  )
}
