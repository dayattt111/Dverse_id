import { supabase } from '@/lib/supabase/config'

export async function cariCommand(args: string): Promise<string> {
  const email = args.trim()

  if (!email) {
    return 'Gunakan format: /cari [email]\nContoh: /cari john@example.com'
  }

  const { data, error } = await supabase
    .from('event_participant')
    .select('*')
    .ilike('email', `%${email}%`)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    return `Gagal mencari data: ${error.message}`
  }

  if (!data || data.length === 0) {
    return `Tidak ditemukan pendaftar dengan email "${email}".`
  }

  let result = `<b>Hasil Pencarian: ${email}</b>\n` + `------------------------------\n`

  data.forEach((p, i) => {
    result +=
      `\n<b>${i + 1}. ${p.name}</b>\n` +
      `   Email: ${p.email}\n` +
      `   HP: ${p.phone}\n` +
      `   Instansi: ${p.institution}\n` +
      `   Status: ${p.status}\n`
  })

  return result
}
