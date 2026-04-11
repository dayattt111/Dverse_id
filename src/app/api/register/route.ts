import { NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// Security helpers
// ---------------------------------------------------------------------------

/** Escape HTML characters to prevent injection in Telegram HTML-mode messages */
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

/** Valid characters for phone numbers */
const PHONE_RE = /^[0-9+\s\-()\\.]{5,20}$/

/**
 * Registration cooldown — in-memory, per IP.
 * After a SUCCESSFUL registration, the same IP is blocked for 12 hours.
 * Stores the Unix timestamp (ms) when the cooldown expires.
 */
const registrationCooldownMap = new Map<string, number>()
const COOLDOWN_MS = 12 * 60 * 60 * 1000 // 12 hours

/** Returns true if IP is allowed to register (not in cooldown). */
function checkCooldown(ip: string): boolean {
  const expiresAt = registrationCooldownMap.get(ip)
  return !expiresAt || Date.now() > expiresAt
}

/** Call after a successful registration to lock the IP for 12 hours. */
function startCooldown(ip: string): void {
  registrationCooldownMap.set(ip, Date.now() + COOLDOWN_MS)
}

/** Returns remaining cooldown as a human-readable Indonesian string. */
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

/** POST — validate, save to DB via server, and send Telegram notification */
export async function POST(request: Request) {
  try {
    // --- Registration cooldown (12 hours per IP after successful submit) ---
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    if (!checkCooldown(ip)) {
      const remaining = remainingCooldownText(ip)
      return NextResponse.json(
        { error: `Kamu sudah mendaftar. Coba lagi dalam ${remaining}.` },
        { status: 429 }
      )
    }

    // --- Parse body ---
    const body = await request.json()
    const { name, email, phone, institution, picPayment, picFollow, packageId, packageName, packagePrice } = body

    // --- Field presence ---
    if (!name || !email || !phone || !institution) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Ensure all critical fields are strings
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof phone !== 'string' ||
      typeof institution !== 'string'
    ) {
      return NextResponse.json({ error: 'Format data tidak valid' }, { status: 400 })
    }

    // --- Strip null bytes & control characters ---
    const CONTROL_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g
    const cleanName = name.replace(CONTROL_RE, '')
    const cleanEmail = email.replace(CONTROL_RE, '')
    const cleanPhone = phone.replace(CONTROL_RE, '')
    const cleanInstitution = institution.replace(CONTROL_RE, '')

    // Re-check presence after stripping (e.g. field was only control chars)
    if (!cleanName || !cleanEmail || !cleanPhone || !cleanInstitution) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // --- Reject template placeholders ---
    if ([cleanName, cleanEmail, cleanPhone, cleanInstitution].some((v) => PLACEHOLDER_RE.test(v))) {
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
    }

    // --- Field length (use cleaned values) ---
    if (cleanName.trim().length < 2 || cleanName.trim().length > 100) {
      return NextResponse.json({ error: 'Nama tidak valid (2–100 karakter)' }, { status: 400 })
    }
    if (cleanInstitution.trim().length < 2 || cleanInstitution.trim().length > 150) {
      return NextResponse.json(
        { error: 'Instansi tidak valid (2–150 karakter)' },
        { status: 400 }
      )
    }

    // --- Email format ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail) || cleanEmail.length < 5 || cleanEmail.length > 100) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    }

    // --- Disposable email domain ---
    const emailDomain = cleanEmail.split('@')[1]?.toLowerCase()
    if (!emailDomain || DISPOSABLE_DOMAINS.has(emailDomain)) {
      return NextResponse.json(
        { error: 'Email tidak dapat digunakan. Gunakan email pribadi yang valid.' },
        { status: 400 }
      )
    }

    // --- Phone format ---
    if (!PHONE_RE.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Format nomor HP tidak valid' },
        { status: 400 }
      )
    }

    // --- Kirim notifikasi Telegram ---
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN
    const telegramChatId = process.env.TELEGRAM_CHAT_ID

    if (telegramToken && telegramChatId) {
      // Escape all user-supplied strings before embedding in HTML message
      const safeName = escapeHtml(cleanName.trim())
      const safeEmail = escapeHtml(cleanEmail.trim())
      const safePhone = escapeHtml(cleanPhone.trim())
      const safeInstitution = escapeHtml(cleanInstitution.trim())

      // Only allow https:// Supabase Storage URLs for image links
      const supabaseUrlBase = process.env.NEXT_PUBLIC_SUPABASE_URL
      const isSafeUrl = (url: unknown) =>
        typeof url === 'string' &&
        url.startsWith('https://') &&
        supabaseUrlBase &&
        url.startsWith(supabaseUrlBase)

      const paymentLink = isSafeUrl(picPayment)
        ? `<a href="${picPayment}">Lihat</a>`
        : '-'
      const followLink = isSafeUrl(picFollow)
        ? `<a href="${picFollow}">Lihat</a>`
        : '-'

      // Build package info line for Telegram
      const safePackageName = packageName ? escapeHtml(String(packageName)) : '-'
      const safePackagePrice = packagePrice
        ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(packagePrice))
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

    // Lock this IP for 12 hours after a successful registration
    startCooldown(ip)

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
