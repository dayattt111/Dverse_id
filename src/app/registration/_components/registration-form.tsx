'use client'

import React, { useState, useRef } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/config'
import { registerEventParticipant, checkExistingRegistration } from '@/lib/supabase/event-participant'

const EVENTS: Record<number, string> = {
  1: 'Seminar GreenTech',
  2: 'Hackathon 48 Jam',
}

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function RegistrationForm() {
  const { palette } = useTheme()
  const searchParams = useSearchParams()
  const eventIdParam = searchParams.get('event')
  const eventId = eventIdParam ? parseInt(eventIdParam, 10) : 1
  const eventName = EVENTS[eventId] || EVENTS[1]

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
  })
  const [picPayment, setPicPayment] = useState<File | null>(null)
  const [picFollow, setPicFollow] = useState<File | null>(null)
  const [picPaymentPreview, setPicPaymentPreview] = useState<string | null>(null)
  const [picFollowPreview, setPicFollowPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const paymentInputRef = useRef<HTMLInputElement>(null)
  const followInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const validateFile = (file: File): string | null => {
    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      return 'Format file tidak valid. Gunakan JPG, PNG, atau WebP.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Ukuran file terlalu besar. Maksimal 2MB.'
    }
    return null
  }

  const handleFileSelect = (
    type: 'payment' | 'follow',
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

    const previewUrl = URL.createObjectURL(file)
    if (type === 'payment') {
      setPicPayment(file)
      setPicPaymentPreview(previewUrl)
    } else {
      setPicFollow(file)
      setPicFollowPreview(previewUrl)
    }
  }

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const timestamp = Date.now()
    const ext = file.name.split('.').pop()
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
      setError('Semua field harus diisi.')
      return
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

    setLoading(true)

    try {
      // Cek duplikat pendaftaran
      const exists = await checkExistingRegistration(eventId, form.email)
      if (exists) {
        setError('Email ini sudah terdaftar untuk event ini.')
        setLoading(false)
        return
      }

      // Upload foto
      const [paymentUrl, followUrl] = await Promise.all([
        uploadFile(picPayment, 'event-participant/payment'),
        uploadFile(picFollow, 'event-participant/follow'),
      ])

      // Simpan data
      await registerEventParticipant({
        eventId,
        name: form.name,
        email: form.email,
        phone: form.phone,
        institution: form.institution,
        picPayment: paymentUrl,
        picFollow: followUrl,
      })

      // Kirim notifikasi Telegram via API route
      fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          institution: form.institution,
          picPayment: paymentUrl,
          picFollow: followUrl,
        }),
      }).catch((err) => console.error('Telegram notification error:', err))

      setSuccess(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('Registration error:', message)
      setError(message || 'Gagal mendaftar. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
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
              <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label='Nama Lengkap'
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

            {/* Upload Bukti Pembayaran */}
            <Box sx={{ mb: 3 }}>
              <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                Bukti Pembayaran *
              </Typography>
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1.5 }}>
                Upload foto/screenshot bukti pembayaran. Maks 2MB (JPG, PNG, WebP)
              </Typography>
              <input
                ref={paymentInputRef}
                type='file'
                accept='image/jpeg,image/png,image/webp'
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
                  sx={{
                    width: '100%',
                    py: 4,
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Klik untuk upload bukti pembayaran
                </Button>
              )}
            </Box>

            {/* Upload Bukti Follow */}
            <Box sx={{ mb: 4 }}>
              <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                Bukti Follow *
              </Typography>
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1.5 }}>
                Upload foto/screenshot bukti sudah follow akun kami. Maks 2MB (JPG, PNG, WebP)
              </Typography>
              <input
                ref={followInputRef}
                type='file'
                accept='image/jpeg,image/png,image/webp'
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
                  sx={{
                    width: '100%',
                    py: 4,
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Klik untuk upload bukti follow
                </Button>
              )}
            </Box>

            {/* Submit */}
            <Button
              type='submit'
              variant='contained'
              fullWidth
              disabled={loading}
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
