'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

function PackagesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventIdParam = searchParams.get('event')

  useEffect(() => {
    // Redirect to direct registration for seminar
    if (eventIdParam === '1') {
      router.replace(`/registration?event=1`)
    } else {
      // For other events, keep the packages page or redirect accordingly
      router.replace('/registration')
    }
  }, [eventIdParam, router])

  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  )
}

export default function PackagesPage() {
  return (
    <Suspense fallback={
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    }>
      <PackagesContent />
    </Suspense>
  )
}
