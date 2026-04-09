export function helpCommand(): string {
  return (
    `<b>Daftar Perintah Bot</b>\n` +
    `------------------------------\n` +
    `/help - Tampilkan daftar perintah\n` +
    `/info - Informasi event yang sedang berjalan\n` +
    `/total - Total pendaftar semua event\n` +
    `/status - Rekap status pendaftaran (pending/verified/rejected)\n` +
    `/recent - 5 pendaftar terbaru\n` +
    `/cari [email] - Cari pendaftar berdasarkan email`
  )
}
