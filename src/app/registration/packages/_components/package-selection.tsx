'use client'

import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { getEventPackages, getEarlyBirdConfig } from '@/lib/supabase/event-packages'
import { getRegistrationCount } from '@/lib/supabase/event-participant'
import type { IEventPackage, IEarlyBirdConfig } from '@/types/event-package'

const EVENTS: Record<number, string> = {
  1: 'Seminar GreenTech',
  2: 'Hackathon',
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export default function PackageSelection() {
  const { palette } = useTheme()
  const isDark = palette.mode === 'dark'
  const searchParams = useSearchParams()
  const eventIdParam = searchParams.get('event')
  const eventId = eventIdParam ? parseInt(eventIdParam, 10) : 1
  const eventName = EVENTS[eventId] || EVENTS[1]

  const [packages, setPackages] = useState<IEventPackage[]>([])
  const [earlyBird, setEarlyBird] = useState<IEarlyBirdConfig | null>(null)
  const [regCount, setRegCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [pkgs, ebConfig, count] = await Promise.all([
          getEventPackages(eventId),
          getEarlyBirdConfig(),
          getRegistrationCount(eventId),
        ])
        setPackages(pkgs)
        setEarlyBird(ebConfig)
        setRegCount(count)
      } catch (err) {
        console.error('Error fetching package data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [eventId])

  const isEarlyBirdActive = earlyBird?.enabled && earlyBird.eventId === eventId && regCount < earlyBird.maxCount
  const earlyBirdSlotsLeft = earlyBird ? Math.max(0, earlyBird.maxCount - regCount) : 0

  function getDisplayPrice(pkg: IEventPackage): { price: number; originalPrice?: number } {
    if (isEarlyBirdActive && pkg.discountedPrice) {
      return { price: pkg.discountedPrice, originalPrice: pkg.price }
    }
    return { price: pkg.price }
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 8, md: 12 },
        background: isDark
          ? 'linear-gradient(180deg, #0f172a 0%, #020617 100%)'
          : 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
      }}
    >
      <Container maxWidth='lg'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back button */}
          <Button
            href='/#home-registration'
            variant='text'
            sx={{
              mb: 3,
              fontWeight: 600,
              textTransform: 'none',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
            }}
          >
            ← Kembali
          </Button>

          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
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
              Pilih Paket
            </Typography>
            <Typography variant='h3' sx={{ fontWeight: 900, fontSize: { xs: '1.75rem', md: '2.5rem' }, mb: 1 }}>
              {eventName}
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ maxWidth: 600, mx: 'auto' }}>
              Pilih paket pendaftaran yang sesuai dengan kebutuhanmu
            </Typography>
          </Box>

          {/* Early Bird Banner */}
          {earlyBird?.enabled && earlyBird.eventId === eventId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Alert
                severity={isEarlyBirdActive ? 'success' : 'info'}
                sx={{
                  mb: 4,
                  borderRadius: 2,
                  fontWeight: 600,
                  '& .MuiAlert-message': { width: '100%', textAlign: 'center' },
                }}
              >
                {isEarlyBirdActive ? (
                  <>
                    🎉 <strong>Early Bird!</strong> {earlyBird.maxCount} pendaftar tercepat mendapatkan diskon {earlyBird.discountPercent}%!
                    {' '}
                    <Chip
                      label={`${earlyBirdSlotsLeft} slot tersisa`}
                      color='success'
                      size='small'
                      sx={{ fontWeight: 700, ml: 1 }}
                    />
                  </>
                ) : (
                  <>Kuota early bird telah habis. Harga normal berlaku.</>
                )}
              </Alert>
            </motion.div>
          )}

          {/* Package Cards */}
          {packages.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography color='text.secondary'>Belum ada paket tersedia untuk event ini.</Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {packages.map((pkg, index) => {
                const { price, originalPrice } = getDisplayPrice(pkg)
                return (
                  <Grid size={{ xs: 12, sm: 6 }} key={pkg.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      style={{ height: '100%' }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          borderRadius: 3,
                          overflow: 'hidden',
                          border: '2px solid',
                          borderColor: pkg.isBundle ? 'primary.main' : 'divider',
                          background: isDark
                            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(6, 78, 59, 0.15) 100%)'
                            : '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            boxShadow: isDark
                              ? '0 12px 40px rgba(46, 125, 50, 0.25)'
                              : '0 12px 40px rgba(46, 125, 50, 0.12)',
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        {/* Bundle badge */}
                        {pkg.isBundle && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 16,
                              right: -32,
                              transform: 'rotate(45deg)',
                              backgroundColor: 'primary.main',
                              color: '#fff',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              py: 0.3,
                              px: 4,
                              zIndex: 2,
                              letterSpacing: 0.5,
                              textTransform: 'uppercase',
                            }}
                          >
                            Bundle
                          </Box>
                        )}

                        {/* Image placeholder */}
                        <Box
                          sx={{
                            height: 180,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: 1,
                            background: pkg.isBundle
                              ? isDark
                                ? 'linear-gradient(135deg, #1b5e20 0%, #0d3317 100%)'
                                : 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)'
                              : isDark
                                ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                                : 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          {pkg.image ? (
                            <Box
                              component='img'
                              src={pkg.image}
                              alt={pkg.name}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          ) : (
                            <>
                              <Box sx={{ fontSize: '2.5rem' }}>
                                {pkg.isBundle ? '👕' : '🎁'}
                              </Box>
                              <Typography
                                sx={{
                                  color: pkg.isBundle || isDark ? '#fff' : 'primary.dark',
                                  fontWeight: 700,
                                  fontSize: '0.85rem',
                                }}
                              >
                                {pkg.isBundle ? 'Baju + Merch' : 'Merchandise'}
                              </Typography>
                            </>
                          )}
                        </Box>

                        {/* Content */}
                        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>
                          {/* Package name + code */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant='h5' sx={{ fontWeight: 800 }}>
                              {pkg.name}
                            </Typography>
                            <Chip
                              label={pkg.code}
                              size='small'
                              color={pkg.isBundle ? 'primary' : 'default'}
                              sx={{ fontWeight: 700 }}
                            />
                          </Box>

                          {/* Description */}
                          {pkg.description && (
                            <Typography
                              variant='body2'
                              color='text.secondary'
                              sx={{ mb: 2, lineHeight: 1.6 }}
                            >
                              {pkg.description}
                            </Typography>
                          )}

                          {/* Items / benefits list */}
                          <Box sx={{ mb: 3, flex: 1 }}>
                            {pkg.items.map((item, i) => (
                              <Box
                                key={i}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  mb: 0.8,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: '50%',
                                    backgroundColor: isDark ? 'rgba(46,125,50,0.2)' : 'rgba(46,125,50,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    fontSize: '0.65rem',
                                    color: 'primary.main',
                                    fontWeight: 700,
                                  }}
                                >
                                  ✓
                                </Box>
                                <Typography sx={{ fontSize: '0.88rem', color: 'text.secondary' }}>
                                  {item}
                                </Typography>
                              </Box>
                            ))}
                          </Box>

                          {/* Price */}
                          <Box sx={{ mb: 2 }}>
                            {originalPrice && (
                              <Typography
                                sx={{
                                  fontSize: '0.85rem',
                                  color: 'text.disabled',
                                  textDecoration: 'line-through',
                                  mb: 0.3,
                                }}
                              >
                                {formatPrice(originalPrice)}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                sx={{
                                  fontSize: '1.5rem',
                                  fontWeight: 900,
                                  color: 'primary.main',
                                }}
                              >
                                {formatPrice(price)}
                              </Typography>
                              {originalPrice && (
                                <Chip
                                  label={`-${earlyBird?.discountPercent || 10}%`}
                                  color='success'
                                  size='small'
                                  sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          </Box>

                          {/* CTA */}
                          <Button
                            variant={pkg.isBundle ? 'contained' : 'outlined'}
                            href={`/registration?event=${eventId}&package=${pkg.id}`}
                            fullWidth
                            sx={{
                              py: 1.5,
                              borderRadius: 2,
                              fontWeight: 700,
                              fontSize: '1rem',
                              textTransform: 'none',
                            }}
                          >
                            Pilih {pkg.name}
                          </Button>
                        </Box>
                      </Box>
                    </motion.div>
                  </Grid>
                )
              })}
            </Grid>
          )}

          {/* Payment info reminder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Box
              sx={{
                mt: 6,
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(240, 253, 244, 0.8)',
              }}
            >
              <Typography variant='h6' sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
                Info Pembayaran
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                    <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                      Transfer BCA
                    </Typography>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: 1 }}>
                      1100782886
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Safira Muztasyifah Syah
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                    <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                      Transfer DANA
                    </Typography>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: 1 }}>
                      081351687138
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Safira Muztasyifah Syah
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                    <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                      Wajib Follow Instagram
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 700 }}>
                      @D-Verse.id
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Screenshot bukti follow wajib diupload saat pendaftaran
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </motion.div>

          {/* Note */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant='body2' color='text.secondary'>
              * Transfer sesuai nominal paket yang dipilih. Setelah memilih paket, kamu akan diarahkan ke form pendaftaran.
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  )
}
