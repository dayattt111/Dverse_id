'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import type { IEvent } from '@/types/event'
import type { IEventParticipant } from '@/types/event-participant'
import { getEvents } from '@/lib/supabase/events'
import { supabase } from '@/lib/supabase/config'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ParticipantRow extends IEventParticipant {
  eventName: string
  packageName: string | null
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: '#eab308', label: 'Pending' },
  verified: { color: '#22c55e', label: 'Verified' },
  rejected: { color: '#ef4444', label: 'Rejected' },
}

const headCellSx = {
  color: '#475569',
  fontWeight: 700,
  fontSize: 11,
  textTransform: 'uppercase' as const,
  letterSpacing: 0.8,
  borderColor: '#1e293b',
  py: 1.5,
}

const cellSx = {
  color: '#cbd5e1',
  fontSize: 13,
  borderColor: '#1e293b',
  py: 1.5,
}

const inputSx = {
  '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#1e293b' }, '&:hover fieldset': { borderColor: '#334155' } },
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ParticipantsPage() {
  const [rows, setRows] = useState<ParticipantRow[]>([])
  const [events, setEvents] = useState<IEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEvent, setFilterEvent] = useState<number | ''>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [search, setSearch] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  // Fetch participants with joins
  const fetchData = useCallback(async () => {
    try {
      const [eventsData, participantsRes] = await Promise.all([
        getEvents(),
        supabase
          .from('event_participant')
          .select(`
            *,
            events(name),
            event_packages(name)
          `)
          .order('created_at', { ascending: false }),
      ])

      setEvents(eventsData)

      if (participantsRes.error) throw participantsRes.error

      const mapped: ParticipantRow[] = (participantsRes.data ?? []).map((r) => ({
        id: r.id,
        eventId: r.event_id,
        packageId: r.package_id ?? undefined,
        name: r.name,
        email: r.email,
        phone: r.phone,
        institution: r.institution,
        picPayment: r.pic_payment ?? undefined,
        picFollow: r.pic_follow ?? undefined,
        status: r.status,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        eventName: (r.events as unknown as { name: string } | null)?.name ?? '-',
        packageName: (r.event_packages as unknown as { name: string } | null)?.name ?? null,
      }))

      setRows(mapped)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filtered data
  const filtered = useMemo(() => {
    let result = rows
    if (filterEvent) result = result.filter((r) => r.eventId === filterEvent)
    if (filterStatus) result = result.filter((r) => r.status === filterStatus)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.institution.toLowerCase().includes(q)
      )
    }
    return result
  }, [rows, filterEvent, filterStatus, search])

  // Status update
  const updateStatus = async (id: number, status: string) => {
    try {
      const { error } = await supabase
        .from('event_participant')
        .update({ status })
        .eq('id', id)

      if (error) throw error

      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: status as IEventParticipant['status'] } : r))
      )
      setSnack({ open: true, message: `Status diperbarui ke ${status}`, severity: 'success' })
    } catch (err) {
      setSnack({ open: true, message: err instanceof Error ? err.message : 'Gagal update', severity: 'error' })
    }
  }

  // CSV Export
  const exportCSV = () => {
    const headers = ['Nama', 'Email', 'Telepon', 'Instansi', 'Event', 'Paket', 'Status', 'Tanggal Daftar']
    const csvRows = [
      headers.join(','),
      ...filtered.map((r) =>
        [
          `"${r.name}"`,
          `"${r.email}"`,
          `"${r.phone}"`,
          `"${r.institution}"`,
          `"${r.eventName}"`,
          `"${r.packageName ?? '-'}"`,
          r.status ?? 'pending',
          r.createdAt ? new Date(r.createdAt).toLocaleDateString('id-ID') : '-',
        ].join(',')
      ),
    ]

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `peserta-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // View proof image
  const viewImage = (url: string) => {
    setImageUrl(url)
    setImageDialogOpen(true)
  }

  const formatDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '-'

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>Peserta</Typography>
          <Typography sx={{ fontSize: 13, color: '#64748b', mt: 0.3 }}>
            {filtered.length} peserta {filterEvent || filterStatus || search ? '(difilter)' : 'terdaftar'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={exportCSV}
          disabled={filtered.length === 0}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 2,
            bgcolor: '#3b82f6',
            '&:hover': { bgcolor: '#2563eb' },
          }}
        >
          📥 Export CSV
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="Cari nama / email / instansi"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 240, ...inputSx }}
          slotProps={{ inputLabel: { sx: { color: '#64748b' } }, input: { sx: { color: '#f1f5f9' } } }}
        />
        <TextField
          label="Event"
          value={filterEvent}
          onChange={(e) => setFilterEvent(e.target.value === '' ? '' : Number(e.target.value))}
          size="small"
          select
          sx={{ minWidth: 180, ...inputSx }}
          slotProps={{ inputLabel: { sx: { color: '#64748b' } }, input: { sx: { color: '#f1f5f9' } } }}
        >
          <MenuItem value="">Semua Event</MenuItem>
          {events.map((ev) => (
            <MenuItem key={ev.id} value={ev.id}>
              {ev.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          size="small"
          select
          sx={{ minWidth: 140, ...inputSx }}
          slotProps={{ inputLabel: { sx: { color: '#64748b' } }, input: { sx: { color: '#f1f5f9' } } }}
        >
          <MenuItem value="">Semua</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="verified">Verified</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </TextField>
      </Box>

      {/* Table */}
      <Card sx={{ borderRadius: 3, background: '#0f172a', border: '1px solid #1e293b' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Nama', 'Email', 'Telepon', 'Instansi', 'Event', 'Paket', 'Bukti', 'Status', 'Tanggal'].map((h) => (
                    <TableCell key={h} sx={headCellSx}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 9 }).map((_, j) => (
                          <TableCell key={j} sx={{ borderColor: '#1e293b' }}>
                            <Skeleton variant="text" sx={{ bgcolor: '#1e293b' }} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : filtered.map((r) => {
                      const st = statusConfig[r.status ?? 'pending']
                      return (
                        <TableRow key={r.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                          <TableCell sx={cellSx}>
                            <Typography sx={{ fontWeight: 600, color: '#f1f5f9', fontSize: 13 }}>{r.name}</Typography>
                          </TableCell>
                          <TableCell sx={{ ...cellSx, fontSize: 12 }}>{r.email}</TableCell>
                          <TableCell sx={{ ...cellSx, fontSize: 12 }}>{r.phone}</TableCell>
                          <TableCell sx={{ ...cellSx, fontSize: 12 }}>{r.institution}</TableCell>
                          <TableCell sx={cellSx}>{r.eventName}</TableCell>
                          <TableCell sx={cellSx}>{r.packageName ?? '-'}</TableCell>
                          <TableCell sx={cellSx}>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {r.picPayment && (
                                <IconButton size="small" onClick={() => viewImage(r.picPayment!)} title="Bukti Bayar" sx={{ color: '#3b82f6', fontSize: 14 }}>
                                  💳
                                </IconButton>
                              )}
                              {r.picFollow && (
                                <IconButton size="small" onClick={() => viewImage(r.picFollow!)} title="Bukti Follow" sx={{ color: '#a855f7', fontSize: 14 }}>
                                  📷
                                </IconButton>
                              )}
                              {!r.picPayment && !r.picFollow && (
                                <Typography sx={{ color: '#475569', fontSize: 11 }}>-</Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={cellSx}>
                            <TextField
                              value={r.status ?? 'pending'}
                              onChange={(e) => r.id && updateStatus(r.id, e.target.value)}
                              size="small"
                              select
                              variant="standard"
                              sx={{ minWidth: 100 }}
                              slotProps={{ input: { disableUnderline: true } }}
                            >
                              {Object.entries(statusConfig).map(([val, cfg]) => (
                                <MenuItem key={val} value={val}>
                                  <Chip
                                    label={cfg.label}
                                    size="small"
                                    sx={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      bgcolor: `${cfg.color}20`,
                                      color: cfg.color,
                                      borderRadius: 1.5,
                                      height: 22,
                                    }}
                                  />
                                </MenuItem>
                              ))}
                            </TextField>
                          </TableCell>
                          <TableCell sx={{ ...cellSx, fontSize: 11, color: '#64748b' }}>{formatDate(r.createdAt)}</TableCell>
                        </TableRow>
                      )
                    })}
                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ ...cellSx, textAlign: 'center', py: 6 }}>
                      {rows.length === 0 ? 'Belum ada peserta terdaftar.' : 'Tidak ada peserta yang sesuai filter.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#f1f5f9', borderBottom: '1px solid #1e293b' }}>
          Bukti Pendaftaran
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important', display: 'flex', justifyContent: 'center' }}>
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Bukti"
              style={{ maxWidth: '100%', maxHeight: 500, borderRadius: 8, objectFit: 'contain' }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setImageDialogOpen(false)} sx={{ color: '#64748b', textTransform: 'none' }}>
            Tutup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
