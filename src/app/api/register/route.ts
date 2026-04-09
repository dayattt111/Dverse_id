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

    if (telegramToken && telegramChatId) {
      const message =
        `<b>Pendaftar Baru Masuk!</b>\n` +
        `------------------------------\n` +
        `<b>Nama:</b> ${name}\n` +
        `<b>Email:</b> ${email}\n` +
        `<b>No. HP:</b> ${phone}\n` +
        `<b>Instansi:</b> ${institution}\n\n` +
        `<b>Bukti Pembayaran:</b> ${picPayment ? `<a href="${picPayment}">Lihat</a>` : '-'}\n` +
        `<b>Bukti Follow:</b> ${picFollow ? `<a href="${picFollow}">Lihat</a>` : '-'}`

      // await agar Vercel serverless tidak kill request sebelum fetch selesai
      try {
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
        const result = await telegramRes.json()
        if (!result.ok) console.error('Telegram failed:', JSON.stringify(result))
      } catch (err) {
        console.error('Telegram fetch error:', err)
      }
    } else {
      console.warn('TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID belum diset')
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
