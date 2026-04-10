'use client'

import React from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'

const events = [
  {
    id: 1,
    title: 'Seminar GreenTech',
    date: '5 Mei 2026',
    description:
      'Seminar sehari penuh dengan keynote speakers dari industri teknologi, membahas inovasi Green Technology dan peran developer dalam keberlanjutan lingkungan.',
    highlights: [
      'Keynote dari praktisi industri',
      'Panel diskusi interaktif',
      'Sertifikat peserta',
      'Networking session',
    ],
    type: 'seminar',
    price: 'Rp 25.000',
    disabled: false,
  },
  {
    id: 2,
    title: 'Lomba / Hackathon',
    date: '11 April 2026',
    description:
      'Kompetisi tim untuk membangun solusi inovatif berbasis teknologi.',
    highlights: [
      'Kompetisi berbasis tim',
      'Mentoring dari expert',
      'Sertifikat & portfolio',
      'Hadiah menarik untuk juara',
    ],
    type: 'hackathon',
    capacity: 'Terbatas',
    price: 'TBA',
    disabled: true, // set false untuk mengaktifkan pendaftaran hackathon
  },
]

const HomeRegistration = () => {
  const { palette } = useTheme()

  return (
    <Box
      id='home-registration'
      component='section'
      sx={{
        width: '100%',
        py: { xs: 8, md: 14 },
        position: 'relative',
        background:
          palette.mode === 'dark'
            ? 'linear-gradient(180deg, #0f172a 0%, #020617 100%)'
            : 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
      }}
    >
      <Container maxWidth='lg'>
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

        <Grid container spacing={4}>
          {events.map((event, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={event.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <Box
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 3,
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '2px solid',
                    borderColor: event.type === 'seminar' ? 'primary.main' : 'secondary.main',
                    background: palette.mode === 'dark'
                      ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(6, 78, 59, 0.2) 100%)'
                      : 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: palette.mode === 'dark'
                        ? '0 16px 48px rgba(46, 125, 50, 0.3)'
                        : '0 16px 48px rgba(46, 125, 50, 0.15)',
                    },
                  }}
                >
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
                      backgroundColor: event.type === 'seminar' ? '#2e7d32' : '#0f172a',
                      color: '#fff',
                    }}
                  >
                    {event.type === 'seminar' ? 'Seminar' : 'Hackathon'}
                  </Box>

                  <Typography
                    variant='h4'
                    sx={{
                      fontWeight: 800,
                      mb: 1,
                      fontSize: { xs: '1.5rem', md: '1.75rem' },
                    }}
                  >
                    {event.title}
                  </Typography>

                  <Typography
                    sx={{
                      color: 'primary.main',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      mb: 2,
                    }}
                  >
                    {event.date}
                  </Typography>

                  <Typography
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                      mb: 3,
                    }}
                  >
                    {event.description}
                  </Typography>

                  {/* Highlights */}
                  <Box sx={{ mb: 3 }}>
                    {event.highlights.map((highlight, i) => (
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
                            backgroundColor: 'primary.main',
                            flexShrink: 0,
                          }}
                        />
                        <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
                          {highlight}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Info Row */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      pt: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      mb: 3,
                    }}
                  >
                    <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                      {event.capacity}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: 'primary.main',
                      }}
                    >
                      {event.price}
                    </Typography>
                  </Box>

{/* CTA Button */}
<Box
  component={event.disabled ? 'div' : 'a'}
  href={event.disabled ? undefined : `/registration?event=${event.id}`}
  sx={{
    display: 'block',
    textAlign: 'center',
    py: 1.5,
    borderRadius: 2,
    fontWeight: 700,
    fontSize: '1rem',
    textDecoration: 'none',
    backgroundColor: event.disabled
      ? (palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e0e0e0')
      : (event.type === 'seminar' ? 'primary.main' : 'secondary.main'),
    color: event.disabled
      ? (palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : '#9e9e9e')
      : '#ffffff',
    cursor: event.disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s',
    pointerEvents: event.disabled ? 'none' : 'auto',
    '&:hover': {
      backgroundColor: event.disabled
        ? undefined
        : (event.type === 'seminar' ? 'primary.dark' : 'secondary.dark'),
      transform: event.disabled ? 'none' : 'translateY(-2px)',
      boxShadow: event.disabled ? 'none' : 3,
    },
  }}
>
  {event.disabled ? 'Segera Hadir' : `Daftar ${event.type === 'seminar' ? 'Seminar' : 'Hackathon'}`}
</Box>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>

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
              background: palette.mode === 'dark'
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
