'use client'

// components
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material'

const Footer = () => {
  const { palette } = useTheme()

  return (
    <Box
      sx={(theme) => ({
        width: '100%',
        backgroundColor:
          palette.mode === 'dark' ? '#020617' : '#f0fdf4',
        borderTop: `1px solid ${theme.palette.divider}`,
      })}
    >
      <Stack
        sx={{
          py: 3,
          width: {
            xs: '90%',
            md: 820,
          },
          mx: 'auto',
          alignItems: 'center',
        }}
      >
        <Box
          component='p'
          sx={{ fontSize: 13, color: 'text.secondary', textAlign: 'center', m: 0 }}
        >
          D-Verse (Developer Universe) by Dipanegara Computer Club &amp; HIMATIK PNUP
        </Box>
      </Stack>
    </Box>
  )
}

export default Footer
