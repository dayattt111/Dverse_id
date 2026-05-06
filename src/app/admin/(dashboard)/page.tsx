'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import {
  getAdminStats,
  getRecentParticipants,
  type AdminStats,
  type RecentParticipant,
} from '@/lib/supabase/admin-stats'

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

interface StatCardProps {
  title: string
  value: string
  icon: string
  color: string
  loading: boolean
}

function StatCard({ title, value, icon, color, loading }: StatCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        background: '#0f172a',
        border: '1px solid #1e293b',
        transition: 'border-color 0.2s, transform 0.2s',
        '&:hover': {
          borderColor: color,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: 1,
                mb: 1,
              }}
            >
              {title}
            </Typography>
            {loading ? (
              <Skeleton
                variant="text"
                width={80}
                height={44}
                sx={{ bgcolor: '#1e293b' }}
              />
            ) : (
              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: '#f1f5f9',
                  lineHeight: 1.2,
                }}
              >
                {value}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              background: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

const statusColor: Record<string, string> = {
  pending: '#eab308',
  verified: '#22c55e',
  rejected: '#ef4444',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'capitalize',
        bgcolor: `${statusColor[status] ?? '#64748b'}20`,
        color: statusColor[status] ?? '#64748b',
        borderRadius: 1.5,
        height: 24,
      }}
    />
  )
}

// ---------------------------------------------------------------------------
// Dashboard Page
// ---------------------------------------------------------------------------

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recent, setRecent] = useState<RecentParticipant[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [s, r] = await Promise.all([
        getAdminStats(),
        getRecentParticipants(10),
      ])
      setStats(s)
      setRecent(r)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const statCards = [
    {
      title: 'Total Peserta',
      value: String(stats?.totalParticipants ?? 0),
      icon: '👥',
      color: '#22c55e',
    },
    {
      title: 'Total Events',
      value: String(stats?.totalEvents ?? 0),
      icon: '📅',
      color: '#3b82f6',
    },
    {
      title: 'Paket Terjual',
      value: String(stats?.totalPackagesSold ?? 0),
      icon: '📦',
      color: '#a855f7',
    },
    {
      title: 'Total Pendapatan',
      value: formatCurrency(stats?.totalRevenue ?? 0),
      icon: '💰',
      color: '#eab308',
    },
  ]

  return (
    <Box>
      {/* Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Recent Participants */}
      <Card
        sx={{
          borderRadius: 3,
          background: '#0f172a',
          border: '1px solid #1e293b',
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              px: 3,
              py: 2.5,
              borderBottom: '1px solid #1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                color: '#f1f5f9',
                fontSize: 16,
              }}
            >
              Peserta Pendaftar Terbaru
            </Typography>
            <Chip
              label={`${recent.length} terbaru`}
              size="small"
              sx={{
                bgcolor: 'rgba(34,197,94,0.1)',
                color: '#22c55e',
                fontWeight: 600,
                fontSize: 11,
                borderRadius: 1.5,
              }}
            />
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Nama', 'Email', 'Instansi', 'Event', 'Paket', 'Status', 'Tanggal'].map(
                    (h) => (
                      <TableCell
                        key={h}
                        sx={{
                          color: '#475569',
                          fontWeight: 700,
                          fontSize: 11,
                          textTransform: 'uppercase',
                          letterSpacing: 0.8,
                          borderColor: '#1e293b',
                          py: 1.5,
                        }}
                      >
                        {h}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <TableCell key={j} sx={{ borderColor: '#1e293b' }}>
                            <Skeleton
                              variant="text"
                              sx={{ bgcolor: '#1e293b' }}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : recent.map((p) => (
                      <TableRow
                        key={p.id}
                        sx={{
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                        }}
                      >
                        <TableCell
                          sx={{
                            color: '#e2e8f0',
                            fontWeight: 600,
                            fontSize: 13,
                            borderColor: '#1e293b',
                          }}
                        >
                          {p.name}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: '#94a3b8',
                            fontSize: 12,
                            borderColor: '#1e293b',
                          }}
                        >
                          {p.email}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: '#94a3b8',
                            fontSize: 12,
                            borderColor: '#1e293b',
                          }}
                        >
                          {p.institution}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: '#94a3b8',
                            fontSize: 12,
                            borderColor: '#1e293b',
                          }}
                        >
                          {p.eventName}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: '#a3e635',
                            fontSize: 12,
                            fontWeight: 600,
                            borderColor: '#1e293b',
                          }}
                        >
                          {p.packageName ?? '-'}
                        </TableCell>
                        <TableCell sx={{ borderColor: '#1e293b' }}>
                          <StatusBadge status={p.status} />
                        </TableCell>
                        <TableCell
                          sx={{
                            color: '#64748b',
                            fontSize: 11,
                            borderColor: '#1e293b',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatDate(p.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}

                {!loading && recent.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      sx={{
                        textAlign: 'center',
                        py: 6,
                        color: '#475569',
                        borderColor: '#1e293b',
                      }}
                    >
                      Belum ada peserta terdaftar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}
