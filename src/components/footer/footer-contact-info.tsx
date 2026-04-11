'use client'

import React, { FC, ReactNode } from 'react'
import { Box, Typography } from '@mui/material'
import { FooterSectionTitle } from '@/components/footer'

// icons
import EmailIcon from '@/assets/icons/eva--email-outline.svg'
import PhoneIcon from '@/assets/icons/eva--phone-outline.svg'
import LocationIcon from '@/assets/icons/tdesign--location.svg'

interface ContactInfoItemProps {
  icon: ReactNode
  label: string
  value: string
  link: string
}

const ContactInfoItem: FC<ContactInfoItemProps> = ({
  icon,
  label,
  value,
  link,
}: ContactInfoItemProps) => {
  return (
    <Box
      sx={{
        mb: 2.2,
        display: 'block',
        width: {
          xs: '100%',
          md: 360,
        },
        color: 'text.primary',
        textDecoration: 'none',
        ':hover': {
          color: 'primary.main',
        },
      }}
      component='a'
      href={link}
    >
      <Box
        sx={{
          display: 'flex',
        }}
      >
        {icon}
        <Box>
          <Typography
            dangerouslySetInnerHTML={{ __html: value }}
            sx={{ mb: 0.6, fontSize: 15, lineHeight: 1.3 }}
            variant='h6'
          />
        </Box>
      </Box>
      <Typography
        variant='subtitle1'
        sx={{ color: 'text.secondary', ml: '32px' }}
      >
        {label}
      </Typography>
    </Box>
  )
}

const FooterContactInfo: FC = () => {
  return (
    <Box sx={{ mb: { xs: 4, md: 0 } }}>
      <FooterSectionTitle title='Contact Info' />
      <ContactInfoItem
        value='dverseofc26@gmail.com'
        label='Response within 24hrs'
        link='mailto:dverseofc26@gmail.com'
        icon={
          <Box
            component={EmailIcon}
            sx={{ mr: 1.4, width: 22, height: 'auto' }}
          />
        }
      />
      <ContactInfoItem
        value='+62 8525 6019 136'
        label='Sen - Jum / 9am - 5pm'
        link='https://wa.me/6285256019136?text=Halo%20D-Verse%2C%20saya%20ingin%20bertanya%20tentang%20D-Verse%20Festival'
        icon={
          <Box
            component={PhoneIcon}
            sx={{ mr: 1.4, width: 22, height: 'auto' }}
          />
        }
      />
      <ContactInfoItem
        value='Kampus II i Jl. Tamalanrea Raya (BTP) / Moncongloe Maros.'
        label='Lokasi Event'
        link='https://maps.app.goo.gl/daPztQbNBEYNgyT38'
        icon={
          <Box
            component={LocationIcon}
            sx={{ mr: 1.4, width: 22, height: 'auto' }}
          />
        }
      />
    </Box>
  )
}

export default FooterContactInfo
