'use client'

import React, { FC, memo, ReactElement, useCallback } from 'react'

// components
import Box from '@mui/material/Box'
import MuiLink from '@mui/material/Link'
import Typography from '@mui/material/Typography'

// interfaces
import { Theme } from '@mui/material/styles'

// constants
import { companyMenus } from '@/constants/menus'

interface LinkItemProps {
  label: string
  path: string
  icon?: ReactElement
}

const LinkItem: FC<LinkItemProps> = ({ label, path, icon }: LinkItemProps) => {
  const isAnchor = path.startsWith('#')

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isAnchor) {
        e.preventDefault()
        const id = path.replace('#', '')
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        }
      }
    },
    [isAnchor, path]
  )

  return (
    <MuiLink
      href={path}
      onClick={handleClick}
      sx={{
        py: 0.8,
        px: 1.8,
        mx: 0.4,
        borderRadius: 10,
        cursor: 'pointer',
        overflow: 'hidden',
        alignItems: 'center',
        position: 'relative',
        color: (theme: Theme) =>
          theme.palette.mode === 'light'
            ? 'rgba(15, 23, 42, 0.75)'
            : 'rgba(255,255,255,0.8)',
        textDecoration: 'none',
        display: 'inline-block',
        // Icon
        '& svg': {
          fontSize: 18,
          transform: 'translateX(-32px)',
          position: 'absolute',
          top: '8px',
          transition: (theme: Theme) =>
            theme.transitions.create(['transform', 'margin']),
        },

        '&:hover': {
          backgroundColor: 'primary.main',
          color: '#fff',
          '& svg': {
            transform: 'translateX(0px)',
          },
          '& p': {
            marginLeft: '26px',
          },
        },
      }}
    >
      {icon}
      <Typography
        variant='h6'
        component='p'
        sx={{
          fontSize: 14,
          display: 'inline-block',
          color: 'inherit',
          marginLeft: '0',
          transition: (theme: Theme) => theme.transitions.create(['margin']),
        }}
      >
        {label}
      </Typography>
    </MuiLink>
  )
}
const MemoizedLinkItem = memo(LinkItem)

const AppBarNavigation: FC = () => {
  return (
    <Box sx={{ mx: 'auto' }}>
      <Box
        component='ul'
        sx={{
          m: 0,
          lineHeight: 0,
          pl: 0,
        }}
      >
        {companyMenus.map((item, index) => (
          <MemoizedLinkItem
            key={String(index)}
            label={item.label}
            path={item.path}
            icon={item.icon}
          />
        ))}
      </Box>
    </Box>
  )
}

export default memo(AppBarNavigation)
