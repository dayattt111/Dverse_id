import { supabase } from '@/lib/supabase/config'

export async function totalCommand(): Promise<string> {
  const { count: totalCount, error: totalError } = await supabase
    .from('event_participant')
    .select('*', { count: 'exact', head: true })

  if (totalError) {
    return `Gagal mengambil data: ${totalError.message}`
  }

  const { data: byEvent, error: byEventError } = await supabase
    .from('event_participant')
    .select('event_id')

  if (byEventError) {
    return `Gagal mengambil data: ${byEventError.message}`
  }

  const eventMap: Record<number, number> = {}
  for (const row of byEvent || []) {
    const eid = row.event_id as number
    eventMap[eid] = (eventMap[eid] || 0) + 1
  }

  const EVENT_NAMES: Record<number, string> = {
    1: 'Seminar GreenTech',
    2: 'Hackathon 48 Jam',
  }

  let detail = ''
  for (const [eid, count] of Object.entries(eventMap)) {
    const name = EVENT_NAMES[Number(eid)] || `Event #${eid}`
    detail += `  ${name}: <b>${count}</b>\n`
  }

  return (
    `<b>Total Pendaftar</b>\n` +
    `------------------------------\n` +
    `Total keseluruhan: <b>${totalCount ?? 0}</b>\n\n` +
    (detail ? `<b>Per Event:</b>\n${detail}` : '')
  )
}
