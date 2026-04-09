import { supabase } from '@/lib/supabase/config'

export async function recentCommand(): Promise<string> {
  const { data, error } = await supabase
    .from('event_participant')
    .select('name, email, institution, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    return `Gagal mengambil data: ${error.message}`
  }

  if (!data || data.length === 0) {
    return 'Belum ada pendaftar.'
  }

  let list = `<b>5 Pendaftar Terbaru</b>\n` + `------------------------------\n`

  data.forEach((p, i) => {
    const date = new Date(p.created_at).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    list +=
      `\n<b>${i + 1}. ${p.name}</b>\n` +
      `   ${p.email}\n` +
      `   ${p.institution}\n` +
      `   Status: ${p.status} | ${date}\n`
  })

  return list
}
