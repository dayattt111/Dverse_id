'use client'

import React, { Suspense } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import RegistrationForm from './_components/registration-form'

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
