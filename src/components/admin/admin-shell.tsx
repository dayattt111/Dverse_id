'use client'

import React, { useState, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const DRAWER_WIDTH = 260

interface MenuItem {
  title: string
  icon: string
  path: string
  group: string
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', icon: '📊', path: '/admin', group: 'main' },
  { title: 'Events', icon: '📅', path: '/admin/events', group: 'events' },
  { title: 'Participants', icon: '👥', path: '/admin/participants', group: 'events' },
  { title: 'Packages', icon: '📦', path: '/admin/packages', group: 'events' },
  { title: 'Users', icon: '🔐', path: '/admin/users', group: 'manage' },
  { title: 'Programs', icon: '📚', path: '/admin/programs', group: 'manage' },
  { title: 'Portfolio', icon: '📁', path: '/admin/portfolio', group: 'manage' },
  { title: 'Career', icon: '💼', path: '/admin/career', group: 'manage' },
  { title: 'Leaderboard', icon: '🏆', path: '/admin/leaderboard', group: 'manage' },
  { title: 'Settings', icon: '⚙️', path: '/admin/settings', group: 'system' },
]

interface AdminShellProps {
  children: React.ReactNode
  userEmail: string
}

export default function AdminShell({ children, userEmail }: AdminShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const pageTitle = useMemo(() => {
    const active = menuItems.find(
      (item) =>
        item.path === pathname ||
        (item.path !== '/admin' && pathname.startsWith(item.path))
    )
    return active?.title ?? 'Admin'
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const isActive = (path: string) => {
    if (path === '/admin') return pathname === '/admin'
    return pathname.startsWith(path)
  }

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0a0f1e',
      }}
    >
      {/* Brand */}
      <Box sx={{ p: 2.5, pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            🌿
          </Box>
          <Box>
            <Typography
              sx={{
                color: '#f1f5f9',
                fontWeight: 800,
                fontSize: 15,
                lineHeight: 1.2,
              }}
            >
              D-Verse
            </Typography>
            <Typography sx={{ color: '#475569', fontSize: 11, fontWeight: 600 }}>
              Admin Panel
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#1e293b', mx: 2 }} />

      {/* Navigation */}
      <Box sx={{ flex: 1, py: 1, overflowY: 'auto' }}>
        {/* Main */}
        <List disablePadding>
          {menuItems
            .filter((m) => m.group === 'main')
            .map((item) => (
              <NavItem
                key={item.path}
                item={item}
                active={isActive(item.path)}
                onClick={() => {
                  router.push(item.path)
                  if (isMobile) setMobileOpen(false)
                }}
              />
            ))}
        </List>

        {/* Events */}
        <GroupLabel>Event Management</GroupLabel>
        <List disablePadding>
          {menuItems
            .filter((m) => m.group === 'events')
            .map((item) => (
              <NavItem
                key={item.path}
                item={item}
                active={isActive(item.path)}
                onClick={() => {
                  router.push(item.path)
                  if (isMobile) setMobileOpen(false)
                }}
              />
            ))}
        </List>

        {/* Manage */}
        <GroupLabel>Content Management</GroupLabel>
        <List disablePadding>
          {menuItems
            .filter((m) => m.group === 'manage')
            .map((item) => (
              <NavItem
                key={item.path}
                item={item}
                active={isActive(item.path)}
                onClick={() => {
                  router.push(item.path)
                  if (isMobile) setMobileOpen(false)
                }}
              />
            ))}
        </List>

        {/* System */}
        <GroupLabel>System</GroupLabel>
        <List disablePadding>
          {menuItems
            .filter((m) => m.group === 'system')
            .map((item) => (
              <NavItem
                key={item.path}
                item={item}
                active={isActive(item.path)}
                onClick={() => {
                  router.push(item.path)
                  if (isMobile) setMobileOpen(false)
                }}
              />
            ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid #1e293b' }}>
        <Typography
          sx={{
            color: '#334155',
            fontSize: 10,
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          Dipanegara Computer Club
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#080c1a' }}>
      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              borderRight: '1px solid #1e293b',
              background: '#0a0f1e',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              borderRight: '1px solid #1e293b',
              background: '#0a0f1e',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* Top bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: 'rgba(8, 12, 26, 0.8)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #1e293b',
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            {isMobile && (
              <IconButton
                onClick={() => setMobileOpen(true)}
                sx={{ color: '#94a3b8', mr: 1 }}
              >
                <span style={{ fontSize: 20 }}>☰</span>
              </IconButton>
            )}

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#f1f5f9',
                flex: 1,
                fontSize: { xs: 16, md: 18 },
              }}
            >
              {pageTitle}
            </Typography>

            <Chip
              label={userEmail}
              size="small"
              sx={{
                bgcolor: 'rgba(34, 197, 94, 0.1)',
                color: '#22c55e',
                fontWeight: 600,
                fontSize: 12,
                borderRadius: 2,
                maxWidth: { xs: 140, md: 220 },
                '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
              }}
            />

            <Button
              onClick={handleLogout}
              size="small"
              sx={{
                color: '#ef4444',
                fontWeight: 700,
                fontSize: 13,
                textTransform: 'none',
                minWidth: 'auto',
                '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' },
              }}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, md: 3 },
            overflowY: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        px: 2.5,
        pt: 2,
        pb: 0.5,
        color: '#475569',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </Typography>
  )
}

function NavItem({
  item,
  active,
  onClick,
}: {
  item: MenuItem
  active: boolean
  onClick: () => void
}) {
  return (
    <ListItem disablePadding sx={{ px: 1.5, py: 0.25 }}>
      <ListItemButton
        onClick={onClick}
        sx={{
          borderRadius: 2,
          py: 1,
          px: 1.5,
          bgcolor: active ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
          '&:hover': {
            bgcolor: active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.04)',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 36, fontSize: 18 }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.title}
          primaryTypographyProps={{
            fontSize: 13,
            fontWeight: active ? 700 : 500,
            color: active ? '#22c55e' : '#94a3b8',
          }}
        />
        {active && (
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: '#22c55e',
            }}
          />
        )}
      </ListItemButton>
    </ListItem>
  )
}
