import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, institution, picPayment, picFollow } = body

    if (!name || !email || !phone || !institution) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    // Kirim notifikasi Telegram
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN
    const telegramChatId = process.env.TELEGRAM_CHAT_ID

    if (!telegramToken || !telegramChatId) {
      console.error('TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID belum diset')
      return NextResponse.json(
        { error: 'Konfigurasi Telegram belum lengkap' },
        { status: 500 }
      )
    }

    const message =
      `<b>Pendaftar Baru Masuk!</b>\n` +
      `------------------------------\n` +
      `<b>Nama:</b> ${name}\n` +
      `<b>Email:</b> ${email}\n` +
      `<b>No. HP:</b> ${phone}\n` +
      `<b>Instansi:</b> ${institution}\n\n` +
      `<b>Bukti Pembayaran:</b> ${picPayment ? `<a href="${picPayment}">Lihat</a>` : '-'}\n` +
      `<b>Bukti Follow:</b> ${picFollow ? `<a href="${picFollow}">Lihat</a>` : '-'}`

    const telegramRes = await fetch(
      `https://api.telegram.org/bot${telegramToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    )

    const telegramResult = await telegramRes.json()
    if (!telegramResult.ok) {
      console.error('Telegram error:', telegramResult)
      return NextResponse.json(
        { error: 'Gagal mengirim notifikasi Telegram' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Notifikasi berhasil dikirim' },
      { status: 200 }
    )
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Terjadi kesalahan server'
    console.error('API register error:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
