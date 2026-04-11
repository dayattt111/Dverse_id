/**
 * Quick script to test nodemailer Gmail connection.
 * Run: bunx tsx scripts/test-email.ts
 */
import 'dotenv/config'
import nodemailer from 'nodemailer'

const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASS = process.env.EMAIL_PASS

console.log('--- Email Debug ---')
console.log('EMAIL_USER set:', !!EMAIL_USER, `(${EMAIL_USER?.length ?? 0} chars)`)
console.log('EMAIL_PASS set:', !!EMAIL_PASS, `(${EMAIL_PASS?.length ?? 0} chars)`)

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('❌ EMAIL_USER atau EMAIL_PASS tidak diset di .env')
  process.exit(1)
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
})

async function main() {
  // Step 1: Verify connection
  console.log('\n1. Verifying SMTP connection...')
  try {
    await transporter.verify()
    console.log('✅ SMTP connection OK')
  } catch (err) {
    console.error('❌ SMTP connection FAILED:', err)
    process.exit(1)
  }

  // Step 2: Send test email with the actual template preview
  console.log('\n2. Sending test email to', EMAIL_USER, '...')
  try {
    const name = 'Test User'
    const eventName = 'Seminar GreenTech'
    const packageName = 'Professional'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dverse.my.id'
    const eventImageUrl = 'https://omwdnhmxmanhdzuznrks.supabase.co/storage/v1/object/public/event_images/Sem.jpeg'
    const ticketUrl = `${siteUrl}/success?name=${encodeURIComponent(name)}&package=${encodeURIComponent(packageName)}`
    const calendarUrl = 'https://www.google.com/calendar/render?action=TEMPLATE&text=Seminar%20GreenTech%20%E2%80%94%20D-Verse&dates=20260509T010000Z%2F20260509T090000Z&details=Seminar%20GreenTech%20oleh%20D-Verse%20(Developer%20Universe).%0AInfo%3A%20https%3A%2F%2Fdverse.my.id&location=Politeknik%20Negeri%20Ujung%20Pandang%2C%20Makassar'
    const year = new Date().getFullYear()

    const html = `
<!DOCTYPE html>
<html lang="id">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#080c1a;font-family:'Segoe UI',Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#080c1a;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0f172a;border-radius:16px;overflow:hidden;border:1px solid #1e293b;">
  <tr><td style="padding:0;"><img src="${eventImageUrl}" alt="${eventName}" width="600" style="width:100%;max-height:260px;object-fit:cover;display:block;" /></td></tr>
  <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#162033 100%);padding:20px 32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><p style="margin:0 0 6px;color:#22c55e;font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;">D-Verse &bull; Developer Universe</p><h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;line-height:1.3;">${eventName} 2026</h1></td>
      <td width="60" align="right" valign="top"><div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#22c55e,#16a34a);text-align:center;line-height:48px;font-size:22px;">&#127793;</div></td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:8px 32px 0;">
    <p style="color:#e2e8f0;font-size:15px;line-height:1.7;margin:0 0 6px;">Halo <strong style="color:#22c55e;">${name}</strong>,</p>
    <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 4px;">Pendaftaran kamu untuk <strong style="color:#e2e8f0;">${eventName}</strong> &mdash; Paket <strong style="color:#a3e635;">${packageName}</strong> telah kami terima. Tiket kamu sudah diamankan! &#127881;</p>
  </td></tr>
  <tr><td style="padding:20px 32px 0;"><div style="border-top:1px solid #1e293b;"></div></td></tr>
  <tr><td style="padding:20px 32px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border:1px solid #334155;border-radius:12px;overflow:hidden;">
      <tr><td style="background:linear-gradient(135deg,#22c55e15,#16a34a10);padding:14px 20px;border-bottom:1px solid #334155;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td><p style="margin:0;color:#22c55e;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">&#127915; E-Ticket</p></td>
          <td align="right"><p style="margin:0;color:#475569;font-size:11px;font-weight:600;">#DV-ABC123</p></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:16px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="50%" valign="top"><p style="margin:0 0 3px;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Peserta</p><p style="margin:0;color:#f1f5f9;font-size:14px;font-weight:700;">${name}</p></td>
          <td width="50%" valign="top"><p style="margin:0 0 3px;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Event</p><p style="margin:0;color:#f1f5f9;font-size:14px;font-weight:700;">${eventName}</p></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:0 20px;"><div style="border-top:2px dashed #334155;"></div></td></tr>
      <tr><td style="padding:16px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="33%" valign="top"><p style="margin:0 0 3px;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Tanggal</p><p style="margin:0;color:#f1f5f9;font-size:14px;font-weight:700;">9 Mei 2026</p></td>
          <td width="33%" valign="top"><p style="margin:0 0 3px;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Waktu</p><p style="margin:0;color:#f1f5f9;font-size:14px;font-weight:700;">09:00 WITA</p></td>
          <td width="34%" valign="top"><p style="margin:0 0 3px;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Paket</p><p style="margin:0;color:#a3e635;font-size:14px;font-weight:700;">${packageName}</p></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:0 20px 16px;"><p style="margin:0 0 3px;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Lokasi</p><p style="margin:0;color:#f1f5f9;font-size:13px;font-weight:600;">Politeknik Negeri Ujung Pandang, Makassar</p></td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:20px 32px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1a1708;border:1px solid #3d3508;border-radius:10px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 6px;font-size:14px;color:#facc15;font-weight:700;">&#9202; Menunggu Verifikasi Pembayaran</p>
        <p style="margin:0;font-size:13px;color:#ca8a04;line-height:1.6;">Tim kami akan memverifikasi pembayaran kamu. Konfirmasi akan dikirim melalui email ini.</p>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:24px 32px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding-bottom:12px;"><a href="${ticketUrl}" style="display:inline-block;padding:14px 40px;background:#22c55e;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.3px;">Lihat Tiket Digital &rarr;</a></td></tr>
      <tr><td align="center"><a href="${calendarUrl}" style="display:inline-block;padding:12px 32px;background:transparent;color:#22c55e;font-size:13px;font-weight:700;text-decoration:none;border-radius:10px;border:1px solid #22c55e;">&#128197; Tambah ke Google Calendar</a></td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:24px 32px 0;"><div style="border-top:1px solid #1e293b;"></div></td></tr>
  <tr><td style="padding:16px 32px;">
    <p style="color:#64748b;font-size:12px;line-height:1.8;margin:0;text-align:center;">Ada pertanyaan? Hubungi kami via WhatsApp:<br/><a href="https://wa.me/6281906806724" style="color:#22c55e;text-decoration:none;font-weight:600;">+62 819-0680-6724 (ALFI)</a></p>
  </td></tr>
  <tr><td style="background:#080c1a;padding:16px 32px;border-top:1px solid #1e293b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <p style="margin:0 0 4px;color:#334155;font-size:11px;">&copy; ${year} Developer Universe (D-Verse)</p>
      <p style="margin:0;color:#1e293b;font-size:10px;">Dipanegara Computer Club &mdash; Politeknik Negeri Ujung Pandang</p>
    </td></tr></table>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`

    const info = await transporter.sendMail({
      from: `"Developer Universe (D-Verse)" <${EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: 'Konfirmasi Pendaftaran Seminar GreenTech',
      html,
    })
    console.log('✅ Email sent! MessageId:', info.messageId)
    console.log('   Response:', info.response)
  } catch (err) {
    console.error('❌ Email send FAILED:', err)
  }
}

main()
