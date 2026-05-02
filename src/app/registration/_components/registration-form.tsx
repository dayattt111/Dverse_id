'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import { useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/config'
import { registerEventParticipant, checkExistingRegistration } from '@/lib/supabase/event-participant'
import { getPackageById, getEarlyBirdConfig } from '@/lib/supabase/event-packages'
import { getRegistrationCount } from '@/lib/supabase/event-participant'
import type { IEventPackage } from '@/types/event-package'
import { compressImage } from '@/utils/compress-image'

const EVENTS: Record<number, string> = {
  1: 'Seminar GreenTech',
  2: 'Competitive Programming',
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB (akan dikompresi otomatis ke <1MB)
const COMPRESS_TARGET = 1 * 1024 * 1024 // 1MB target setelah kompresi
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png']

/** Map MIME type → safe file extension (no user-controlled extension). */
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
}

/**
 * Strip null bytes and ASCII control characters from a text field value.
 * Prevents command/injection attempts via crafted input.
 */
function sanitizeText(value: string): string {
  // Remove null bytes (\x00) and non-printable control chars except normal whitespace
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

const COOLDOWN_KEY = 'dcn_reg_cooldown_expires'
const COOLDOWN_MS = 12 * 60 * 60 * 1000 // 12 hours

/** Read cooldown expiry from localStorage (0 = no cooldown). */
function getLocalCooldownExpiry(): number {
  try {
    const stored = localStorage.getItem(COOLDOWN_KEY)
    return stored ? parseInt(stored, 10) : 0
  } catch {
    return 0
  }
}

/** Set cooldown expiry in localStorage. */
function setLocalCooldown(expiresAt: number): void {
  try {
    localStorage.setItem(COOLDOWN_KEY, String(expiresAt))
  } catch { /* ignore */ }
}

/** Format remaining ms to "HH jam MM menit SS detik". */
function formatCountdown(ms: number): string {
  if (ms <= 0) return ''
  const hours = Math.floor(ms / (60 * 60 * 1000))
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
  const seconds = Math.floor((ms % (60 * 1000)) / 1000)
  const parts: string[] = []
  if (hours > 0) parts.push(`${hours} jam`)
  if (minutes > 0) parts.push(`${minutes} menit`)
  parts.push(`${seconds} detik`)
  return parts.join(' ')
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export default function RegistrationForm() {
  const { palette } = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventIdParam = searchParams.get('event')
  const eventId = eventIdParam ? parseInt(eventIdParam, 10) : 1
  const eventName = EVENTS[eventId] || EVENTS[1]
  const packageIdParam = searchParams.get('package')
  const packageId = packageIdParam ? parseInt(packageIdParam, 10) : null

  const [selectedPackage, setSelectedPackage] = useState<IEventPackage | null>(null)
  const [displayPrice, setDisplayPrice] = useState<number>(0)
  const [packageLoading, setPackageLoading] = useState(!!packageId)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    registrationType: 'individual',
    teamMemberName: '',
    teamMemberEmail: '',
    teamMemberPhone: '',
    teamMemberInstitution: '',
  })
  const [picPayment, setPicPayment] = useState<File | null>(null)
  const [picFollow, setPicFollow] = useState<File | null>(null)
  const [picKtm, setPicKtm] = useState<File | null>(null)
  const [teamMemberPicKtm, setTeamMemberPicKtm] = useState<File | null>(null)
  const [picPaymentPreview, setPicPaymentPreview] = useState<string | null>(null)
  const [picFollowPreview, setPicFollowPreview] = useState<string | null>(null)
  const [picKtmPreview, setPicKtmPreview] = useState<string | null>(null)
  const [teamMemberPicKtmPreview, setTeamMemberPicKtmPreview] = useState<string | null>(null)
  const [compressing, setCompressing] = useState<'payment' | 'follow' | 'ktm' | 'team_ktm' | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldownExpiry, setCooldownExpiry] = useState<number>(0)
  const [countdownText, setCountdownText] = useState<string>('')

  const paymentInputRef = useRef<HTMLInputElement>(null)
  const followInputRef = useRef<HTMLInputElement>(null)
  const ktmInputRef = useRef<HTMLInputElement>(null)
  const teamMemberKtmInputRef = useRef<HTMLInputElement>(null)

  // --- Cooldown logic ---
  const checkAndSetCooldown = useCallback(async () => {
    // 1. Check localStorage first
    const localExpiry = getLocalCooldownExpiry()
    if (localExpiry > Date.now()) {
      setCooldownExpiry(localExpiry)
      return
    }

    // 2. Check server-side cooldown
    try {
      const res = await fetch('/api/register')
      const data = await res.json()
      if (!data.allowed && data.expiresAt > Date.now()) {
        setCooldownExpiry(data.expiresAt)
        setLocalCooldown(data.expiresAt)
      }
    } catch { /* ignore — allow form to show */ }
  }, [])

  // Check cooldown on mount
  useEffect(() => {
    checkAndSetCooldown()
  }, [checkAndSetCooldown])

  // Fetch package details or set default for seminar
  useEffect(() => {
    if (packageId) {
      // Package selected — fetch details
      async function fetchPackage() {
        try {
          const [pkg, ebConfig, count] = await Promise.all([
            getPackageById(packageId!),
            getEarlyBirdConfig(),
            getRegistrationCount(eventId),
          ])
          if (!pkg) {
            router.replace(`/registration/packages?event=${eventId}`)
            return
          }
          setSelectedPackage(pkg)

          const isEb = ebConfig?.enabled && ebConfig.eventId === eventId && count < ebConfig.maxCount
          setDisplayPrice(isEb && pkg.discountedPrice ? pkg.discountedPrice : pkg.price)
        } catch {
          router.replace(`/registration/packages?event=${eventId}`)
        } finally {
          setPackageLoading(false)
        }
      }
      fetchPackage()
    } else {
      // No package selected — use default seminar package
      setSelectedPackage({
        id: 1,
        eventId: eventId,
        name: 'Seminar GreenTech',
        code: 'SEMINAR',
        price: 35000,
        discountedPrice: undefined,
        description: 'Pendaftaran Seminar GreenTech',
        items: ['Merch', 'Makanan Berat', 'Makanan Ringan', 'Kesempatan mendapatkan doorprize menarik'],
        image: undefined,
        isBundle: false,
        sortOrder: 1,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      setDisplayPrice(35000)
      setPackageLoading(false)
    }
  }, [packageId, eventId, router])

  // Live countdown ticker
  useEffect(() => {
    if (!cooldownExpiry || cooldownExpiry <= Date.now()) {
      setCountdownText('')
      return
    }

    const tick = () => {
      const remaining = cooldownExpiry - Date.now()
      if (remaining <= 0) {
        setCooldownExpiry(0)
        setCountdownText('')
        try { localStorage.removeItem(COOLDOWN_KEY) } catch { /* ignore */ }
        return
      }
      setCountdownText(formatCountdown(remaining))
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [cooldownExpiry])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: sanitizeText(e.target.value) }))
  }

  const validateFile = (file: File): string | null => {
    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      return 'Format file tidak valid. Gunakan JPG atau PNG.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Ukuran file terlalu besar. Maksimal 5MB.'
    }
    return null
  }

  const handleFileSelect = async (
    type: 'payment' | 'follow' | 'ktm' | 'team_ktm',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const err = validateFile(file)
    if (err) {
      setError(err)
      return
    }
    setError(null)

    // Compress image if over 1MB
    let finalFile = file
    if (file.size > COMPRESS_TARGET) {
      setCompressing(type)
      try {
        finalFile = await compressImage(file, { targetSize: COMPRESS_TARGET })
      } catch {
        setError('Gagal mengompres gambar. Coba gambar lain.')
        setCompressing(null)
        return
      }
      setCompressing(null)
    }

    const previewUrl = URL.createObjectURL(finalFile)
    if (type === 'payment') {
      setPicPayment(finalFile)
      setPicPaymentPreview(previewUrl)
    } else if (type === 'follow') {
      setPicFollow(finalFile)
      setPicFollowPreview(previewUrl)
    } else if (type === 'ktm') {
      setPicKtm(finalFile)
      setPicKtmPreview(previewUrl)
    } else if (type === 'team_ktm') {
      setTeamMemberPicKtm(finalFile)
      setTeamMemberPicKtmPreview(previewUrl)
    }
  }

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    // Derive extension from MIME type — never from user-controlled filename
    const ext = MIME_TO_EXT[file.type] ?? 'jpg'
    const timestamp = Date.now()
    const filename = `${timestamp}_${Math.random().toString(36).substring(2, 9)}.${ext}`
    const filePath = `${folder}/${filename}`

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath)
    return urlData.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validasi
    if (!form.name || !form.email || !form.phone || !form.institution) {
      setError('Semua field utama harus diisi.')
      return
    }

    if (eventId === 2 && form.registrationType === 'team') {
      if (!form.teamMemberName || !form.teamMemberEmail || !form.teamMemberPhone || !form.teamMemberInstitution) {
        setError('Semua field anggota tim harus diisi.')
        return
      }
      if (!emailRegex.test(form.teamMemberEmail)) {
        setError('Format email anggota tim tidak valid.')
        return
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setError('Format email tidak valid.')
      return
    }

    if (!picPayment) {
      setError('Bukti pembayaran harus diupload.')
      return
    }

    if (!picFollow) {
      setError('Bukti follow harus diupload.')
      return
    }

    if (eventId === 2) {
      if (!picKtm) {
        setError('Bukti KTM / Kartu Siswa (Ketua) harus diupload.')
        return
      }
      if (form.registrationType === 'team' && !teamMemberPicKtm) {
        setError('Bukti KTM / Kartu Siswa (Anggota Tim) harus diupload.')
        return
      }
    }

    setLoading(true)

    try {
      // --- Check cooldown BEFORE any DB/upload operations ---
      const cooldownRes = await fetch('/api/register')
      const cooldownData = await cooldownRes.json()
      if (!cooldownData.allowed && cooldownData.expiresAt > Date.now()) {
        setCooldownExpiry(cooldownData.expiresAt)
        setLocalCooldown(cooldownData.expiresAt)
        setError('Kamu sudah mendaftar sebelumnya. Silakan tunggu hingga cooldown selesai.')
        setLoading(false)
        return
      }

      // Cek duplikat pendaftaran
      const exists = await checkExistingRegistration(eventId, form.email)
      if (exists) {
        setError('Email ini sudah terdaftar untuk event ini.')
        setLoading(false)
        return
      }

      // Upload foto
      const [paymentUrl, followUrl, ktmUrl, teamKtmUrl] = await Promise.all([
        uploadFile(picPayment, 'event-participant/payment'),
        uploadFile(picFollow, 'event-participant/follow'),
        picKtm ? uploadFile(picKtm, 'event-participant/ktm') : Promise.resolve(undefined),
        teamMemberPicKtm ? uploadFile(teamMemberPicKtm, 'event-participant/ktm') : Promise.resolve(undefined),
      ])

      // Simpan data
      await registerEventParticipant({
        eventId,
        packageId: selectedPackage?.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        institution: form.institution,
        registrationType: eventId === 2 ? (form.registrationType as 'individual' | 'team') : 'individual',
        teamMemberName: eventId === 2 && form.registrationType === 'team' ? form.teamMemberName : undefined,
        teamMemberEmail: eventId === 2 && form.registrationType === 'team' ? form.teamMemberEmail : undefined,
        teamMemberPhone: eventId === 2 && form.registrationType === 'team' ? form.teamMemberPhone : undefined,
        teamMemberInstitution: eventId === 2 && form.registrationType === 'team' ? form.teamMemberInstitution : undefined,
        picPayment: paymentUrl,
        picFollow: followUrl,
        picKtm: ktmUrl,
        teamMemberPicKtm: teamKtmUrl,
      })

      // Kirim notifikasi Telegram via API route (also triggers server-side cooldown)
      try {
        const telegramRes = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            institution: form.institution,
            packageId: selectedPackage?.id,
            packageName: selectedPackage?.name || (eventId === 2 ? 'Competitive Programming' : 'Seminar GreenTech'),
            packagePrice: displayPrice,
            picPayment: paymentUrl,
            picFollow: followUrl,
            picKtm: ktmUrl,
            teamMemberPicKtm: teamKtmUrl,
            registrationType: eventId === 2 ? form.registrationType : 'individual',
            teamMemberName: eventId === 2 && form.registrationType === 'team' ? form.teamMemberName : undefined,
            teamMemberEmail: eventId === 2 && form.registrationType === 'team' ? form.teamMemberEmail : undefined,
            teamMemberPhone: eventId === 2 && form.registrationType === 'team' ? form.teamMemberPhone : undefined,
            teamMemberInstitution: eventId === 2 && form.registrationType === 'team' ? form.teamMemberInstitution : undefined,
            eventId: eventId,
          }),
        })

        if (telegramRes.status === 429) {
          const data = await telegramRes.json()
          setError(data.error || 'Terlalu banyak permintaan.')
          setLoading(false)
          return
        }
      } catch (err) {
        console.error('Telegram notification error:', err)
      }

      // Set client-side cooldown (12 hours)
      const expiresAt = Date.now() + COOLDOWN_MS
      setLocalCooldown(expiresAt)
      setCooldownExpiry(expiresAt)

      // Redirect to success page with params
      const successParams = new URLSearchParams({
        name: form.name,
        ...(selectedPackage?.name ? { package: selectedPackage.name } : {}),
      })
      router.push(`/success?${successParams.toString()}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('Registration error:', message)
      setError(message || 'Gagal mendaftar. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (packageLoading) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (cooldownExpiry > Date.now() && countdownText && !success) {
    return (
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          background:
            palette.mode === 'dark'
              ? 'linear-gradient(180deg, #0f172a 0%, #020617 100%)'
              : 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
        }}
      >
        <Container maxWidth='sm'>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                textAlign: 'center',
                p: 5,
                borderRadius: 3,
                border: '2px solid',
                borderColor: 'warning.main',
                background:
                  palette.mode === 'dark'
                    ? 'rgba(15, 23, 42, 0.9)'
                    : '#ffffff',
              }}
            >
              <Typography variant='h4' sx={{ fontWeight: 800, mb: 2, color: 'warning.main' }}>
                Pendaftaran Ditunda
              </Typography>
              <Typography color='text.secondary' sx={{ mb: 3 }}>
                Kamu sudah melakukan pendaftaran sebelumnya. Silakan tunggu hingga cooldown selesai untuk mendaftar kembali.
              </Typography>

              {/* Countdown */}
              <Box
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 2,
                  background:
                    palette.mode === 'dark'
                      ? 'rgba(255, 167, 38, 0.1)'
                      : 'rgba(255, 243, 224, 0.8)',
                  border: '1px solid',
                  borderColor: 'warning.light',
                }}
              >
                <Typography variant='overline' sx={{ fontWeight: 700, letterSpacing: 1, color: 'warning.main', display: 'block', mb: 1 }}>
                  Dapat mendaftar lagi dalam
                </Typography>
                <Typography variant='h5' sx={{ fontWeight: 900, fontFamily: 'monospace' }}>
                  {countdownText}
                </Typography>
              </Box>

              {/* Admin contact */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  background:
                    palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.03)',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  Apabila terkendala, silakan hubungi admin:
                </Typography>
                <Typography
                  component='a'
                  href='https://wa.me/6281906806724'
                  target='_blank'
                  rel='noopener noreferrer'
                  sx={{
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  +62 819-0680-6724 (ALFI)
                </Typography>
              </Box>

              <Button
                variant='outlined'
                href='/'
                sx={{
                  mt: 3,
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                Kembali ke Beranda
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>
    )
  }

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          background:
            palette.mode === 'dark'
              ? 'linear-gradient(180deg, #0f172a 0%, #020617 100%)'
              : 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
        }}
      >
        <Container maxWidth='sm'>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                textAlign: 'center',
                p: 5,
                borderRadius: 3,
                border: '2px solid',
                borderColor: 'primary.main',
                background:
                  palette.mode === 'dark'
                    ? 'rgba(15, 23, 42, 0.9)'
                    : '#ffffff',
              }}
            >
              <Typography variant='h4' sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
                Pendaftaran Berhasil!
              </Typography>
              <Typography color='text.secondary' sx={{ mb: 3 }}>
                Terima kasih telah mendaftar <strong>{eventName}</strong>. Data pendaftaran kamu
                sedang diverifikasi. Kami akan menghubungi kamu melalui email.
              </Typography>
              <Button
                variant='contained'
                href='/'
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                Kembali ke Beranda
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 8, md: 12 },
        background:
          palette.mode === 'dark'
            ? 'linear-gradient(180deg, #0f172a 0%, #020617 100%)'
            : 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
      }}
    >
      <Container maxWidth='sm'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant='overline'
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                letterSpacing: 2,
                mb: 1,
                display: 'block',
              }}
            >
              Pendaftaran
            </Typography>
            <Typography variant='h3' sx={{ fontWeight: 900, fontSize: { xs: '1.75rem', md: '2.5rem' }, mb: 1 }}>
              {eventName}
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Isi formulir di bawah ini untuk mendaftar event.
            </Typography>
          </Box>

          {/* Selected Package Info (Only for non-competition) */}
          {eventId !== 2 && selectedPackage && (
            <Box
              sx={{
                mb: 4,
                p: 3,
                borderRadius: 3,
                border: '2px solid',
                borderColor: 'primary.main',
                background: palette.mode === 'dark'
                  ? 'rgba(46, 125, 50, 0.08)'
                  : 'rgba(240, 253, 244, 0.9)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant='h6' sx={{ fontWeight: 800 }}>
                    {selectedPackage.name}
                  </Typography>
                  <Chip label={selectedPackage.code} size='small' color='primary' sx={{ fontWeight: 700 }} />
                </Box>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: 'primary.main' }}>
                  {formatPrice(displayPrice)}
                </Typography>
              </Box>
              {selectedPackage.description && (
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>
                  {selectedPackage.description}
                </Typography>
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selectedPackage.items.map((item, i) => (
                  <Chip key={i} label={item} size='small' variant='outlined' sx={{ fontSize: '0.75rem' }} />
                ))}
              </Box>
              <Button
                href={`/registration/packages?event=${eventId}`}
                size='small'
                sx={{ mt: 1.5, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
              >
                ← Ganti paket
              </Button>
            </Box>
          )}

          {/* Competition System Info (Only for Competition) */}
          {eventId === 2 && (
            <Box
              sx={{
                mb: 4,
                p: 3,
                borderRadius: 3,
                backgroundColor: palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(0,0,0,0.03)',
                border: '1px dashed',
                borderColor: 'divider',
              }}
            >
              <Typography variant='h6' sx={{ fontWeight: 800, color: 'secondary.main', mb: 1 }}>
                Sistem Lomba & Panduan
              </Typography>
              <Typography sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                Peserta akan bersaing melalui sistem <b>leaderboard</b> untuk menentukan 16 besar terbaik.
                Selanjutnya, 16 besar akan bertanding menggunakan sistem <b>bracket (bagan)</b> hingga menentukan pemenang.
              </Typography>
            </Box>
          )}

          {/* Form */}
          <Box
            component='form'
            onSubmit={handleSubmit}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background:
                palette.mode === 'dark'
                  ? 'rgba(15, 23, 42, 0.8)'
                  : '#ffffff',
              boxShadow:
                palette.mode === 'dark'
                  ? '0 8px 32px rgba(0,0,0,0.3)'
                  : '0 8px 32px rgba(0,0,0,0.08)',
            }}
          >
            {error && (
              <Alert severity='error' sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {eventId === 2 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant='subtitle2' sx={{ mb: 1.5, fontWeight: 700 }}>
                  Pendaftaran Sebagai:
                </Typography>
                <RadioGroup
                  row
                  name="registrationType"
                  value={form.registrationType}
                  onChange={handleChange}
                >
                  <FormControlLabel value="individual" control={<Radio />} label="Individu" />
                  <FormControlLabel value="team" control={<Radio />} label="Tim (Maks. 2 Orang)" />
                </RadioGroup>
              </Box>
            )}

            {eventId === 2 && form.registrationType === 'team' && (
              <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
                Biodata Ketua Tim
              </Typography>
            )}

            <TextField
              fullWidth
              label={eventId === 2 && form.registrationType === 'team' ? 'Nama Lengkap Ketua' : 'Nama Lengkap'}
              name='name'
              value={form.name}
              onChange={handleChange}
              required
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth
              label='Email'
              name='email'
              type='email'
              value={form.email}
              onChange={handleChange}
              required
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth
              label='No. Telepon / WhatsApp'
              name='phone'
              value={form.phone}
              onChange={handleChange}
              required
              placeholder='08xxxxxxxxxx'
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth
              label='Institusi / Kampus'
              name='institution'
              value={form.institution}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
            />

            {eventId === 2 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                  Upload Kartu Pelajar / KTM (Ketua/Individu) *
                </Typography>
                <Button variant='outlined' component='label' fullWidth sx={{ mb: 1 }}>
                  Pilih File
                  <input
                    type='file'
                    hidden
                    accept='image/jpeg,image/png'
                    onChange={(e) => handleFileSelect('ktm', e)}
                    ref={ktmInputRef}
                  />
                </Button>
                {compressing === 'ktm' && (
                  <Typography variant='caption' color='warning.main'>
                    Mengompresi gambar...
                  </Typography>
                )}
                {picKtmPreview && (
                  <Box sx={{ mt: 1, position: 'relative', width: 120, height: 120, border: '1px solid #ccc', borderRadius: 1, overflow: 'hidden' }}>
                    <img src={picKtmPreview} alt='KTM Ketua' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <IconButton size='small' onClick={() => { setPicKtm(null); setPicKtmPreview(null); if (ktmInputRef.current) ktmInputRef.current.value = '' }} sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
                      ×
                    </IconButton>
                  </Box>
                )}
              </Box>
            )}

            {eventId === 2 && form.registrationType === 'team' && (
              <Box sx={{ mt: 4, mb: 2, pt: 3, borderTop: '1px dashed', borderColor: 'divider' }}>
                <Typography variant='subtitle1' sx={{ mb: 2.5, fontWeight: 700, color: 'primary.main' }}>
                  Biodata Anggota Tim
                </Typography>
                
                <TextField
                  fullWidth
                  label='Nama Lengkap Anggota'
                  name='teamMemberName'
                  value={form.teamMemberName}
                  onChange={handleChange}
                  required={form.registrationType === 'team'}
                  sx={{ mb: 2.5 }}
                />

                <TextField
                  fullWidth
                  label='Email Anggota'
                  name='teamMemberEmail'
                  type='email'
                  value={form.teamMemberEmail}
                  onChange={handleChange}
                  required={form.registrationType === 'team'}
                  sx={{ mb: 2.5 }}
                />

                <TextField
                  fullWidth
                  label='No. Telepon / WhatsApp Anggota'
                  name='teamMemberPhone'
                  value={form.teamMemberPhone}
                  onChange={handleChange}
                  required={form.registrationType === 'team'}
                  sx={{ mb: 2.5 }}
                />

                <TextField
                  fullWidth
                  label='Institusi / Kampus Anggota'
                  name='teamMemberInstitution'
                  value={form.teamMemberInstitution}
                  onChange={handleChange}
                  required={form.registrationType === 'team'}
                  sx={{ mb: 3 }}
                />

                <Box sx={{ mb: 3 }}>
                  <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                    Upload Kartu Pelajar / KTM (Anggota) *
                  </Typography>
                  <Button variant='outlined' component='label' fullWidth sx={{ mb: 1 }}>
                    Pilih File
                    <input
                      type='file'
                      hidden
                      accept='image/jpeg,image/png'
                      onChange={(e) => handleFileSelect('team_ktm', e)}
                      ref={teamMemberKtmInputRef}
                    />
                  </Button>
                  {compressing === 'team_ktm' && (
                    <Typography variant='caption' color='warning.main'>
                      Mengompresi gambar...
                    </Typography>
                  )}
                  {teamMemberPicKtmPreview && (
                    <Box sx={{ mt: 1, position: 'relative', width: 120, height: 120, border: '1px solid #ccc', borderRadius: 1, overflow: 'hidden' }}>
                      <img src={teamMemberPicKtmPreview} alt='KTM Anggota' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <IconButton size='small' onClick={() => { setTeamMemberPicKtm(null); setTeamMemberPicKtmPreview(null); if (teamMemberKtmInputRef.current) teamMemberKtmInputRef.current.value = '' }} sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
                        ×
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

{/* Info Pembayaran */}
<Box
  sx={{
    mb: 3,
    p: 2.5,
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'primary.main', // Typo diperbaiki di sini
    background: palette.mode === 'dark'
      ? 'rgba(46, 125, 50, 0.08)'
      : 'rgba(240, 253, 244, 0.9)',
  }}
>
  <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1.5, color: 'primary.main' }}>
    Info Transfer Pembayaran {selectedPackage ? `— ${formatPrice(displayPrice)}` : ''}
  </Typography>
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    {/* Baris BCA */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>BCA</Typography>
      <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: 0.5 }}>1100782886</Typography>
    </Box>
    
    {/* Baris DANA */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>DANA</Typography>
      <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: 0.5 }}>081351687138</Typography>
    </Box>

    {/* Baris Tambahan Atas Nama (a/n) */}
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mt: 0.5,
        pt: 1.5,
        borderTop: '1px dashed',
        borderColor: 'divider' // Memberikan garis pemisah yang halus menyesuaikan mode terang/gelap
      }}
    >
      <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
        Atas Nama (a/n)
      </Typography>
      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'capitalize' }}>
        Safira Muztasyifah Syah
      </Typography>
    </Box>
  </Box>
</Box>

            {/* Upload Bukti Pembayaran */}
            <Box sx={{ mb: 3 }}>
              <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                Bukti Pembayaran *
              </Typography>
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1.5 }}>
                Upload foto/screenshot bukti transfer. Maks 5MB, otomatis dikompresi (JPG atau PNG)
              </Typography>
              <input
                ref={paymentInputRef}
                type='file'
                accept='image/jpeg,image/png'
                onChange={(e) => handleFileSelect('payment', e)}
                style={{ display: 'none' }}
              />
              {picPaymentPreview ? (
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Box
                    component='img'
                    src={picPaymentPreview}
                    alt='Bukti Pembayaran'
                    sx={{
                      width: '100%',
                      maxHeight: 240,
                      objectFit: 'contain',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                  <IconButton
                    size='small'
                    onClick={() => {
                      setPicPayment(null)
                      setPicPaymentPreview(null)
                      if (paymentInputRef.current) paymentInputRef.current.value = ''
                    }}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'error.main',
                      color: '#fff',
                      '&:hover': { bgcolor: 'error.dark' },
                      width: 28,
                      height: 28,
                      fontSize: '0.85rem',
                    }}
                  >
                    ✕
                  </IconButton>
                </Box>
              ) : (
                <Button
                  variant='outlined'
                  onClick={() => paymentInputRef.current?.click()}
                  disabled={compressing === 'payment'}
                  sx={{
                    width: '100%',
                    py: 4,
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {compressing === 'payment' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={18} color='inherit' />
                      Mengompresi gambar...
                    </Box>
                  ) : (
                    'Klik untuk upload bukti pembayaran'
                  )}
                </Button>
              )}
            </Box>

            {/* Upload Bukti Follow */}
            <Box sx={{ mb: 4 }}>
              <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                Bukti Follow Instagram *
              </Typography>
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1.5 }}>
                Wajib follow <strong><a href="https://www.instagram.com/dverse.id" target="_blank" rel="noopener noreferrer">@dverse.id</a></strong> di Instagram, lalu upload screenshot bukti follow. Maks 5MB, otomatis dikompresi (JPG atau PNG)
              </Typography>
              <input
                ref={followInputRef}
                type='file'
                accept='image/jpeg,image/png'
                onChange={(e) => handleFileSelect('follow', e)}
                style={{ display: 'none' }}
              />
              {picFollowPreview ? (
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Box
                    component='img'
                    src={picFollowPreview}
                    alt='Bukti Follow'
                    sx={{
                      width: '100%',
                      maxHeight: 240,
                      objectFit: 'contain',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                  <IconButton
                    size='small'
                    onClick={() => {
                      setPicFollow(null)
                      setPicFollowPreview(null)
                      if (followInputRef.current) followInputRef.current.value = ''
                    }}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'error.main',
                      color: '#fff',
                      '&:hover': { bgcolor: 'error.dark' },
                      width: 28,
                      height: 28,
                      fontSize: '0.85rem',
                    }}
                  >
                    ✕
                  </IconButton>
                </Box>
              ) : (
                <Button
                  variant='outlined'
                  onClick={() => followInputRef.current?.click()}
                  disabled={compressing === 'follow'}
                  sx={{
                    width: '100%',
                    py: 4,
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {compressing === 'follow' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={18} color='inherit' />
                      Mengompresi gambar...
                    </Box>
                  ) : (
                    'Klik untuk upload bukti follow'
                  )}
                </Button>
              )}
            </Box>

            {/* Submit */}
            <Button
              type='submit'
              variant='contained'
              fullWidth
              disabled={loading || !!compressing}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color='inherit' />
                  Mendaftar...
                </Box>
              ) : (
                'Daftar Sekarang'
              )}
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  )
}
