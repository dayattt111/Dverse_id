'use client'

import React from 'react'

// components
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import { SectionTitle } from '@/components/core'
import Image from 'next/image'

// hooks
import { useTheme } from '@mui/material/styles'

// motion
import { motion } from 'framer-motion'

interface FeatureData {
  id: number
  title: string
  description: string
  icon: string
  color: string
}

const features: FeatureData[] = [
  {
    id: 1,
    title: 'Seminar',
    description: 'Tech talk dari para expert tentang Green Technology & inovasi berkelanjutan.',
    icon: '/images/Assets/Group.png',
    color: '#2e7d32',
  },
  {
    id: 2,
    title: 'Hackathon',
    description: 'Kompetisi membangun solusi teknologi untuk masalah lingkungan & keberlanjutan.',
    icon: '/images/Assets/Group1.png',
    color: '#0f172a',
  },
  {
    id: 3,
    title: 'Networking',
    description: 'Bertemu dan berjejaring dengan developer, mentor, dan profesional industri.',
    icon: '/images/Assets/Group4.png',
    color: '#16a34a',
  },
  {
    id: 4,
    title: 'Workshop',
    description: 'Hands-on session untuk mempelajari tools dan framework terkini.',
    icon: '/images/Assets/Group3.png',
    color: '#334155',
  },
]

interface ItemProps {
  item: FeatureData
  index: number
}

const FeatureItem = ({ item, index }: ItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Box
        sx={{
          mb: { xs: 3, md: 0 },
          p: 2.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 24px ${item.color}20`,
            borderColor: item.color,
          },
        }}
      >
        <Box sx={{ mb: 1.5, width: 40, height: 40, position: 'relative' }}>
          <Image src={item.icon} alt={item.title} width={40} height={40} style={{ objectFit: 'contain' }} />
        </Box>
        <Typography component='h6' variant='h6' sx={{ fontSize: 15, fontWeight: 700, mb: 0.5 }}>
          {item.title}
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          {item.description}
        </Typography>
      </Box>
    </motion.div>
  )
}

const HomeAbout = () => {
  const { palette } = useTheme()
  return (
    <Box
      id='home-about'
      sx={{
        width: '100%',
        py: { xs: 10, md: 14, lg: 18 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: palette.mode === 'dark'
          ? 'linear-gradient(to bottom, #020617 0%, #0f172a 50%, #020617 100%)'
          : 'linear-gradient(to bottom, #ffffff 0%, #f0fdf4 50%, #ffffff 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '20%',
          left: 0,
          width: '100%',
          height: '60%',
          background: palette.mode === 'dark'
            ? 'radial-gradient(ellipse at left, rgba(46, 125, 50, 0.08) 0%, transparent 60%)'
            : 'radial-gradient(ellipse at left, rgba(187, 247, 208, 0.3) 0%, transparent 60%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container>
        <Grid container spacing={{ xs: 4, md: 8 }}>
          <Grid size={{ xs: 12, md: 7 }} sx={{ pr: { xs: 0, md: 6 } }}>
            <Box sx={{ position: 'relative', width: '100%', maxWidth: { md: 500 } }}>
              <SectionTitle>TENTANG EVENT</SectionTitle>
              <Typography
                variant='h2'
                component='h2'
                sx={{ mb: { xs: 2, md: 3 }, fontWeight: '800', fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}
              >
                Dverse — Developer Universe
              </Typography>
            </Box>
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Typography
                sx={{
                  color: 'text.primary',
                  fontWeight: '600',
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.35rem' },
                  mb: 2,
                  lineHeight: 1.6,
                }}
              >
                Event teknologi bertema GreenTech untuk masa depan berkelanjutan
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
                  mb: 2,
                  lineHeight: 1.8,
                }}
              >
                <strong>Dverse (Developer Universe)</strong> adalah event yang menggabungkan
                Seminar dan Hackathon bertema <strong>Green Technology</strong>. Diselenggarakan
                oleh kolaborasi antara <strong>Dipanegara Computer Club</strong> dan{' '}
                <strong>Himpunan Mahasiswa Informatika PNUP</strong>.
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
                  mb: { xs: 3, md: 4 },
                  lineHeight: 1.8,
                }}
              >
                Melalui event ini, kami mengajak para developer, mahasiswa, dan profesional
                untuk berinovasi menciptakan solusi teknologi yang ramah lingkungan dan
                berkelanjutan demi masa depan yang lebih hijau.
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  mb: 2,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  color: 'primary.main',
                }}
              >
                Apa yang Kami Tawarkan
              </Typography>
              <Grid
                container
                spacing={2}
                sx={{ position: 'relative', zIndex: 2 }}
              >
                {features.map((item, index) => (
                  <Grid key={String(item.id)} size={{ xs: 6, sm: 6, md: 6 }}>
                    <FeatureItem item={item} index={index} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: { md: 400 },
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Box
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 3,
                    background: palette.mode === 'dark'
                      ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(6, 78, 59, 0.4) 100%)'
                      : 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                    border: '1px solid',
                    borderColor: palette.mode === 'dark' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(46, 125, 50, 0.15)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: palette.mode === 'dark'
                      ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                      : '0 8px 32px rgba(46, 125, 50, 0.1)',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 2,
                      color: 'primary.main',
                      mb: 2,
                    }}
                  >
                    Diselenggarakan oleh
                  </Typography>

                  <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Image src='/images/Logo/Organisasi/DccLogo.png' alt='DCC Logo' width={60} height={60} style={{ objectFit: 'contain' }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 0.5 }}>
                        Dipanegara Computer Club
                      </Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                        Organisasi mahasiswa di bidang teknologi informasi
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Image src='/images/Logo/Organisasi/himatik cuy.png' alt='HIMATIK PNUP Logo' width={60} height={60} style={{ objectFit: 'contain' }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 0.5 }}>
                        HIMATIK PNUP
                      </Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                        Himpunan Mahasiswa Teknik Informatika dan Komputer Politeknik Negeri Ujung Pandang
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      pt: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Image src='/images/Assets/Group5.png' alt='GreenTech' width={20} height={20} style={{ objectFit: 'contain' }} />
                    <Typography sx={{ fontWeight: 600, color: 'primary.main', fontSize: '0.95rem' }}>
                      Tema: GreenTech — Teknologi untuk Masa Depan Hijau
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default HomeAbout
