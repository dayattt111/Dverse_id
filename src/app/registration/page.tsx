'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

const RegistrationForm = dynamic(
  () => import('./_components/registration-form'),
  {
    ssr: false,
    loading: () => (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    ),
  }
)

export default function RegistrationPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      }
    >
      <RegistrationForm />
    </Suspense>
  )
}
