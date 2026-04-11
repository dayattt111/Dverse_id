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
  2: 'Hackathon 48 Jam',
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
}): Promise<void> {
  const { to, name, eventName, packageName } = params

  // Skip if email credentials not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('EMAIL_USER atau EMAIL_PASS belum diset — email tidak dikirim')
    return
  }

  // Build event image URL dynamically from Supabase env
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const eventImageUrl = `${supabaseUrl}/storage/v1/object/public/event_images/seminar.jpeg`
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dverse.my.id'

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;border-radius:16px;overflow:hidden;border:1px solid #1e293b;">
      <!-- Event Hero Image -->
      <div style="position:relative;">
        <img src="${eventImageUrl}" alt="${escapeHtml(eventName)}" style="width:100%;height:220px;object-fit:cover;display:block;" />
        <div style="position:absolute;bottom:0;left:0;right:0;padding:20px 24px;background:linear-gradient(transparent,rgba(15,23,42,0.95));">
          <p style="margin:0 0 4px;color:#a3e635;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">D-Verse &mdash; Developer Universe</p>
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;">${escapeHtml(eventName)} 2026</h1>
        </div>
      </div>

      <!-- Body -->
      <div style="padding:28px 24px;">
        <p style="color:#e2e8f0;font-size:15px;line-height:1.7;margin:0 0 20px;">
          Halo <strong style="color:#22c55e;">${escapeHtml(name)}</strong>,
        </p>
        <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 24px;">
          Terima kasih telah mendaftar <strong style="color:#e2e8f0;">${escapeHtml(eventName)}</strong>${packageName ? ` &mdash; Paket <strong style="color:#a3e635;">${escapeHtml(packageName)}</strong>` : ''}.
          Tiket kamu sudah diamankan!
        </p>

        <!-- Ticket Card -->
        <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;overflow:hidden;margin:0 0 24px;">
          <div style="padding:16px 20px;display:flex;">
            <div style="flex:1;">
              <p style="margin:0 0 2px;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Tanggal</p>
              <p style="margin:0;color:#f1f5f9;font-size:14px;font-weight:700;">9 Mei 2026</p>
            </div>
            <div style="flex:1;">
              <p style="margin:0 0 2px;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Lokasi</p>
              <p style="margin:0;color:#f1f5f9;font-size:14px;font-weight:700;">PNUP, Makassar</p>
            </div>
          </div>
          <div style="border-top:2px dashed #334155;padding:16px 20px;display:flex;">
            <div style="flex:1;">
              <p style="margin:0 0 2px;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Peserta</p>
              <p style="margin:0;color:#f1f5f9;font-size:14px;font-weight:700;">${escapeHtml(name)}</p>
            </div>
            ${packageName ? `
            <div style="flex:1;">
              <p style="margin:0 0 2px;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Paket</p>
              <p style="margin:0;color:#a3e635;font-size:14px;font-weight:700;">${escapeHtml(packageName)}</p>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- Status -->
        <div style="background:rgba(234,179,8,0.1);border:1px solid rgba(234,179,8,0.25);border-radius:10px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0 0 4px;font-size:14px;color:#facc15;font-weight:700;">&#9202; Menunggu Verifikasi Pembayaran</p>
          <p style="margin:0;font-size:13px;color:#fbbf24;line-height:1.6;opacity:0.8;">
            Tim kami akan memverifikasi pembayaran Anda. Konfirmasi akan dikirim melalui email.
          </p>
        </div>

        <!-- CTA -->
        <div style="text-align:center;margin:0 0 12px;">
          <a href="${siteUrl}/success?name=${encodeURIComponent(name)}${packageName ? `&package=${encodeURIComponent(packageName)}` : ''}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">
            Lihat Tiket Digital
          </a>
        </div>

        <!-- Google Calendar -->
        <div style="text-align:center;margin:0 0 20px;">
          <a href="https://www.google.com/calendar/render?action=TEMPLATE&text=Seminar%20GreenTech%20%E2%80%94%20D-Verse&dates=20260509T010000Z%2F20260509T090000Z&details=Seminar%20GreenTech%20oleh%20D-Verse%20(Developer%20Universe).%0AInfo%3A%20https%3A%2F%2Fdverse.my.id&location=Politeknik%20Negeri%20Ujung%20Pandang%2C%20Makassar" style="display:inline-block;padding:12px 28px;background:transparent;color:#22c55e;font-size:13px;font-weight:700;text-decoration:none;border-radius:10px;border:2px solid #22c55e;">
            &#128197; Tambah ke Google Calendar
          </a>
        </div>

        <!-- Contact -->
        <p style="color:#64748b;font-size:12px;line-height:1.6;margin:0;text-align:center;">
          Ada pertanyaan? Hubungi kami via WhatsApp:
          <a href="https://wa.me/6281906806724" style="color:#22c55e;text-decoration:none;font-weight:600;">+62 819-0680-6724 (ALFI)</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#0a0f1e;padding:16px 24px;text-align:center;border-top:1px solid #1e293b;">
        <p style="margin:0;color:#475569;font-size:11px;">&copy; ${new Date().getFullYear()} Developer Universe (D-Verse) &mdash; Dipanegara Computer Club</p>
      </div>
    </div>
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

  const message =
    `<b>Pendaftar Baru Masuk!</b>\n` +
    `------------------------------\n` +
    `<b>Nama:</b> ${safeName}\n` +
    `<b>Email:</b> ${safeEmail}\n` +
    `<b>No. HP:</b> ${safePhone}\n` +
    `<b>Instansi:</b> ${safeInstitution}\n` +
    `<b>Paket:</b> ${safePackageName} (${safePackagePrice})\n\n` +
    `<b>Bukti Pembayaran:</b> ${paymentLink}\n` +
    `<b>Bukti Follow:</b> ${followLink}`

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
      picPayment, picFollow,
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
    const eventName = EVENTS[1] // Active event: Seminar GreenTech

    // --- Send email + Telegram in parallel ---
    const [emailResult, telegramResult] = await Promise.allSettled([
      sendConfirmationEmail({
        to: email,
        name,
        eventName,
        packageName,
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
