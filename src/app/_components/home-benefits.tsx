'use client'

import React from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import Image from 'next/image'

const benefits = [
  {
    id: 1,
    icon: '/images/Assets/Group.png',
    title: 'Hadiah Menarik',
    description: 'Hadiah jutaan rupiah untuk pemenang Hackathon dan doorprize untuk peserta Seminar.',
  },
  {
    id: 2,
    icon: '/images/Assets/Group7.png',
    title: 'Sertifikat Resmi',
    description: 'Dapatkan sertifikat partisipasi yang bisa menambah nilai portfolio kamu.',
  },
  {
    id: 3,
    icon: '/images/Assets/Group4.png',
    title: 'Networking',
    description: 'Bertemu dengan developer, mentor, dan profesional industri dari berbagai perusahaan.',
  },
  {
    id: 4,
    icon: '/images/Assets/Group6.png',
    title: 'Ilmu & Insight',
    description: 'Pelajari tren terbaru GreenTech langsung dari praktisi dan pakar industri.',
  },
  {
    id: 5,
    icon: '/images/Assets/Group3.png',
    title: 'Portfolio Project',
    description: 'Bangun project nyata selama Hackathon yang bisa ditambahkan ke portfolio profesionalmu.',
  },
  {
    id: 6,
    icon: '/images/Assets/Group5.png',
    title: 'Kesempatan Inkubasi',
    description: 'Tim pemenang berkesempatan mendapatkan program inkubasi untuk mengembangkan solusinya.',
  },
]

const HomeBenefits = () => {
  const { palette } = useTheme()

  return (
    <Box
      id='home-benefits'
      component='section'
      sx={{
        width: '100%',
        py: { xs: 8, md: 14 },
        position: 'relative',
        background:
          palette.mode === 'dark'
            ? 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #020617 100%)'
            : 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 50%, #f0fdf4 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '10%',
          width: '80%',
          height: '100%',
          background: palette.mode === 'dark'
            ? 'radial-gradient(ellipse at center, rgba(46, 125, 50, 0.1) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at center, rgba(187, 247, 208, 0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
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
              Benefits
            </Typography>
            <Typography
              variant='h3'
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                mb: 2,
              }}
            >
              Kenapa Harus Ikut?
            </Typography>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{ maxWidth: 600, mx: 'auto', fontSize: { xs: '1rem', md: '1.1rem' } }}
            >
              Banyak manfaat yang bisa kamu dapatkan dengan mengikuti event Dverse
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={3}>
          {benefits.map((benefit, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={benefit.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Box
                  sx={{
                    textAlign: 'center',
                    p: { xs: 3, md: 4 },
                    borderRadius: 3,
                    height: '100%',
                    background: palette.mode === 'dark'
                      ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(6, 78, 59, 0.3) 100%)'
                      : 'linear-gradient(135deg, #ffffff 0%, rgba(240, 253, 244, 0.5) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.15)' : 'rgba(46, 125, 50, 0.08)'}`,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: palette.mode === 'dark'
                        ? '0 12px 40px rgba(46, 125, 50, 0.3)'
                        : '0 12px 40px rgba(46, 125, 50, 0.12)',
                      borderColor: palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.4)' : 'rgba(46, 125, 50, 0.2)',
                    },
                  }}
                >
                  <Box sx={{ mb: 2, width: 52, height: 52, mx: 'auto', position: 'relative' }}>
                    <Image src={benefit.icon} alt={benefit.title} width={52} height={52} style={{ objectFit: 'contain' }} />
                  </Box>
                  <Typography
                    variant='h6'
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      fontSize: { xs: '1.1rem', md: '1.2rem' },
                    }}
                  >
                    {benefit.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: '0.9rem', md: '0.95rem' },
                      lineHeight: 1.7,
                    }}
                  >
                    {benefit.description}
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

export default HomeBenefits
