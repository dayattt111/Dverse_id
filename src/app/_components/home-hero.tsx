'use client'

import React from 'react'

// hooks
import { useTheme } from '@mui/material'

// components
import Box from '@mui/material/Box'
import HomeHeroContent from './home-hero/home-hero-content'
import HomeHeroDecoration from './home-hero/home-hero-decoration'

const HomeHero = () => {
  const { palette } = useTheme()

  return (
    <Box
      id='home-hero'
      sx={{
        width: '100%',
        position: 'relative',
        background: palette.mode === 'dark' 
          ? 'radial-gradient(ellipse at top, #0f172a 0%, #064e3b 50%, #020617 100%)'
          : 'radial-gradient(ellipse at top right, #f0fdf4 0%, #bbf7d0 35%, #86efac 70%, #4ade80 100%)',
        minHeight: { xs: '100vh', md: '100vh' },
        pt: { xs: '64px', md: '80px' },
        pb: { xs: 2, md: 4 },
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, transparent 50%, rgba(15, 23, 42, 0.3) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%, rgba(46, 125, 50, 0.05) 100%)',
          pointerEvents: 'none',
        },
      }}
    >
      <HomeHeroDecoration />
      <HomeHeroContent />
    </Box>
  )
}

export default HomeHero
