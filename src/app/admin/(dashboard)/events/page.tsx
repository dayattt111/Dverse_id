'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useCallback } from 'react'
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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import type { IEvent } from '@/types/event'
import {
  getEvents,
  addEvent,
  updateEvent,
  deleteEvent,
} from '@/lib/supabase/events'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const statusConfig: Record<string, { color: string; label: string }> = {
  draft: { color: '#eab308', label: 'Draft' },
  published: { color: '#22c55e', label: 'Published' },
  archived: { color: '#64748b', label: 'Archived' },
}

const emptyEvent: Partial<IEvent> = {
  name: '',
  slug: '',
  description: '',
  eventDate: '',
  location: '',
  imageUrl: '',
  status: 'draft',
  maxParticipants: undefined,
}

const cellSx = {
  color: '#cbd5e1',
  fontSize: 13,
  borderColor: '#1e293b',
  py: 1.5,
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function EventsPage() {
  const [events, setEvents] = useState<IEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Partial<IEvent>>(emptyEvent)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const fetchEvents = useCallback(async () => {
    try {
      const data = await getEvents()
      setEvents(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Helpers -----------------------------------------------------------------

  const showSnack = (message: string, severity: 'success' | 'error') => {
    setSnack({ open: true, message, severity })
  }

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

  // Dialog handlers ---------------------------------------------------------

  const openAdd = () => {
    setEditingEvent({ ...emptyEvent })
    setDialogOpen(true)
  }

  const openEdit = (event: IEvent) => {
    setEditingEvent({ ...event })
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingEvent(emptyEvent)
  }

  const handleSave = async () => {
    if (!editingEvent.name?.trim()) {
      showSnack('Nama event wajib diisi', 'error')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...editingEvent,
        slug: editingEvent.slug || generateSlug(editingEvent.name!),
      }

      if (editingEvent.id) {
        await updateEvent(editingEvent.id, payload)
        showSnack('Event berhasil diperbarui', 'success')
      } else {
        await addEvent(payload)
        showSnack('Event berhasil ditambahkan', 'success')
      }
      closeDialog()
      fetchEvents()
    } catch (err) {
      showSnack(err instanceof Error ? err.message : 'Gagal menyimpan', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Delete handlers ---------------------------------------------------------

  const confirmDelete = (id: number) => {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingId) return
    setSaving(true)
    try {
      await deleteEvent(deletingId)
      showSnack('Event berhasil dihapus', 'success')
      setDeleteDialogOpen(false)
      setDeletingId(null)
      fetchEvents()
    } catch (err) {
      showSnack(err instanceof Error ? err.message : 'Gagal menghapus', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Field updater -----------------------------------------------------------

  const setField = <K extends keyof IEvent>(key: K, value: IEvent[K]) => {
    setEditingEvent((prev) => ({ ...prev, [key]: value }))
  }

  // Render ------------------------------------------------------------------

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>Events</Typography>
          <Typography sx={{ fontSize: 13, color: '#64748b', mt: 0.3 }}>
            Kelola semua event seminar dan acara
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={openAdd}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 2,
            bgcolor: '#22c55e',
            '&:hover': { bgcolor: '#16a34a' },
          }}
        >
          + Tambah Event
        </Button>
      </Box>

      {/* Table */}
      <Card sx={{ borderRadius: 3, background: '#0f172a', border: '1px solid #1e293b' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Nama', 'Slug', 'Tanggal', 'Lokasi', 'Status', 'Max', 'Aksi'].map((h) => (
                    <TableCell key={h} sx={headCellSx}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <TableCell key={j} sx={{ borderColor: '#1e293b' }}>
                            <Skeleton variant="text" sx={{ bgcolor: '#1e293b' }} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : events.map((ev) => {
                      const st = statusConfig[ev.status] ?? statusConfig.draft
                      return (
                        <TableRow
                          key={ev.id}
                          sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}
                        >
                          <TableCell sx={cellSx}>
                            <Typography sx={{ fontWeight: 600, color: '#f1f5f9', fontSize: 13 }}>
                              {ev.name}
                            </Typography>
                          </TableCell>
                          <TableCell sx={cellSx}>
                            <Typography sx={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>
                              {ev.slug}
                            </Typography>
                          </TableCell>
                          <TableCell sx={cellSx}>
                            {ev.eventDate
                              ? new Date(ev.eventDate).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '-'}
                          </TableCell>
                          <TableCell sx={cellSx}>{ev.location ?? '-'}</TableCell>
                          <TableCell sx={cellSx}>
                            <Chip
                              label={st.label}
                              size="small"
                              sx={{
                                fontSize: 11,
                                fontWeight: 700,
                                bgcolor: `${st.color}20`,
                                color: st.color,
                                borderRadius: 1.5,
                                height: 24,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={cellSx}>{ev.maxParticipants ?? '∞'}</TableCell>
                          <TableCell sx={cellSx}>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton size="small" onClick={() => openEdit(ev)} sx={{ color: '#3b82f6', fontSize: 16 }}>
                                ✏️
                              </IconButton>
                              <IconButton size="small" onClick={() => confirmDelete(ev.id)} sx={{ color: '#ef4444', fontSize: 16 }}>
                                🗑️
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                {!loading && events.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ ...cellSx, textAlign: 'center', py: 6 }}>
                      Belum ada event. Klik &quot;Tambah Event&quot; untuk mulai.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 3, color: '#f1f5f9' },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #1e293b' }}>
          {editingEvent.id ? 'Edit Event' : 'Tambah Event Baru'}
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Nama Event"
            value={editingEvent.name ?? ''}
            onChange={(e) => setField('name', e.target.value)}
            fullWidth
            size="small"
            required
            slotProps={{ inputLabel: { sx: { color: '#64748b' } }, input: { sx: { color: '#f1f5f9' } } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#1e293b' }, '&:hover fieldset': { borderColor: '#334155' } } }}
          />
          <TextField
            label="Slug"
            value={editingEvent.slug ?? ''}
            onChange={(e) => setField('slug', e.target.value)}
            fullWidth
            size="small"
            helperText="Kosongkan untuk auto-generate dari nama"
            slotProps={{ inputLabel: { sx: { color: '#64748b' } }, input: { sx: { color: '#f1f5f9' } } }}
            FormHelperTextProps={{ sx: { color: '#475569' } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#1e293b' }, '&:hover fieldset': { borderColor: '#334155' } } }}
          />
          <TextField
            label="Deskripsi"
            value={editingEvent.description ?? ''}
            onChange={(e) => setField('description', e.target.value)}
            fullWidth
            size="small"
            multiline
            minRows={3}
            slotProps={{ inputLabel: { sx: { color: '#64748b' } }, input: { sx: { color: '#f1f5f9' } } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#1e293b' }, '&:hover fieldset': { borderColor: '#334155' } } }}
          />
          <TextField
            label="Tanggal Event"
            type="datetime-local"
            value={editingEvent.eventDate ? editingEvent.eventDate.slice(0, 16) : ''}
            onChange={(e) => setField('eventDate', e.target.value)}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true, sx: { color: '#64748b' } }, input: { sx: { color: '#f1f5f9' } } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#1e293b' }, '&:hover fieldset': { borderColor: '#334155' } } }}
          />
          <TextField
            label="Lokasi"
            value={editingEvent.location ?? ''}
            onChange={(e) => setField('location', e.target.value)}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { sx: { color: '#64748b' } }, input: { sx: { color: '#f1f5f9' } } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#1e293b' }, '&:hover fieldset': { borderColor: '#334155' } } }}
          />
          <TextField
            label="Image URL"
            value={editingEvent.imageUrl ?? ''}
            onChange={(e) => setField('imageUrl', e.target.value)}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { sx: { color: '#64748b' } }, input: { sx: { color: '#f1f5f9' } } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#1e293b' }, '&:hover fieldset': { borderColor: '#334155' } } }}
          />
          <TextField
            label="Status"
            value={editingEvent.status ?? 'draft'}
            onChange={(e) => setField('status', e.target.value as IEvent['status'])}
            fullWidth
            size="small"
            select
            slotProps={{ inputLabel: { sx: { color: '#64748b' } }, input: { sx: { color: '#f1f5f9' } } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#1e293b' }, '&:hover fieldset': { borderColor: '#334155' } }, '& .MuiSvgIcon-root': { color: '#64748b' } }}
          >
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </TextField>
          <TextField
            label="Max Peserta"
            type="number"
            value={editingEvent.maxParticipants ?? ''}
            onChange={(e) => setField('maxParticipants', e.target.value ? Number(e.target.value) : undefined)}
            fullWidth
            size="small"
            helperText="Kosongkan jika tidak ada batas"
            slotProps={{ inputLabel: { sx: { color: '#64748b' } }, input: { sx: { color: '#f1f5f9' } } }}
            FormHelperTextProps={{ sx: { color: '#475569' } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#1e293b' }, '&:hover fieldset': { borderColor: '#334155' } } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #1e293b' }}>
          <Button onClick={closeDialog} sx={{ color: '#64748b', textTransform: 'none' }}>
            Batal
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              bgcolor: '#22c55e',
              '&:hover': { bgcolor: '#16a34a' },
            }}
          >
            {saving ? 'Menyimpan...' : editingEvent.id ? 'Simpan Perubahan' : 'Tambah Event'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 3, color: '#f1f5f9' },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Hapus Event?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#94a3b8', fontSize: 14 }}>
            Event yang dihapus tidak dapat dikembalikan. Semua data peserta dan paket yang terkait juga akan terhapus.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#64748b', textTransform: 'none' }}>
            Batal
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            disabled={saving}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              bgcolor: '#ef4444',
              '&:hover': { bgcolor: '#dc2626' },
            }}
          >
            {saving ? 'Menghapus...' : 'Hapus Event'}
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
