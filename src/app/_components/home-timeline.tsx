'use client'

import React from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'

const timelineEvents = [
  {
    id: 1,
    date: '9 April 2026',
    title: 'Pendaftaran Seminar',
    description: 'Pendaftaran peserta Seminar resmi dibuka.',
    status: 'upcoming' as const,
  },
  {
    id: 2,
    date: '11 April 2026',
    title: 'Pendaftaran Lomba',
    description: 'Pendaftaran tim lomba resmi dibuka. Segera daftarkan tim kamu!',
    status: 'upcoming' as const,
  },
  {
    id: 3,
    date: '21 April 2026',
    title: 'Penutupan Pendaftaran Lomba',
    description: 'Batas akhir pendaftaran tim lomba. Pastikan tim kamu sudah terdaftar sebelum tanggal ini.',
    status: 'upcoming' as const,
  },
  {
    id: 4,
    date: '27 April 2026',
    title: 'Pengumuman Peserta Lolos',
    description: 'Pengumuman peserta yang lolos ke tahap selanjutnya.',
    status: 'upcoming' as const,
  },
  {
    id: 5,
    date: '27–29 April 2026',
    title: 'Konfirmasi & Pembayaran Biaya Komitmen',
    description: 'Peserta yang lolos melakukan konfirmasi ke panitia dan pembayaran biaya komitmen sebesar (Rp300.000 per tim).',
    status: 'upcoming' as const,
  },
  {
    id: 6,
    date: '5 Mei 2026',
    title: 'Technical Meeting',
    description: 'Technical meeting untuk peserta yang lolos ke tahap selanjutnya.',
    status: 'upcoming' as const,
  },
  {
    id: 7,
    date: '8 Mei 2026',
    title: 'Presentasi Akhir / Kompetisi Luring',
    description: 'Presentasi akhir dan kompetisi tatap muka di Kampus 2 Politeknik Negeri Ujung Pandang.',
    status: 'upcoming' as const,
  },
  {
    id: 8,
    date: '9 Mei 2026',
    title: 'Pengumuman Juara & Pemberian Hadiah',
    description: 'Pengumuman pemenang dan pemberian hadiah kepada juara.',
    status: 'upcoming' as const,
  },
]

const HomeTimeline = () => {
  const { palette } = useTheme()

  return (
    <Box
      id='home-timeline'
      component='section'
      sx={{
        width: '100%',
        py: { xs: 8, md: 14 },
        position: 'relative',
        background:
          palette.mode === 'dark'
            ? 'linear-gradient(180deg, #020617 0%, #0f172a 100%)'
            : 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
      }}
    >
      <Container maxWidth='md'>
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
              Timeline
            </Typography>
            <Typography
              variant='h3'
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                mb: 2,
              }}
            >
              Jadwal Kegiatan
            </Typography>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{ maxWidth: 600, mx: 'auto', fontSize: { xs: '1rem', md: '1.1rem' } }}
            >
              Rangkaian acara Dverse dari pendaftaran hingga pengumuman pemenang
            </Typography>
          </Box>
        </motion.div>

        {/* Vertical Timeline */}
        <Box sx={{ position: 'relative' }}>
          {/* Timeline Line */}
          <Box
            sx={{
              position: 'absolute',
              left: { xs: 20, md: '50%' },
              transform: { md: 'translateX(-50%)' },
              top: 0,
              bottom: 0,
              width: 3,
              background: `linear-gradient(to bottom, ${palette.mode === 'dark' ? '#2e7d32' : '#66bb6a'}, ${palette.mode === 'dark' ? '#0f172a' : '#f0fdf4'})`,
              borderRadius: 2,
            }}
          />

          {timelineEvents.map((event, index) => {
            const isLeft = index % 2 === 0

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'row', md: isLeft ? 'row' : 'row-reverse' },
                    alignItems: 'flex-start',
                    mb: 4,
                    position: 'relative',
                    pl: { xs: 6, md: 0 },
                  }}
                >
                  {/* Dot */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: { xs: 12, md: '50%' },
                      transform: { md: 'translateX(-50%)' },
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      border: '4px solid',
                      borderColor: palette.mode === 'dark' ? '#020617' : '#ffffff',
                      boxShadow: '0 0 0 4px rgba(46, 125, 50, 0.2)',
                      zIndex: 1,
                    }}
                  />

                  {/* Content */}
                  <Box
                    sx={{
                      width: { xs: '100%', md: '45%' },
                      ml: { xs: 0, md: isLeft ? 0 : 'auto' },
                      mr: { xs: 0, md: isLeft ? 'auto' : 0 },
                      textAlign: { xs: 'left', md: isLeft ? 'right' : 'left' },
                    }}
                  >
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        background: palette.mode === 'dark'
                          ? 'rgba(15, 23, 42, 0.8)'
                          : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: palette.mode === 'dark'
                            ? '0 8px 24px rgba(46, 125, 50, 0.15)'
                            : '0 8px 24px rgba(46, 125, 50, 0.1)',
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: 'primary.main',
                          mb: 0.5,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}
                      >
                        {event.date}
                      </Typography>
                      <Typography
                        variant='h6'
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                          fontSize: { xs: '1rem', md: '1.1rem' },
                        }}
                      >
                        {event.title}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.9rem',
                          lineHeight: 1.6,
                        }}
                      >
                        {event.description}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            )
          })}
        </Box>
      </Container>
    </Box>
  )
}

export default HomeTimeline
