'use client'

import React, { useCallback, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { useTheme } from '@mui/material/styles'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { SectionTitle } from '@/components/core'

const PAST_EVENTS = [
  {
    id: 1,
    title: 'DCC Seminar Nasional 2024',
    description: 'Seminar teknologi dengan 500+ peserta dari seluruh Indonesia',
    image: '/images/about-1.jpg',
  },
  {
    id: 2,
    title: 'Hackathon GreenTech 2024',
    description: 'Kompetisi inovasi teknologi hijau tingkat nasional',
    image: '/images/about-2.jpg',
  },
  {
    id: 3,
    title: 'Workshop IoT & Smart Agriculture',
    description: 'Pelatihan hands-on Internet of Things untuk pertanian cerdas',
    image: '/images/bg3.jpg',
  },
  {
    id: 4,
    title: 'Tech Talk: AI for Sustainability',
    description: 'Diskusi panel tentang pemanfaatan AI untuk keberlanjutan',
    image: '/images/about-1.jpg',
  },
  {
    id: 5,
    title: 'DCC Community Meetup 2024',
    description: 'Pertemuan komunitas developer se-Sulawesi Selatan',
    image: '/images/about-2.jpg',
  },
]

const HomePastEvents = () => {
  const { palette } = useTheme()
  const isDark = palette.mode === 'dark'

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      slidesToScroll: 1,
      dragFree: true,
    },
    [Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })]
  )

  const onPointerUp = useCallback(() => {
    if (!emblaApi) return
    const autoplay = emblaApi.plugins().autoplay
    if (autoplay) (autoplay as ReturnType<typeof Autoplay>).play()
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('pointerUp', onPointerUp)
    return () => {
      emblaApi.off('pointerUp', onPointerUp)
    }
  }, [emblaApi, onPointerUp])

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: isDark
          ? 'linear-gradient(180deg, #020617 0%, #0a1628 50%, #020617 100%)'
          : 'linear-gradient(180deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth='lg'>
        <Box sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center' }}>
          <SectionTitle>EVENT SEBELUMNYA</SectionTitle>
          <Typography
            variant='h3'
            sx={{
              mt: 2,
              fontWeight: 700,
              color: 'text.primary',
              fontSize: { xs: 24, md: 32 },
            }}
          >
            Kilas Balik Event Kami
          </Typography>
          <Typography
            variant='body1'
            sx={{
              mt: 1.5,
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Berbagai kegiatan yang telah kami selenggarakan sebelumnya
          </Typography>
        </Box>
      </Container>

      <Box
        ref={emblaRef}
        sx={{
          overflow: 'hidden',
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 2, md: 3 },
            pl: { xs: 2, md: 4 },
            pr: { xs: 2, md: 4 },
          }}
        >
          {PAST_EVENTS.map((event) => (
            <Box
              key={event.id}
              sx={{
                flex: '0 0 auto',
                width: { xs: 280, sm: 340, md: 400 },
                borderRadius: 4,
                overflow: 'hidden',
                background: isDark ? '#0f172a' : '#fff',
                border: '1px solid',
                borderColor: isDark
                  ? 'rgba(74, 222, 128, 0.1)'
                  : 'rgba(46, 125, 50, 0.08)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: isDark
                    ? '0 8px 32px rgba(74, 222, 128, 0.12)'
                    : '0 8px 32px rgba(46, 125, 50, 0.12)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16/10',
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  sizes='(max-width: 600px) 280px, (max-width: 900px) 340px, 400px'
                  style={{ objectFit: 'cover' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)',
                  }}
                />
              </Box>
              <Box sx={{ p: { xs: 2, md: 2.5 } }}>
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: 0.5,
                    fontSize: { xs: 15, md: 17 },
                  }}
                >
                  {event.title}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                    fontSize: { xs: 13, md: 14 },
                  }}
                >
                  {event.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default HomePastEvents
