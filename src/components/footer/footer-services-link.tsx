'use client'

import React, { useCallback } from 'react'
import Box from '@mui/material/Box'
import MuiLink from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { Theme } from '@mui/material/styles'
import { FooterSectionTitle } from '@/components/footer'

// icons
import ArrowIcon from '@/assets/icons/material-symbols--call-made.svg'

const eventLinks = [
  { label: 'Seminar GreenTech', href: '#home-registration' },
  { label: 'Hackathon', href: '#home-registration' },
  { label: 'Timeline', href: '#home-timeline' },
  { label: 'Benefits', href: '#home-benefits' },
]

const FooterServicesLink = () => {
  const handleClick = useCallback((e: React.MouseEvent, href: string) => {
    e.preventDefault()
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <Box sx={{ textAlign: 'left' }}>
      <FooterSectionTitle title='Event' />
      {eventLinks.map((item, index) => (
        <MuiLink
          key={String(index)}
          href={item.href}
          onClick={(e) => handleClick(e, item.href)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            textDecoration: 'none',
            color: 'text.primary',
            marginLeft: '-8px',
            height: 32,
            '& svg': {
              transform: 'translateX(-16px)',
              transition: (theme: Theme) =>
                theme.transitions.create(['transform'], { duration: 250 }),
            },
            '& p': {
              ml: 0,
              transform: 'translateX(-8px)',
              transition: (theme: Theme) =>
                theme.transitions.create(['transform'], { duration: 250 }),
            },
            overflow: 'hidden',
            '&:hover': {
              color: 'primary.main',
              textDecorationColor: 'underline',
              textDecoration: 'underline',
              '& svg': {
                transform: 'translateX(0)',
              },
              '& p': {
                transform: 'translateX(0)',
                ml: 0.75,
              },
            },
          }}
        >
          <Box component={ArrowIcon} sx={{ width: 18, height: 18 }} />
          <Typography sx={{ fontWeight: '500' }}>{item.label}</Typography>
        </MuiLink>
      ))}
    </Box>
  )
}

export default FooterServicesLink
