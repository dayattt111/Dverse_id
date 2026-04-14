'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EVENT_DATE = new Date('2026-05-09T09:00:00+08:00') // 9 Mei 2026, 09:00 WITA
const EVENT_IMAGE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event_images/seminar.jpeg`

const GOOGLE_CALENDAR_URL = (() => {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: 'Seminar GreenTech — D-Verse',
    dates: '20260509T010000Z/20260509T090000Z', // 09:00–17:00 WITA = 01:00–09:00 UTC
    details: 'Seminar GreenTech oleh D-Verse (Developer Universe).\nInfo: https://dverse.my.id',
    location: 'Politeknik Negeri Ujung Pandang, Makassar',
  })
  return `https://www.google.com/calendar/render?${params.toString()}`
})()

// ---------------------------------------------------------------------------
// Countdown Hook
// ---------------------------------------------------------------------------

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  return useMemo(() => {
    const diff = Math.max(0, target.getTime() - now)
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      isOver: diff <= 0,
    }
  }, [now, target])
}

// ---------------------------------------------------------------------------
// Animated Checkmark
// ---------------------------------------------------------------------------

function AnimatedCheck() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3,
          boxShadow: '0 0 40px rgba(34,197,94,0.35)',
        }}
      >
        <motion.svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.path
            d="M5 13l4 4L19 7"
            stroke="#fff"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          />
        </motion.svg>
      </Box>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Countdown Block
// ---------------------------------------------------------------------------

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <Box sx={{ textAlign: 'center', minWidth: 64 }}>
      <Box
        sx={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 2,
          px: 2,
          py: 1.5,
          mb: 0.5,
          backdropFilter: 'blur(8px)',
        }}
      >
        <Typography
          sx={{
            fontFamily: 'monospace',
            fontSize: { xs: '1.5rem', md: '2rem' },
            fontWeight: 900,
            background: 'linear-gradient(135deg, #22c55e, #a3e635)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {String(value).padStart(2, '0')}
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.65rem' }}>
        {label}
      </Typography>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// Success Content (uses useSearchParams)
// ---------------------------------------------------------------------------

function SuccessContent() {
  const searchParams = useSearchParams()
  const name = searchParams.get('name') || 'Peserta'
  const packageName = searchParams.get('package') || 'Seminar'
  const countdown = useCountdown(EVENT_DATE)

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0f1e 0%, #0f172a 40%, #020617 100%)',
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 6, md: 10 },
      }}
    >
      {/* Ambient glow effects */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          right: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Animated Check */}
        <AnimatedCheck />

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 900,
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              mb: 1.5,
              background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Pendaftaran Berhasil!
          </Typography>
          <Typography
            sx={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.6)',
              fontSize: { xs: '0.9rem', md: '1rem' },
              mb: 4,
              lineHeight: 1.7,
              px: 2,
            }}
          >
            Halo <strong style={{ color: '#22c55e' }}>{name}</strong>, tiket kamu untuk{' '}
            <strong style={{ color: '#fff' }}>Seminar GreenTech D-Verse</strong> sudah diamankan.
          </Typography>
        </motion.div>

        {/* Event Banner / Boarding Pass Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Box
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(16px)',
              mb: 4,
              boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {/* Event Image Banner */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: { xs: 180, md: 220 },
                overflow: 'hidden',
              }}
            >
              <Box
                component="img"
                src={EVENT_IMAGE_URL}
                alt="Seminar GreenTech D-Verse"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'brightness(0.7)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 40%, rgba(10,15,30,0.95) 100%)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 20,
                  right: 20,
                }}
              >
                <Typography sx={{ color: '#a3e635', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 2, mb: 0.5 }}>
                  Dverse — Developer Universe
                </Typography>
                <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: { xs: '1.1rem', md: '1.3rem' } }}>
                  Seminar GreenTech 2026
                </Typography>
              </Box>
            </Box>

            {/* Dashed divider */}
            <Box sx={{ borderTop: '2px dashed rgba(255,255,255,0.08)', mx: 2 }} />

            {/* Ticket Details */}
            <Box sx={{ p: { xs: 2.5, md: 3 } }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 120 }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, mb: 0.3 }}>
                    Nama
                  </Typography>
                  <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                    {name}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 120 }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, mb: 0.3 }}>
                    Paket Tiket
                  </Typography>
                  <Chip
                    label={packageName}
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(163,230,53,0.2))',
                      color: '#a3e635',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      border: '1px solid rgba(163,230,53,0.3)',
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 120 }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, mb: 0.3 }}>
                    Tanggal
                  </Typography>
                  <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                    9 Mei 2026
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 120 }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, mb: 0.3 }}>
                    Lokasi
                  </Typography>
                  <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                    Kampus II i Jl. Tamalanrea Raya (BTP) / Moncongloe Maros.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 2, mb: 2 }}>
              {countdown.isOver ? 'Event Telah Dimulai' : 'Event Dimulai Dalam'}
            </Typography>
            {!countdown.isOver && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 1, md: 2 } }}>
                <CountdownBlock value={countdown.days} label="Hari" />
                <CountdownBlock value={countdown.hours} label="Jam" />
                <CountdownBlock value={countdown.minutes} label="Menit" />
                <CountdownBlock value={countdown.seconds} label="Detik" />
              </Box>
            )}
          </Box>
        </motion.div>

        {/* Status Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Box
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 3,
              background: 'rgba(234,179,8,0.06)',
              border: '1px solid rgba(234,179,8,0.2)',
              textAlign: 'center',
            }}
          >
            <Typography sx={{ color: '#facc15', fontWeight: 700, fontSize: '0.85rem', mb: 0.5 }}>
              Menunggu Verifikasi Pembayaran
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', lineHeight: 1.6 }}>
              Tim kami akan memverifikasi pembayaran kamu. Konfirmasi akan dikirim melalui email.
            </Typography>
          </Box>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
            <Button
              href={GOOGLE_CALENDAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              fullWidth
              sx={{
                py: 1.8,
                borderRadius: 3,
                fontWeight: 800,
                fontSize: '0.95rem',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                boxShadow: '0 4px 20px rgba(34,197,94,0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  boxShadow: '0 6px 28px rgba(34,197,94,0.4)',
                },
              }}
            >
              Tambahkan ke Google Calendar
            </Button>
            <Button
              href="/"
              variant="outlined"
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: '0.9rem',
                textTransform: 'none',
                color: 'rgba(255,255,255,0.7)',
                borderColor: 'rgba(255,255,255,0.12)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.04)',
                },
              }}
            >
              Kembali ke Beranda
            </Button>
          </Box>
        </motion.div>

        {/* Admin Contact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <Box sx={{ textAlign: 'center', pt: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', mb: 0.5 }}>
              Ada kendala? Hubungi Admin D-Verse
            </Typography>
            <Typography
              component="a"
              href="https://wa.me/6281906806724"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: '#22c55e',
                fontWeight: 700,
                fontSize: '0.85rem',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              +62 819-0680-6724 (ALFI)
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// Page (with Suspense boundary for useSearchParams)
// ---------------------------------------------------------------------------

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0f1e',
          }}
        >
          <CircularProgress sx={{ color: '#22c55e' }} />
        </Box>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
