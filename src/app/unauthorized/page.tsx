import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
        textAlign: 'center',
        p: 4,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: 4,
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          fontSize: 40,
        }}
      >
        🚫
      </Box>

      <Typography
        variant="h2"
        sx={{
          fontWeight: 900,
          color: '#ef4444',
          mb: 1,
          fontSize: { xs: 48, md: 72 },
        }}
      >
        403
      </Typography>

      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: '#f1f5f9',
          mb: 1.5,
        }}
      >
        Akses Ditolak
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: '#64748b',
          mb: 4,
          maxWidth: 400,
          lineHeight: 1.7,
        }}
      >
        Kamu tidak memiliki izin untuk mengakses halaman ini.
        Halaman ini hanya bisa diakses oleh admin.
      </Typography>

      <Button
        component={Link}
        href="/"
        variant="contained"
        sx={{
          py: 1.5,
          px: 4,
          borderRadius: 2,
          fontWeight: 700,
          textTransform: 'none',
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          '&:hover': {
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
          },
        }}
      >
        Kembali ke Beranda
      </Button>
    </Box>
  )
}
