'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

const PackageSelection = dynamic(
  () => import('./_components/package-selection'),
  {
    ssr: false,
    loading: () => (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    ),
  }
)

export default function PackagesPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      }
    >
      <PackageSelection />
    </Suspense>
  )
}
