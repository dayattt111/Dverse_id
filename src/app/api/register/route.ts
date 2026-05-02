import { NextResponse } from 'next/server'
import { z } from 'zod'
import nodemailer from 'nodemailer'

// ---------------------------------------------------------------------------
// Rate Limiting — Kerangka Upstash Redis (uncomment untuk production)
// ---------------------------------------------------------------------------
// Untuk production dengan 250+ peserta, ganti in-memory cooldown dengan
// Upstash Redis agar rate limit persist di semua serverless instances.
//
// 1. Install: bun add @upstash/ratelimit @upstash/redis
// 2. Set env: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
// 3. Uncomment kode di bawah:
//
//   import { Ratelimit } from '@upstash/ratelimit'
//   import { Redis } from '@upstash/redis'
//
//   const ratelimit = new Ratelimit({
//     redis: Redis.fromEnv(),
//     limiter: Ratelimit.slidingWindow(3, '1 h'),
//     analytics: true,
//   })
//
// 4. Tambahkan di awal POST handler:
//   const { success } = await ratelimit.limit(ip)
//   if (!success) {
//     return NextResponse.json(
//       { error: 'Terlalu banyak permintaan. Coba lagi nanti.' },
//       { status: 429 }
//     )
//   }
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Zod Schema — validasi & sanitasi semua input dari client
// ---------------------------------------------------------------------------

/** Strip null bytes and ASCII control characters */
const stripControl = (v: string) =>
  v.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim()

const registerSchema = z.object({
  name: z
    .string({ message: 'Nama wajib diisi' })
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter')
    .transform(stripControl)
    .pipe(z.string().min(2, 'Nama tidak valid setelah sanitasi')),
  email: z
    .string({ message: 'Email wajib diisi' })
    .email('Format email tidak valid')
    .min(5, 'Email terlalu pendek')
    .max(100, 'Email terlalu panjang')
    .transform((v) => stripControl(v).toLowerCase()),
  phone: z
    .string({ message: 'Nomor HP wajib diisi' })
    .regex(/^[0-9+\s\-()\\.]{5,20}$/, 'Format nomor HP tidak valid')
    .transform(stripControl),
  institution: z
    .string({ message: 'Instansi wajib diisi' })
    .min(2, 'Instansi minimal 2 karakter')
    .max(150, 'Instansi maksimal 150 karakter')
    .transform(stripControl)
    .pipe(z.string().min(2, 'Instansi tidak valid setelah sanitasi')),
  packageId: z.number().int().positive().optional(),
  packageName: z.string().max(100).optional(),
  packagePrice: z.number().nonnegative().optional(),
  picPayment: z.string().url().optional(),
  picFollow: z.string().url().optional(),
  registrationType: z.enum(['individual', 'team']).optional(),
  teamMemberName: z.string().max(100).optional(),
  teamMemberEmail: z.string().email().max(100).optional().or(z.literal('')),
  teamMemberPhone: z.string().max(20).optional(),
  teamMemberInstitution: z.string().max(150).optional(),
  picKtm: z.string().url().optional(),
  teamMemberPicKtm: z.string().url().optional(),
  eventId: z.number().int().positive().optional(),
})

// ---------------------------------------------------------------------------
// Security helpers
// ---------------------------------------------------------------------------

/** Escape HTML characters to prevent injection in Telegram/email HTML */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/** Known disposable / throwaway email domains */
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'tempmail.com',
  'temp-mail.org',
  'throwam.com',
  'sharklasers.com',
  'grr.la',
  'guerrillamailblock.com',
  'yopmail.com',
  'trashmail.com',
  'trashmail.me',
  'dispostable.com',
  'mailnull.com',
  'spamgourmet.com',
  'maildrop.cc',
  'fakeinbox.com',
  'discard.email',
  'getairmail.com',
  'spamtest.com',
  'spam4.me',
  'bccto.me',
  'chacuo.net',
])

/** Template placeholder regex — catches strings like {{name}}, {{ email }} */
const PLACEHOLDER_RE = /\{\{.+?\}\}/

// ---------------------------------------------------------------------------
// Cooldown — in-memory, per IP
// ---------------------------------------------------------------------------

const registrationCooldownMap = new Map<string, number>()
const COOLDOWN_MS = 12 * 60 * 60 * 1000 // 12 hours

function checkCooldown(ip: string): boolean {
  const expiresAt = registrationCooldownMap.get(ip)
  return !expiresAt || Date.now() > expiresAt
}

function startCooldown(ip: string): void {
  registrationCooldownMap.set(ip, Date.now() + COOLDOWN_MS)
}

function remainingCooldownText(ip: string): string {
  const expiresAt = registrationCooldownMap.get(ip)
  if (!expiresAt) return ''
  const ms = expiresAt - Date.now()
  if (ms <= 0) return ''
  const hours = Math.floor(ms / (60 * 60 * 1000))
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
  if (hours > 0) return `${hours} jam ${minutes} menit`
  return `${minutes} menit`
}

// ---------------------------------------------------------------------------
// Event name mapping
// ---------------------------------------------------------------------------

const EVENTS: Record<number, string> = {
  1: 'Seminar GreenTech',
  2: 'Competitive Programming',
}

const EVENTS_CONFIG: Record<number, { image: string; calendar: any }> = {
  1: {
    image: 'https://omwdnhmxmanhdzuznrks.supabase.co/storage/v1/object/public/event_images/Sem.jpeg',
    calendar: {
      text: 'Seminar GreenTech — D-Verse',
      dates: '20260509T010000Z/20260509T090000Z',
      details: 'Seminar GreenTech oleh D-Verse (Developer Universe).\nInfo: https://dverse.my.id',
      location: 'Politeknik Negeri Ujung Pandang, Makassar',
    }
  },
  2: {
    image: 'https://omwdnhmxmanhdzuznrks.supabase.co/storage/v1/object/public/event_images/CP.jpeg',
    calendar: {
      text: 'Competitive Programming — D-Verse',
      dates: '20260510T010000Z/20260510T090000Z',
      details: 'Competitive Programming oleh D-Verse (Developer Universe).\nInfo: https://dverse.my.id',
      location: 'Online / Politeknik Negeri Ujung Pandang',
    }
  }
}

// ---------------------------------------------------------------------------
// Nodemailer transporter (Gmail) — credentials from env, NEVER hardcoded
// ---------------------------------------------------------------------------

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // e.g. D-Verseofc26@gmail.com
    pass: process.env.EMAIL_PASS,  // Gmail App Password (bukan password biasa)
  },
})

// ---------------------------------------------------------------------------
// Email confirmation helper
// ---------------------------------------------------------------------------

async function sendConfirmationEmail(params: {
  to: string
  name: string
  eventName: string
  packageName?: string
  eventId?: number
  registrationType?: string
}): Promise<void> {
  const { to, name, eventName, packageName, eventId, registrationType } = params

  // Skip if email credentials not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('EMAIL_USER atau EMAIL_PASS belum diset — email tidak dikirim')
    return
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dverse.my.id'
  
  const config = EVENTS_CONFIG[eventId || 1] || EVENTS_CONFIG[1]
  const eventImageUrl = config.image
  const ticketUrl = `${siteUrl}/success?name=${encodeURIComponent(name)}${packageName ? `&package=${encodeURIComponent(packageName)}` : ''}${eventId ? `&event=${eventId}` : ''}${registrationType ? `&type=${registrationType}` : ''}`
  
  const calParams = new URLSearchParams(config.calendar)
  const calendarUrl = `https://www.google.com/calendar/render?${calParams.toString()}`
  const year = new Date().getFullYear()

  const html = `
<!DOCTYPE html>
<html lang="id">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#080c1a;font-family:'Segoe UI',Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

<!-- Outer wrapper -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#080c1a;">
<tr><td align="center" style="padding:24px 16px;">

<!-- Main card -->
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0f172a;border-radius:16px;overflow:hidden;border:1px solid #1e293b;">

  <!-- Hero Image -->
  <tr>
    <td style="padding:0;">
      <img src="${eventImageUrl}" alt="${escapeHtml(eventName)}" width="600" style="width:100%;max-height:260px;object-fit:cover;display:block;" />
    </td>
  </tr>

  <!-- Brand Bar -->
  <tr>
    <td style="background:linear-gradient(135deg,#0f172a 0%,#162033 100%);padding:20px 32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0 0 6px;color:#22c55e;font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;">D-Verse &bull; Developer Universe</p>
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;line-height:1.3;">${escapeHtml(eventName)} 2026</h1>
          </td>
          <td width="60" align="right" valign="top">
            <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#22c55e,#16a34a);text-align:center;line-height:48px;font-size:22px;">&#127793;</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Greeting -->
  <tr>
    <td style="padding:8px 32px 0;">
      <p style="color:#e2e8f0;font-size:15px;line-height:1.7;margin:0 0 6px;">
        Halo <strong style="color:#22c55e;">${escapeHtml(name)}</strong>,
      </p>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 4px;">
        Pendaftaran kamu untuk <strong style="color:#e2e8f0;">${escapeHtml(eventName)}</strong>${packageName ? ` &mdash; Paket <strong style="color:#a3e635;">${escapeHtml(packageName)}</strong>` : ''} telah kami terima. Tiket kamu sudah diamankan! &#127881;
      </p>
    </td>
  </tr>

  <!-- Divider -->
  <tr>
    <td style="padding:20px 32px 0;">
      <div style="border-top:1px solid #1e293b;"></div>
    </td>
  </tr>

  <!-- Ticket Card -->
  <tr>
    <td style="padding:20px 32px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border:1px solid #334155;border-radius:12px;overflow:hidden;">
        <!-- Ticket Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#22c55e15,#16a34a10);padding:14px 20px;border-bottom:1px solid #334155;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0;color:#22c55e;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">&#127915; E-Ticket</p>
                </td>
                <td align="right">
                  <p style="margin:0;color:#475569;font-size:11px;font-weight:600;">#DV-${Date.now().toString(36).toUpperCase().slice(-6)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Ticket Row 1 -->
        <tr>
          <td style="padding:16px 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" valign="top">
                  <p style="margin:0 0 3px;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Peserta</p>
                  <p style="margin:0;color:#f1f5f9;font-size:14px;font-weight:700;">${escapeHtml(name)}</p>
                </td>
                <td width="50%" valign="top">
                  <p style="margin:0 0 3px;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Event</p>
                  <p style="margin:0;color:#f1f5f9;font-size:14px;font-weight:700;">${escapeHtml(eventName)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Ticket Dashed Divider -->
        <tr>
          <td style="padding:0 20px;">
            <div style="border-top:2px dashed #334155;"></div>
          </td>
        </tr>
        <!-- Ticket Row 2 -->
        <tr>
          <td style="padding:16px 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="33%" valign="top">
                  <p style="margin:0 0 3px;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Tanggal</p>
                  <p style="margin:0;color:#f1f5f9;font-size:14px;font-weight:700;">9 Mei 2026</p>
                </td>
                <td width="33%" valign="top">
                  <p style="margin:0 0 3px;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Waktu</p>
                  <p style="margin:0;color:#f1f5f9;font-size:14px;font-weight:700;">09:00 WITA</p>
                </td>
                <td width="34%" valign="top">
                  <p style="margin:0 0 3px;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">${packageName ? 'Paket' : 'Lokasi'}</p>
                  <p style="margin:0;color:${packageName ? '#a3e635' : '#f1f5f9'};font-size:14px;font-weight:700;">${packageName ? escapeHtml(packageName) : 'PNUP'}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${packageName ? `
        <!-- Ticket Row 3: Location -->
        <tr>
          <td style="padding:0 20px 16px;">
            <p style="margin:0 0 3px;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Lokasi</p>
            <p style="margin:0;color:#f1f5f9;font-size:13px;font-weight:600;">Politeknik Negeri Ujung Pandang, Makassar</p>
          </td>
        </tr>
        ` : `
        <tr>
          <td style="padding:0 20px 16px;">
            <p style="margin:0;color:#64748b;font-size:12px;">Politeknik Negeri Ujung Pandang, Makassar</p>
          </td>
        </tr>
        `}
      </table>
    </td>
  </tr>

  <!-- Status Alert -->
  <tr>
    <td style="padding:20px 32px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1a1708;border:1px solid #3d3508;border-radius:10px;">
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-size:14px;color:#facc15;font-weight:700;">&#9202; Menunggu Verifikasi Pembayaran</p>
            <p style="margin:0;font-size:13px;color:#ca8a04;line-height:1.6;">
              Tim kami akan memverifikasi pembayaran kamu. Konfirmasi akan dikirim melalui email ini.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- CTA Buttons -->
  <tr>
    <td style="padding:24px 32px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <!-- Primary Button -->
        <tr>
          <td align="center" style="padding-bottom:12px;">
            <a href="${ticketUrl}" style="display:inline-block;padding:14px 40px;background:#22c55e;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.3px;">
              Lihat Tiket Digital &rarr;
            </a>
          </td>
        </tr>
        <!-- Secondary Button -->
        <tr>
          <td align="center">
            <a href="${calendarUrl}" style="display:inline-block;padding:12px 32px;background:transparent;color:#22c55e;font-size:13px;font-weight:700;text-decoration:none;border-radius:10px;border:1px solid #22c55e;">
              &#128197; Tambah ke Google Calendar
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Divider -->
  <tr>
    <td style="padding:24px 32px 0;">
      <div style="border-top:1px solid #1e293b;"></div>
    </td>
  </tr>

  <!-- Contact -->
  <tr>
    <td style="padding:16px 32px;">
      <p style="color:#64748b;font-size:12px;line-height:1.8;margin:0;text-align:center;">
        Ada pertanyaan? Hubungi kami via WhatsApp:<br/>
        <a href="https://wa.me/6281906806724" style="color:#22c55e;text-decoration:none;font-weight:600;">+62 819-0680-6724 (ALFI)</a>
      </p>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#080c1a;padding:16px 32px;border-top:1px solid #1e293b;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <p style="margin:0 0 4px;color:#334155;font-size:11px;">&copy; ${year} Developer Universe (D-Verse)</p>
            <p style="margin:0;color:#1e293b;font-size:10px;">Dipanegara Computer Club &mdash; Politeknik Negeri Ujung Pandang</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

</table>
<!-- /Main card -->

</td></tr>
</table>
<!-- /Outer wrapper -->

</body>
</html>
  `

  await emailTransporter.sendMail({
    from: `"Developer Universe (D-Verse)" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Konfirmasi Pendaftaran ${eventName}`,
    html,
  })
}

// ---------------------------------------------------------------------------
// Telegram notification helper
// ---------------------------------------------------------------------------

async function sendTelegramNotification(params: {
  name: string
  email: string
  phone: string
  institution: string
  packageName?: string
  packagePrice?: number
  picPayment?: string
  picFollow?: string
  registrationType?: 'individual' | 'team'
  teamMemberName?: string
  teamMemberEmail?: string
  teamMemberPhone?: string
  teamMemberInstitution?: string
  picKtm?: string
  teamMemberPicKtm?: string
  eventName?: string
}): Promise<void> {
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN
  const telegramChatId = process.env.TELEGRAM_CHAT_ID

  if (!telegramToken || !telegramChatId) {
    console.warn('TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID belum diset')
    return
  }

  const safeName = escapeHtml(params.name)
  const safeEmail = escapeHtml(params.email)
  const safePhone = escapeHtml(params.phone)
  const safeInstitution = escapeHtml(params.institution)

  // Only allow https:// Supabase Storage URLs for image links
  const supabaseUrlBase = process.env.NEXT_PUBLIC_SUPABASE_URL
  const isSafeUrl = (url: unknown) =>
    typeof url === 'string' &&
    url.startsWith('https://') &&
    supabaseUrlBase &&
    url.startsWith(supabaseUrlBase)

  const paymentLink = isSafeUrl(params.picPayment)
    ? `<a href="${params.picPayment}">Lihat</a>`
    : '-'
  const followLink = isSafeUrl(params.picFollow)
    ? `<a href="${params.picFollow}">Lihat</a>`
    : '-'
  const ktmLink = isSafeUrl(params.picKtm)
    ? `<a href="${params.picKtm}">Lihat</a>`
    : '-'
  const teamMemberKtmLink = isSafeUrl(params.teamMemberPicKtm)
    ? `<a href="${params.teamMemberPicKtm}">Lihat</a>`
    : '-'

  const safePackageName = params.packageName
    ? escapeHtml(String(params.packageName))
    : '-'
  const safePackagePrice = params.packagePrice
    ? new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(Number(params.packagePrice))
    : '-'

  const eventLabel = params.eventName || 'Seminar GreenTech'

  let message = `🎉 <b>Pendaftaran Baru: ${eventLabel}</b> 🎉\n\n`
  message += `👤 <b>Data Pendaftar (Ketua/Individu)</b>\n`
  message += `Nama: ${safeName}\n`
  message += `Email: ${safeEmail}\n`
  message += `No. HP: ${safePhone}\n`
  message += `Instansi: ${safeInstitution}\n`
  
  if (params.eventName === 'Competitive Programming') {
    message += `\nBukti KTM/Siswa (Ketua/Individu): ${ktmLink}\n`
  }

  if (params.registrationType === 'team') {
    message += `\n👥 <b>Data Anggota Tim</b>\n`
    message += `Nama Anggota: ${escapeHtml(params.teamMemberName || '-')}\n`
    message += `Email Anggota: ${escapeHtml(params.teamMemberEmail || '-')}\n`
    message += `No. HP Anggota: ${escapeHtml(params.teamMemberPhone || '-')}\n`
    message += `Instansi Anggota: ${escapeHtml(params.teamMemberInstitution || '-')}\n`
    if (params.eventName === 'Competitive Programming') {
      message += `Bukti KTM/Siswa Anggota: ${teamMemberKtmLink}\n`
    }
  }

  if (params.packageName) {
    message += `\n📦 <b>Paket</b>: ${escapeHtml(params.packageName)} (${safePackagePrice})\n`
  }

  message += `\n<b>Bukti Pembayaran:</b> ${paymentLink}\n`
  message += `<b>Bukti Follow:</b> ${followLink}`

  const res = await fetch(
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
  const result = await res.json()
  if (!result.ok) console.error('Telegram failed:', JSON.stringify(result))
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

/** GET — check cooldown status for current IP */
export async function GET(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  if (!checkCooldown(ip)) {
    const expiresAt = registrationCooldownMap.get(ip) ?? 0
    return NextResponse.json({ allowed: false, expiresAt }, { status: 200 })
  }

  return NextResponse.json({ allowed: true, expiresAt: 0 }, { status: 200 })
}

/** POST — validate with Zod, send email + Telegram in parallel, apply cooldown */
export async function POST(request: Request) {
  try {
    // --- Cooldown check ---
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // -----------------------------------------------------------------------
    // Rate Limiting — Uncomment saat sudah setup Upstash Redis
    // -----------------------------------------------------------------------
    // const { success } = await ratelimit.limit(ip)
    // if (!success) {
    //   return NextResponse.json(
    //     { error: 'Terlalu banyak permintaan. Coba lagi nanti.' },
    //     { status: 429 }
    //   )
    // }
    // -----------------------------------------------------------------------

    if (!checkCooldown(ip)) {
      const remaining = remainingCooldownText(ip)
      return NextResponse.json(
        { error: `Kamu sudah mendaftar. Coba lagi dalam ${remaining}.` },
        { status: 429 }
      )
    }

    // --- Parse & validate with Zod ---
    const raw = await request.json()
    const parsed = registerSchema.safeParse(raw)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Data tidak valid'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const {
      name, email, phone, institution,
      packageName, packagePrice,
      picPayment, picFollow, picKtm, teamMemberPicKtm,
      registrationType, teamMemberName, teamMemberEmail, teamMemberPhone, teamMemberInstitution,
      eventId
    } = parsed.data

    // --- Reject template placeholders (post-sanitisation) ---
    if ([name, email, phone, institution].some((v) => PLACEHOLDER_RE.test(v))) {
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
    }

    // --- Disposable email domain ---
    const emailDomain = email.split('@')[1]?.toLowerCase()
    if (!emailDomain || DISPOSABLE_DOMAINS.has(emailDomain)) {
      return NextResponse.json(
        { error: 'Email tidak dapat digunakan. Gunakan email pribadi yang valid.' },
        { status: 400 }
      )
    }

    // --- Determine event name ---
    const eventName = eventId ? EVENTS[eventId] || EVENTS[1] : EVENTS[1]

    // --- Send email + Telegram in parallel ---
    const [emailResult, telegramResult] = await Promise.allSettled([
      sendConfirmationEmail({
        to: email,
        name,
        eventName,
        packageName,
        eventId: parsed.data.eventId,
        registrationType: parsed.data.registrationType,
      }),
      sendTelegramNotification({
        name,
        email,
        phone,
        institution,
        packageName,
        packagePrice,
        picPayment,
        picFollow,
        picKtm,
        teamMemberPicKtm,
        registrationType,
        teamMemberName,
        teamMemberEmail,
        teamMemberPhone,
        teamMemberInstitution,
        eventName,
      }),
    ])

    // Log failures server-side only — never expose to client
    if (emailResult.status === 'rejected') {
      console.error('Email send error:', emailResult.reason)
    }
    if (telegramResult.status === 'rejected') {
      console.error('Telegram send error:', telegramResult.reason)
    }

    // Lock this IP for 12 hours
    startCooldown(ip)

    return NextResponse.json(
      { message: 'Pendaftaran berhasil diproses' },
      { status: 200 }
    )
  } catch (error) {
    // Safe error handling — generic message, no stack trace / token leak
    console.error(
      'API register error:',
      error instanceof Error ? error.message : error
    )
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}
