import React, { Fragment, useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { useApp } from '@/hooks'
import { PREFERRED_MODE_KEY } from '@/constants'
import { companyMenus } from '@/constants/menus'

const saveModePreference = (mode: string) => {
  try {
    window.localStorage.setItem(PREFERRED_MODE_KEY, mode)
  } catch { /* ignore */ }
}

const AnimatedHamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const theme = useTheme()
  const { isDark, setIsDark } = useApp()

  // Create a portal container on mount so drawer renders outside the transformed AppBar
  useEffect(() => {
    const el = document.createElement('div')
    el.setAttribute('id', 'mobile-drawer-portal')
    document.body.appendChild(el)
    setPortalTarget(el)
    return () => {
      document.body.removeChild(el)
    }
  }, [])

  const toggleMenu = useCallback(() => setIsOpen((v) => !v), [])
  const closeMenu = useCallback(() => setIsOpen(false), [])

  const toggleDarkMode = useCallback(() => {
    const next = !isDark
    saveModePreference(next ? 'dark' : 'light')
    setIsDark(next)
  }, [isDark, setIsDark])

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
      if (path.startsWith('#')) {
        e.preventDefault()
        closeMenu()
        setTimeout(() => {
          const id = path.replace('#', '')
          const el = document.getElementById(id)
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }, 220)
      } else {
        closeMenu()
      }
    },
    [closeMenu]
  )

  const menuColor = theme.palette.mode === 'light'
    ? theme.palette.text.primary
    : '#fff'

  return (
    <Fragment>
      {/* Hamburger button */}
      <IconButton
        onClick={toggleMenu}
        sx={{ p: 0, width: 42, height: 42 }}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        <svg width='32' height='32' viewBox='0 0 32 32'>
          <motion.line
            x1='6' y1='10' x2='26' y2='10'
            stroke={menuColor} strokeWidth='2' strokeLinecap='round'
            animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 6 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
          <motion.line
            x1='6' y1='16' x2='26' y2='16'
            stroke={menuColor} strokeWidth='2' strokeLinecap='round'
            animate={{ opacity: isOpen ? 0 : 1, x: isOpen ? 10 : 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          />
          <motion.line
            x1='6' y1='22' x2='26' y2='22'
            stroke={menuColor} strokeWidth='2' strokeLinecap='round'
            animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -6 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        </svg>
      </IconButton>

      {/* Render drawer via portal to escape transformed parent */}
      {portalTarget && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key='backdrop'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={closeMenu}
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 1099,
                  background: 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(2px)',
                }}
              />

            {/* Drawer panel */}
            <motion.div
              key='drawer'
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '80vw',
                maxWidth: 320,
                zIndex: 1200,
                display: 'flex',
                flexDirection: 'column',
                background: theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff',
                boxShadow: '-8px 0 40px rgba(0,0,0,0.25)',
                overflowY: 'auto',
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 3,
                  py: 2.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant='subtitle1' sx={{ fontWeight: 800, color: 'primary.main' }}>
                  Menu
                </Typography>
                <IconButton onClick={closeMenu} size='small' aria-label='Close menu'>
                  <svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
                    <path d='M5 5L15 15M15 5L5 15' stroke={menuColor} strokeWidth='2' strokeLinecap='round' />
                  </svg>
                </IconButton>
              </Box>

              {/* Nav links */}
              <Box component='nav' sx={{ flex: 1, px: 2, py: 2 }}>
                {companyMenus.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 + 0.1, duration: 0.22 }}
                  >
                    <Box
                      component='a'
                      href={item.path}
                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
                        handleNavClick(e, item.path)
                      }
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 2,
                        py: 1.5,
                        mb: 0.5,
                        borderRadius: 2,
                        textDecoration: 'none',
                        color: theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.85)'
                          : 'rgba(15,23,42,0.8)',
                        fontWeight: 600,
                        fontSize: '1rem',
                        transition: 'background-color 0.2s, color 0.2s',
                        '&:hover': {
                          backgroundColor: theme.palette.primary.main,
                          color: '#fff',
                        },
                        '& svg': { width: 18, height: 18, flexShrink: 0 },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        {item.icon}
                      </Box>
                      {item.label}
                    </Box>
                  </motion.div>
                ))}
              </Box>

              {/* Footer — dark mode toggle */}
              <Box sx={{ px: 3, pb: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
                    {isDark ? 'Mode Gelap' : 'Mode Terang'}
                  </Typography>
                  <IconButton
                    onClick={toggleDarkMode}
                    aria-label='Toggle dark mode'
                    sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1, color: 'text.primary' }}
                  >
                    {isDark ? (
                      <svg xmlns='http://www.w3.org/2000/svg' width={20} height={20} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' />
                      </svg>
                    ) : (
                      <svg xmlns='http://www.w3.org/2000/svg' width={20} height={20} viewBox='0 0 20 20' fill='currentColor'>
                        <path d='M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z' />
                      </svg>
                    )}
                  </IconButton>
                </Box>
              </Box>
            </motion.div>
            </>
          )}
        </AnimatePresence>,
        portalTarget
      )}
    </Fragment>
  )
}

export default AnimatedHamburgerMenu
