'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import AutoScroll from 'embla-carousel-auto-scroll'
import { SectionTitle } from '@/components/core'
import { supabase } from '@/lib/supabase'

type Event = {
  id: string
  name: string
  description: string | null
  pic_event: string | null
  time_start: string | null
  time_end: string | null
}

const FALLBACK_IMAGE = '/images/about-1.jpg'

const HomePastEvents = () => {
  const { palette } = useTheme()
  const isDark = palette.mode === 'dark'

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('events')
      .select('id, name, description, pic_event, time_start, time_end')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setEvents(data as Event[])
        setLoading(false)
      })
  }, [])

  const autoScrollPlugin = React.useRef(
    AutoScroll({ speed: 1.5, stopOnInteraction: false, stopOnMouseEnter: false, direction: 'forward' })
  )

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      dragFree: true,
    },
    [autoScrollPlugin.current]
  )

  // Reinit embla and restart auto-scroll after events load
  useEffect(() => {
    if (!emblaApi || loading) return
    emblaApi.reInit()
    autoScrollPlugin.current.play()
  }, [emblaApi, loading])

  // Start playing as soon as embla is ready (before data loads)
  useEffect(() => {
    if (!emblaApi) return
    autoScrollPlugin.current.play()
  }, [emblaApi])

  const onMouseEnter = useCallback(() => {
    autoScrollPlugin.current.stop()
  }, [])

  const onMouseLeave = useCallback(() => {
    autoScrollPlugin.current.play()
  }, [])

  // resume after drag
  const onPointerUp = useCallback(() => {
    autoScrollPlugin.current.play()
  }, [])

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
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
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
          {loading
            ? [1, 2, 3].map((i) => (
                <Box
                  key={i}
                  sx={{ flex: '0 0 auto', width: { xs: 280, sm: 340, md: 400 }, borderRadius: 4, overflow: 'hidden' }}
                >
                  <Skeleton variant='rectangular' sx={{ width: '100%', aspectRatio: '16/10' }} />
                  <Box sx={{ p: 2 }}>
                    <Skeleton width='70%' height={24} />
                    <Skeleton width='90%' height={18} sx={{ mt: 0.5 }} />
                  </Box>
                </Box>
              ))
            : events.map((event) => (
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
                      src={event.pic_event || FALLBACK_IMAGE}
                      alt={event.name}
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
                      {event.name}
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
