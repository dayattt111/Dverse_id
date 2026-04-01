'use client'

import React from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'

const problems = [
  {
    id: 1,
    icon: '🌍',
    title: 'Perubahan Iklim',
    description:
      'Suhu global terus meningkat. Teknologi harus menjadi bagian dari solusi, bukan masalah.',
  },
  {
    id: 2,
    icon: '⚡',
    title: 'Konsumsi Energi Digital',
    description:
      'Industri teknologi menyumbang jejak karbon yang signifikan. Diperlukan inovasi efisiensi energi.',
  },
  {
    id: 3,
    icon: '🗑️',
    title: 'E-Waste & Polusi Digital',
    description:
      'Limbah elektronik terus bertambah. Solusi circular economy berbasis teknologi sangat dibutuhkan.',
  },
  {
    id: 4,
    icon: '🌱',
    title: 'Kurangnya Kesadaran GreenTech',
    description:
      'Banyak developer belum menyadari peran mereka dalam menciptakan teknologi ramah lingkungan.',
  },
]

const HomeProblemStatement = () => {
  const { palette } = useTheme()

  return (
    <Box
      id='home-problem'
      component='section'
      sx={{
        width: '100%',
        py: { xs: 8, md: 14 },
        position: 'relative',
        background:
          palette.mode === 'dark'
            ? 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #020617 100%)'
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
              Problem Statement
            </Typography>
            <Typography
              variant='h3'
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                mb: 2,
              }}
            >
              Mengapa GreenTech Penting?
            </Typography>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{ maxWidth: 700, mx: 'auto', fontSize: { xs: '1rem', md: '1.1rem' } }}
            >
              Teknologi memiliki peran besar dalam menentukan masa depan planet ini.
              Saatnya developer menjadi agen perubahan.
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={3}>
          {problems.map((problem, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={problem.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Box
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 3,
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    background: palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.02)'
                      : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: palette.mode === 'dark'
                        ? '0 12px 40px rgba(46, 125, 50, 0.2)'
                        : '0 12px 40px rgba(46, 125, 50, 0.1)',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <Box sx={{ fontSize: 36, mb: 2 }}>{problem.icon}</Box>
                  <Typography
                    variant='h6'
                    sx={{
                      fontWeight: 700,
                      mb: 1.5,
                      fontSize: { xs: '1.1rem', md: '1.2rem' },
                    }}
                  >
                    {problem.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: '0.9rem', md: '0.95rem' },
                      lineHeight: 1.7,
                    }}
                  >
                    {problem.description}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

export default HomeProblemStatement
