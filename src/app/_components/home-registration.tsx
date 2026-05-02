'use client'

import React from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

const events = [
  {
    id: 1,
    title: 'Seminar GreenTech',
    date: '9 Mei 2026',
    description:
      'Seminar sehari penuh dengan keynote speakers dari industri teknologi, membahas inovasi Green Technology dan peran developer dalam keberlanjutan lingkungan.',
    benefits: [
      'Merch',
      'Makanan Berat',
      'Makanan Ringan',
      'Kesempatan mendapatkan doorprize menarik',
    ],
    type: 'seminar' as const,
    image: `${SUPABASE_URL}/storage/v1/object/public/event_images/seminar.jpeg`,
    priceLabel: 'Rp 35.000',
    disabled: false,
    ctaText: 'Daftar Seminar',
    ctaHref: '/registration?event=1',
  },
  {
    id: 2,
    title: 'Competitive Programming',
    date: '16 Mei 2026',
    description:
      'Kompetisi tim/individu untuk membangun solusi inovatif berbasis teknologi hijau. Tunjukkan skill coding dan problem solving kamu dan menangkan hadiah menarik!',
    benefits: [
      'Kompetisi berbasis tim/individu',
      'Networking dari berbagai kalangan',
      'Sertifikat & portfolio',
      'Hadiah menarik untuk juara',
    ],
    type: 'competition' as const,
    image: `${SUPABASE_URL}/storage/v1/object/public/event_images/Hack.jpeg`,
    priceLabel: 'Rp 50.000',
    disabled: false,
    ctaText: 'Daftar Competition',
    ctaHref: '/registration?event=2',
  },
]

const HomeRegistration = () => {
  const { palette } = useTheme()
  const isDark = palette.mode === 'dark'

  return (
    <Box
      id='home-registration'
      component='section'
      sx={{
        width: '100%',
        py: { xs: 8, md: 14 },
        position: 'relative',
        background: isDark
          ? 'linear-gradient(180deg, #0f172a 0%, #020617 100%)'
          : 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
      }}
    >
      <Container maxWidth='lg'>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography
              variant='overline'
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                letterSpacing: 2,
                mb: 2,
                display: 'block',
              }}
            >
              Pendaftaran
            </Typography>
            <Typography
              variant='h3'
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                mb: 2,
              }}
            >
              Daftar Sekarang
            </Typography>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{ maxWidth: 700, mx: 'auto', fontSize: { xs: '1rem', md: '1.1rem' } }}
            >
              Pilih event yang ingin kamu ikuti. Pendaftaran terbatas, jangan sampai ketinggalan!
            </Typography>
          </Box>
        </motion.div>

        {/* Event Cards — stacked rows */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}
            >
              <Box
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '2px solid',
                  borderColor: event.disabled ? 'secondary.main' : 'primary.main',
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(6, 78, 59, 0.2) 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                  transition: 'all 0.3s ease',
                  opacity: event.disabled ? 0.7 : 1,
                  '&:hover': {
                    transform: event.disabled ? 'none' : 'translateY(-4px)',
                    boxShadow: event.disabled
                      ? 'none'
                      : isDark
                        ? '0 16px 48px rgba(46, 125, 50, 0.3)'
                        : '0 16px 48px rgba(46, 125, 50, 0.15)',
                  },
                }}
              >
                <Grid container>
                  {/* Column 1 — Event Image */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box
                      sx={{
                        height: { xs: 180, md: '100%' },
                        minHeight: { md: 200 },
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        component='img'
                        src={event.image}
                        alt={event.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                          display: 'block',
                        }}
                      />
                      {/* Gradient overlay for text readability */}
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 55%)',
                        }}
                      />
                      {/* Title + date pinned at bottom */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          p: 2.5,
                        }}
                      >
                        <Typography
                          sx={{
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: { xs: '1.1rem', md: '1.3rem' },
                            lineHeight: 1.3,
                            mb: 0.5,
                            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                          }}
                        >
                          {event.title}
                        </Typography>
                        <Typography
                          sx={{
                            color: 'rgba(255,255,255,0.9)',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                          }}
                        >
                          {event.date}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Column 2 — Info, benefits, CTA */}
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Box sx={{ p: { xs: 2, md: 2.5 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
                      {/* Badge */}
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 2,
                          py: 0.5,
                          borderRadius: 1.5,
                          mb: 2,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          backgroundColor: event.disabled ? '#0f172a' : '#2e7d32',
                          color: '#fff',
                          alignSelf: 'flex-start',
                        }}
                      >
                        {event.type === 'seminar' ? 'Seminar' : 'Competition'}
                      </Box>

                      <Typography
                        variant='h4'
                        sx={{
                          fontWeight: 800,
                          mb: 0.75,
                          fontSize: { xs: '1.2rem', md: '1.35rem' },
                        }}
                      >
                        {event.title}
                      </Typography>

                      <Typography
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.85rem',
                          lineHeight: 1.6,
                          mb: 1.5,
                        }}
                      >
                        {event.description}
                      </Typography>

                      {/* Benefits */}
                      <Box sx={{ mb: 1.5, flex: 1 }}>
                        {event.benefits.map((benefit, i) => (
                          <Box
                            key={i}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: event.disabled ? 'secondary.main' : 'primary.main',
                                flexShrink: 0,
                              }}
                            />
                            <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
                              {benefit}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      {/* Competition System Info */}
                      {event.type === 'competition' && (
                        <Box
                          sx={{
                            mb: 1,
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: isDark
                              ? 'rgba(255,255,255,0.05)'
                              : 'rgba(0,0,0,0.03)',
                            border: '1px dashed',
                            borderColor: 'divider',
                          }}
                        >
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'secondary.main', mb: 0.5 }}>
                            Sistem Lomba
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.5 }}>
                            Peserta akan bersaing melalui sistem <b>leaderboard</b> untuk menentukan 16 besar terbaik.
                            Selanjutnya, 16 besar akan bertanding menggunakan sistem <b>bracket (bagan)</b> hingga menentukan pemenang.
                          </Typography>
                        </Box>
                      )}

                      {/* Price + CTA */}
                      <Box
                        sx={{
                          pt: 2,
                          borderTop: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 2,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            color: event.disabled ? 'text.secondary' : 'primary.main',
                          }}
                        >
                          {event.priceLabel}
                        </Typography>

                        <Box
                          component={event.disabled ? 'div' : 'a'}
                          href={event.disabled ? undefined : event.ctaHref}
                          sx={{
                            display: 'inline-block',
                            textAlign: 'center',
                            py: 1.5,
                            px: 4,
                            borderRadius: 2,
                            fontWeight: 700,
                            fontSize: '1rem',
                            textDecoration: 'none',
                            backgroundColor: event.disabled
                              ? (isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0')
                              : 'primary.main',
                            color: event.disabled
                              ? (isDark ? 'rgba(255,255,255,0.3)' : '#9e9e9e')
                              : '#ffffff',
                            cursor: event.disabled ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s',
                            pointerEvents: event.disabled ? 'none' : 'auto',
                            '&:hover': {
                              backgroundColor: event.disabled
                                ? undefined
                                : 'primary.dark',
                              transform: event.disabled ? 'none' : 'translateY(-2px)',
                              boxShadow: event.disabled ? 'none' : 3,
                            },
                          }}
                        >
                          {event.ctaText}
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </motion.div>
          ))}
        </Box>

        {/* Payment Info & Instagram Follow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Box
            sx={{
              mt: 6,
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: isDark
                ? 'rgba(15, 23, 42, 0.8)'
                : 'rgba(240, 253, 244, 0.8)',
            }}
          >
            <Typography variant='h6' sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
              Syarat & Info Pembayaran
            </Typography>

            <Grid container spacing={3}>
              {/* Instagram Follow */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                  <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                    Wajib Follow Instagram
                  </Typography>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 700 }}>
                    @dverse.id
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Follow akun Instagram kami & upload screenshot sebagai bukti
                  </Typography>
                </Box>
              </Grid>

              {/* BCA */}
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

              {/* DANA */}
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
            </Grid>
          </Box>
        </motion.div>
      </Container>
    </Box>
  )
}

export default HomeRegistration
