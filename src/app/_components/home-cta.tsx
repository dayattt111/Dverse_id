'use client'

import React, { useCallback } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { motion } from 'framer-motion'
import { useTheme } from '@mui/material/styles'

const HomeCTA = () => {
  const { palette } = useTheme()

  const handleScroll = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <Box
      id="home-cta"
      component="section"
      sx={{
        width: '100%',
        py: { xs: 8, md: 14 },
        position: 'relative',
        background:
          palette.mode === 'dark'
            ? 'linear-gradient(180deg, #020617 0%, #0f172a 100%)'
            : 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
              background:
                'linear-gradient(135deg, #2e7d32 0%, #0f172a 100%)',
              p: { xs: 4, md: 8 },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  palette.mode === 'dark'
                    ? 'rgba(0, 0, 0, 0.3)'
                    : 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
              },
            }}
          >
            <Grid container spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '1.75rem', md: '2.5rem' },
                    color: 'white',
                    mb: 2,
                  }}
                >
                  Siap Jadi Bagian dari Dverse?
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: 1.8,
                    fontSize: { xs: '1rem', md: '1.25rem' },
                    fontWeight: 400,
                  }}
                >
                  Daftarkan dirimu sekarang di Dverse — Developer Universe. Ikuti seminar GreenTech,
                  tantang dirimu di Hackathon 48 Jam, dan bangun solusi teknologi hijau bersama developer lainnya.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    onClick={() => handleScroll('home-registration')}
                    variant="contained"
                    size="large"
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: 2,
                      bgcolor: 'white',
                      color: '#2e7d32',
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Daftar Sekarang
                  </Button>
                  <Button
                    onClick={() => handleScroll('home-about')}
                    variant="outlined"
                    size="large"
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: 2,
                      borderColor: 'white',
                      color: 'white',
                      textTransform: 'none',
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        borderColor: 'white',
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Tentang Dverse
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Grid container spacing={3} sx={{ mt: 6 }}>
            {[
              { number: '48 Jam', label: 'Hackathon Marathon' },
            ].map((stat, index) => (
              <Grid size={{ xs: 6, sm: 3 }} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      color: 'primary.main',
                      mb: 0.5,
                      fontSize: { xs: '2rem', md: '2.5rem' },
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      fontSize: { xs: '0.75rem', md: '0.875rem' },
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  )
}

export default HomeCTA
