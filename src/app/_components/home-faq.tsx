'use client'

import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { motion, AnimatePresence } from 'framer-motion'

const faqItems = [
  {
    id: 1,
    question: 'Apa itu Dverse?',
    answer:
      'Dverse (Developer Universe) adalah event teknologi bertema GreenTech yang menggabungkan Seminar dan Hackathon. Event ini diselenggarakan oleh Dipanegara Computer Club dan Himpunan Mahasiswa Teknik Informatika dan Komputer Politeknik Negeri Ujung Pandang.',
  },
  {
    id: 2,
    question: 'Siapa saja yang bisa ikut?',
    answer:
      'Event ini terbuka untuk semua mahasiswa, developer, dan profesional yang tertarik dengan teknologi dan keberlanjutan lingkungan. Tidak ada batasan universitas atau institusi.',
  },
  {
    id: 3,
    question: 'Apakah event ini gratis?',
    answer:
      'Event ini bersifat berbayar. Untuk mengikuti lomba (hackathon), peserta dikenakan biaya pendaftaran sebesar Rp300.000 per tim. Sedangkan untuk seminar, biaya pendaftaran sebesar Rp25.000 per peserta. Peserta dapat mendaftar melalui form pendaftaran yang telah disediakan.',
  },
  {
    id: 4,
    question: 'Berapa jumlah anggota tim untuk Hackathon?',
    answer:
      'Setiap tim Hackathon terdiri dari 4-5 orang. Kamu bisa mendaftar bersama timmu atau mendaftar individu dan kami akan bantu carikan tim.',
  },
  {
    id: 5,
    question: 'Apa saja yang perlu disiapkan untuk Hackathon?',
    answer:
      'Peserta perlu membawa laptop, charger, dan semangat! Kami akan menyediakan koneksi internet, makanan, dan minuman selama event berlangsung.',
  },
  {
    id: 6,
    question: 'Apakah ada hadiah untuk pemenang?',
    answer:
      'Ya! Pemenang Hackathon akan mendapatkan hadiah uang tunai, sertifikat, dan kesempatan inkubasi untuk mengembangkan solusi mereka lebih lanjut.',
  },
]

const HomeFAQ = () => {
  const { palette } = useTheme()
  const [openId, setOpenId] = useState<number | null>(1)

  return (
    <Box
      id='home-faq'
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
              FAQ
            </Typography>
            <Typography
              variant='h3'
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                mb: 2,
              }}
            >
              Pertanyaan yang Sering Ditanyakan
            </Typography>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{ maxWidth: 600, mx: 'auto', fontSize: { xs: '1rem', md: '1.1rem' } }}
            >
              Temukan jawaban untuk pertanyaan umum seputar event Dverse
            </Typography>
          </Box>
        </motion.div>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {faqItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Box
                sx={{
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: openId === item.id ? 'primary.main' : 'divider',
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  background: palette.mode === 'dark'
                    ? 'rgba(15, 23, 42, 0.6)'
                    : 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    borderColor: 'primary.light',
                  },
                }}
              >
                <Box
                  onClick={() => setOpenId(openId === item.id ? null : item.id)}
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    '&:hover': {
                      backgroundColor: palette.mode === 'dark'
                        ? 'rgba(46, 125, 50, 0.05)'
                        : 'rgba(46, 125, 50, 0.03)',
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '0.95rem', md: '1.05rem' },
                      pr: 2,
                      color: openId === item.id ? 'primary.main' : 'text.primary',
                    }}
                  >
                    {item.question}
                  </Typography>
                  <Box
                    sx={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: 'primary.main',
                      flexShrink: 0,
                      transform: openId === item.id ? 'rotate(45deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s',
                    }}
                  >
                    +
                  </Box>
                </Box>
                <AnimatePresence>
                  {openId === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box
                        sx={{
                          px: { xs: 2.5, md: 3 },
                          pb: { xs: 2.5, md: 3 },
                        }}
                      >
                        <Typography
                          sx={{
                            color: 'text.secondary',
                            fontSize: { xs: '0.9rem', md: '0.95rem' },
                            lineHeight: 1.8,
                          }}
                        >
                          {item.answer}
                        </Typography>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  )
}

export default HomeFAQ
