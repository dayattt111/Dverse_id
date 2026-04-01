'use client'

import React from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import EmailIcon from '@/assets/icons/eva--email-outline.svg'
import LocationIcon from '@/assets/icons/tdesign--location.svg'

const HomeContactSection = () => {
  const { palette } = useTheme()

  return (
    <Box
      id='home-contact'
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
              Contact
            </Typography>
            <Typography
              variant='h3'
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                mb: 2,
              }}
            >
              Hubungi Panitia
            </Typography>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{ maxWidth: 600, mx: 'auto', fontSize: { xs: '1rem', md: '1.1rem' } }}
            >
              Punya pertanyaan? Jangan ragu untuk menghubungi tim panitia Dverse
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={4} justifyContent='center'>
          {/* Email */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Box
                component='a'
                href='mailto:dverse@pnup.ac.id'
                sx={{
                  display: 'block',
                  textDecoration: 'none',
                  color: 'inherit',
                  textAlign: 'center',
                  p: 4,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: palette.mode === 'dark'
                    ? 'rgba(15, 23, 42, 0.6)'
                    : 'rgba(255, 255, 255, 0.9)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-4px)',
                    boxShadow: palette.mode === 'dark'
                      ? '0 8px 24px rgba(46, 125, 50, 0.15)'
                      : '0 8px 24px rgba(46, 125, 50, 0.1)',
                  },
                }}
              >
                <Box
                  component={EmailIcon}
                  sx={{
                    width: 40,
                    height: 40,
                    color: 'primary.main',
                    mb: 2,
                  }}
                />
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Email</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                  dverse@pnup.ac.id
                </Typography>
              </Box>
            </motion.div>
          </Grid>

          {/* WhatsApp */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Box
                component='a'
                href='https://wa.me/62812000xxxx'
                target='_blank'
                rel='noopener noreferrer'
                sx={{
                  display: 'block',
                  textDecoration: 'none',
                  color: 'inherit',
                  textAlign: 'center',
                  p: 4,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: palette.mode === 'dark'
                    ? 'rgba(15, 23, 42, 0.6)'
                    : 'rgba(255, 255, 255, 0.9)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-4px)',
                    boxShadow: palette.mode === 'dark'
                      ? '0 8px 24px rgba(46, 125, 50, 0.15)'
                      : '0 8px 24px rgba(46, 125, 50, 0.1)',
                  },
                }}
              >
                <Typography sx={{ fontSize: 40, mb: 1 }}>💬</Typography>
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>WhatsApp</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                  +62 812 000 xxxx
                </Typography>
              </Box>
            </motion.div>
          </Grid>

          {/* Lokasi */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Box
                sx={{
                  textAlign: 'center',
                  p: 4,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: palette.mode === 'dark'
                    ? 'rgba(15, 23, 42, 0.6)'
                    : 'rgba(255, 255, 255, 0.9)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-4px)',
                    boxShadow: palette.mode === 'dark'
                      ? '0 8px 24px rgba(46, 125, 50, 0.15)'
                      : '0 8px 24px rgba(46, 125, 50, 0.1)',
                  },
                }}
              >
                <Box
                  component={LocationIcon}
                  sx={{
                    width: 40,
                    height: 40,
                    color: 'primary.main',
                    mb: 2,
                  }}
                />
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Lokasi</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                  Politeknik Negeri Ujung Pandang, Makassar
                </Typography>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default HomeContactSection
