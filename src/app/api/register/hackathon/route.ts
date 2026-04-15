import { NextResponse } from 'next/server'
import { z } from 'zod'
import nodemailer from 'nodemailer'
import { supabase } from '@/lib/supabase/config'
import {
  registerHackathonTeam,
  checkExistingHackathonRegistration,
  checkExistingTeamName,
} from '@/lib/supabase/hackathon-participant'

// ---------------------------------------------------------------------------
// Zod Schema — validasi & sanitasi semua input dari client
// ---------------------------------------------------------------------------

/** Strip null bytes and ASCII control characters */
const stripControl = (v: string) =>
  v.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim()

const hackathonMemberSchema = z.object({
  name: z
    .string({ message: 'Nama anggota wajib diisi' })
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter')
    .transform(stripControl)
    .pipe(z.string().min(2, 'Nama tidak valid setelah sanitasi')),
  identity_url: z
    .string({ message: 'URL identitas wajib diisi' })
    .url('URL identitas tidak valid'),
})

const hackathonRegistrationSchema = z.object({
  team_name: z
    .string({ message: 'Nama tim wajib diisi' })
    .min(2, 'Nama tim minimal 2 karakter')
    .max(100, 'Nama tim maksimal 100 karakter')
    .transform(stripControl)
    .pipe(z.string().min(2, 'Nama tim tidak valid setelah sanitasi')),
  institution: z
    .string({ message: 'Asal instansi wajib diisi' })
    .min(2, 'Instansi minimal 2 karakter')
    .max(150, 'Instansi maksimal 150 karakter')
    .transform(stripControl)
    .pipe(z.string().min(2, 'Instansi tidak valid setelah sanitasi')),
  email: z
    .string({ message: 'Email wajib diisi' })
    .email('Format email tidak valid')
    .min(5, 'Email terlalu pendek')
    .max(100, 'Email terlalu panjang')
    .transform((v) => stripControl(v).toLowerCase()),
  leader_name: z
    .string({ message: 'Nama ketua wajib diisi' })
    .min(2, 'Nama ketua minimal 2 karakter')
    .max(100, 'Nama ketua maksimal 100 karakter')
    .transform(stripControl)
    .pipe(z.string().min(2, 'Nama ketua tidak valid setelah sanitasi')),
  leader_phone: z
    .string({ message: 'Nomor HP ketua wajib diisi' })
    .regex(/^[0-9+\s\-()\\.]{5,20}$/, 'Format nomor HP tidak valid')
    .transform(stripControl),
  leader_identity_url: z
    .string({ message: 'URL identitas ketua wajib diisi' })
    .url('URL identitas ketua tidak valid'),
  members: z.array(hackathonMemberSchema).min(1, 'Minimal 1 anggota').max(2, 'Maksimal 2 anggota'),
  proposal_url: z
    .string({ message: 'URL proposal wajib diisi' })
    .url('URL proposal tidak valid'),
})

type HackathonRegistrationInput = z.infer<typeof hackathonRegistrationSchema>

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
// Cooldown — in-memory, per IP (same as seminar system)
// ---------------------------------------------------------------------------

const hackathonCooldownMap = new Map<string, number>()
const COOLDOWN_MS = 12 * 60 * 60 * 1000 // 12 hours

function checkCooldown(ip: string): boolean {
  const expiresAt = hackathonCooldownMap.get(ip)
  return !expiresAt || Date.now() > expiresAt
}

function startCooldown(ip: string): void {
  hackathonCooldownMap.set(ip, Date.now() + COOLDOWN_MS)
}

function remainingCooldownText(ip: string): string {
  const expiresAt = hackathonCooldownMap.get(ip)
  if (!expiresAt) return ''
  const ms = expiresAt - Date.now()
  if (ms <= 0) return ''
  const hours = Math.floor(ms / (60 * 60 * 1000))
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
  if (hours > 0) return `${hours} jam ${minutes} menit`
  return `${minutes} menit`
}

// ---------------------------------------------------------------------------
// Nodemailer transporter (Gmail) — credentials from env, NEVER hardcoded
// ---------------------------------------------------------------------------

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// ---------------------------------------------------------------------------
// Email confirmation helper — Hackathon template
// ---------------------------------------------------------------------------

async function sendHackathonConfirmationEmail(params: {
  to: string
  team_name: string
  leader_name: string
  member_count: number
}): Promise<void> {
  const { to, team_name, leader_name, member_count } = params

  // Skip if email credentials not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('EMAIL_USER atau EMAIL_PASS belum diset — email tidak dikirim')
    return
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dverse.my.id'
  const hackathonImageUrl =
    'https://omwdnhmxmanhdzuznrks.supabase.co/storage/v1/object/public/event_images/Hack.jpeg'
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
      <img src="${hackathonImageUrl}" alt="Hackathon" width="600" style="width:100%;max-height:260px;object-fit:cover;display:block;" />
    </td>
  </tr>

  <!-- Brand Bar -->
  <tr>
    <td style="background:linear-gradient(135deg,#0f172a 0%,#162033 100%);padding:20px 32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0 0 6px;color:#ec4899;font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;">D-Verse &bull; Developer Universe</p>
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;line-height:1.3;">Hackathon 2026</h1>
          </td>
          <td width="60" align="right" valign="top">
            <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#ec4899,#be185d);text-align:center;line-height:48px;font-size:22px;">💻</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Greeting -->
  <tr>
    <td style="padding:8px 32px 0;">
      <p style="color:#e2e8f0;font-size:15px;line-height:1.7;margin:0 0 6px;">
        Halo <strong style="color:#ec4899;">${escapeHtml(leader_name)}</strong>,
      </p>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 4px;">
        Pendaftaran tim <strong style="color:#e2e8f0;">${escapeHtml(team_name)}</strong> untuk <strong style="color:#e2e8f0;">Hackathon</strong> telah kami terima dengan baik! 🎉
      </p>
    </td>
  </tr>

  <!-- Divider -->
  <tr>
    <td style="padding:20px 32px 0;">
      <div style="border-top:1px solid #1e293b;"></div>
    </td>
  </tr>

  <!-- Team Info Card -->
  <tr>
    <td style="padding:20px 32px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border:1px solid #334155;border-radius:12px;overflow:hidden;">
        <!-- Card Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#ec489915,#be185d10);padding:14px 20px;border-bottom:1px solid #334155;">
            <p style="margin:0;color:#ec4899;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">👥 Tim Kamu</p>
          </td>
        </tr>
        <!-- Card Content -->
        <tr>
          <td style="padding:16px 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" valign="top">
                  <p style="margin:0 0 3px;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Nama Tim</p>
                  <p style="margin:0;color:#f1f5f9;font-size:14px;font-weight:700;">${escapeHtml(team_name)}</p>
                </td>
                <td width="50%" valign="top">
                  <p style="margin:0 0 3px;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Jumlah Anggota</p>
                  <p style="margin:0;color:#f1f5f9;font-size:14px;font-weight:700;">${member_count + 1} Orang</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Dashed Divider -->
        <tr>
          <td style="padding:0 20px;">
            <div style="border-top:2px dashed #334155;"></div>
          </td>
        </tr>
        <!-- Status Row -->
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0 0 3px;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Status Verifikasi</p>
            <p style="margin:0;color:#f1f5f9;font-size:14px;font-weight:700;">⏳ Menunggu Verifikasi</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Next Steps Alert -->
  <tr>
    <td style="padding:20px 32px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1a1708;border:1px solid #3d3508;border-radius:10px;">
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-size:14px;color:#facc15;font-weight:700;">📋 Langkah Selanjutnya</p>
            <p style="margin:0;font-size:13px;color:#ca8a04;line-height:1.6;">
              Tim kami akan memverifikasi dokumen-dokumen yang telah Anda submit (KTM, Proposal, dll). Notifikasi update status akan dikirim ke email ini.
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
        <!-- Home Button -->
        <tr>
          <td align="center">
            <a href="${siteUrl}" style="display:inline-block;padding:14px 40px;background:#ec4899;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.3px;">
              Kembali ke Beranda &rarr;
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
        <a href="https://wa.me/6281906806724" style="color:#ec4899;text-decoration:none;font-weight:600;">+62 819-0680-6724 (ALFI)</a>
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
    subject: 'Konfirmasi Pendaftaran Hackathon 2026',
    html,
  })
}

// ---------------------------------------------------------------------------
// Telegram notification helper — Hackathon
// ---------------------------------------------------------------------------

async function sendHackathonTelegramNotification(params: {
  team_name: string
  leader_name: string
  leader_phone: string
  institution: string
  email: string
  member_count: number
  members: Array<{ name: string; identity_url: string }>
  leader_identity_url: string
  proposal_url: string
}): Promise<void> {
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN
  const telegramChatId = process.env.TELEGRAM_CHAT_ID

  if (!telegramToken || !telegramChatId) {
    console.warn('TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID belum diset')
    return
  }

  const safeTeamName = escapeHtml(params.team_name)
  const safeLeaderName = escapeHtml(params.leader_name)
  const safeLeaderPhone = escapeHtml(params.leader_phone)
  const safeInstitution = escapeHtml(params.institution)
  const safeEmail = escapeHtml(params.email)

  // Only allow https:// Supabase Storage URLs for file links
  const supabaseUrlBase = process.env.NEXT_PUBLIC_SUPABASE_URL
  const isSafeUrl = (url: unknown) =>
    typeof url === 'string' &&
    url.startsWith('https://') &&
    supabaseUrlBase &&
    url.startsWith(supabaseUrlBase)

  const leaderIdentityLink = isSafeUrl(params.leader_identity_url)
    ? `<a href="${params.leader_identity_url}">Lihat</a>`
    : '-'
  const proposalLink = isSafeUrl(params.proposal_url)
    ? `<a href="${params.proposal_url}">Lihat</a>`
    : '-'

  // Format members list
  let membersInfo = ''
  params.members.forEach((member, index) => {
    const safeName = escapeHtml(member.name)
    const memberIdentityLink = isSafeUrl(member.identity_url)
      ? `<a href="${member.identity_url}">Lihat</a>`
      : '-'
    membersInfo += `  Anggota ${index + 1}: ${safeName} | Identitas: ${memberIdentityLink}\n`
  })

  const message =
    `<b>🎉 Pendaftar Hackathon Baru!</b>\n` +
    `================================\n` +
    `<b>Nama Tim:</b> ${safeTeamName}\n` +
    `<b>Jumlah Anggota:</b> ${params.member_count + 1} orang\n` +
    `<b>Asal Instansi:</b> ${safeInstitution}\n\n` +
    `<b>👨‍💼 Ketua Tim:</b>\n` +
    `  Nama: ${safeLeaderName}\n` +
    `  No. HP: ${safeLeaderPhone}\n` +
    `  Email: ${safeEmail}\n` +
    `  Identitas: ${leaderIdentityLink}\n\n` +
    `<b>Anggota Tim:</b>\n` +
    `${membersInfo}\n` +
    `<b>📄 Proposal:</b> ${proposalLink}`

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

/** POST — validate, upload files, send notifications, register team */
export async function POST(request: Request) {
  try {
    // --- Cooldown check ---
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

    // --- Parse & validate with Zod ---
    const raw = await request.json()
    const parsed = hackathonRegistrationSchema.safeParse(raw)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Data tidak valid'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const data = parsed.data

    // --- Reject template placeholders (post-sanitisation) ---
    if (
      [data.team_name, data.institution, data.email, data.leader_name].some(
        (v) => PLACEHOLDER_RE.test(v)
      )
    ) {
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
    }

    // --- Disposable email domain ---
    const emailDomain = data.email.split('@')[1]?.toLowerCase()
    if (!emailDomain || DISPOSABLE_DOMAINS.has(emailDomain)) {
      return NextResponse.json(
        {
          error:
            'Email tidak dapat digunakan. Gunakan email pribadi yang valid.',
        },
        { status: 400 }
      )
    }

    // --- Check duplicate email ---
    const emailExists = await checkExistingHackathonRegistration(data.email)
    if (emailExists) {
      return NextResponse.json(
        { error: 'Email ini sudah terdaftar untuk Hackathon.' },
        { status: 400 }
      )
    }

    // --- Check duplicate team name ---
    const teamNameExists = await checkExistingTeamName(data.team_name)
    if (teamNameExists) {
      return NextResponse.json(
        { error: 'Nama tim ini sudah terdaftar. Gunakan nama tim yang berbeda.' },
        { status: 400 }
      )
    }

    // --- Register team in database ---
    await registerHackathonTeam({
      team_name: data.team_name,
      institution: data.institution,
      email: data.email,
      leader_name: data.leader_name,
      leader_phone: data.leader_phone,
      leader_identity_url: data.leader_identity_url,
      members: data.members,
      proposal_url: data.proposal_url,
    })

    // --- Send email + Telegram in parallel ---
    const [emailResult, telegramResult] = await Promise.allSettled([
      sendHackathonConfirmationEmail({
        to: data.email,
        team_name: data.team_name,
        leader_name: data.leader_name,
        member_count: data.members.length,
      }),
      sendHackathonTelegramNotification({
        team_name: data.team_name,
        leader_name: data.leader_name,
        leader_phone: data.leader_phone,
        institution: data.institution,
        email: data.email,
        member_count: data.members.length,
        members: data.members,
        leader_identity_url: data.leader_identity_url,
        proposal_url: data.proposal_url,
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
      { message: 'Pendaftaran tim berhasil diproses' },
      { status: 200 }
    )
  } catch (error) {
    // Safe error handling — generic message, no stack trace / token leak
    console.error(
      'API hackathon register error:',
      error instanceof Error ? error.message : error
    )
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}
