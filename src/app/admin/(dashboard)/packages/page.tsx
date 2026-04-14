'use client'

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
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import type { IEvent } from '@/types/event'
import type { IEventPackage } from '@/types/event-package'
import { getEvents } from '@/lib/supabase/events'
import { supabase } from '@/lib/supabase/config'

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------

interface PackageRow extends IEventPackage {
  eventName: string
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

const tfSx = {
  '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#1e293b' }, '&:hover fieldset': { borderColor: '#334155' } },
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

const emptyPkg: Partial<Omit<IEventPackage, 'eventId'>> & { eventId: number | '' } = {
  eventId: '',
  name: '',
  code: '',
  price: 0,
  discountedPrice: undefined,
  items: [],
  description: '',
  isBundle: false,
  sortOrder: 0,
  active: true,
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PackagesPage() {
  const [rows, setRows] = useState<PackageRow[]>([])
  const [events, setEvents] = useState<IEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<Omit<IEventPackage, 'eventId'>> & { eventId: number | '' }>(emptyPkg)
  const [itemsText, setItemsText] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const fetchData = useCallback(async () => {
    try {
      const [eventsData, pkgRes] = await Promise.all([
        getEvents(),
        supabase
          .from('event_packages')
          .select('*, events(name)')
          .order('sort_order', { ascending: true }),
      ])
      setEvents(eventsData)
      if (pkgRes.error) throw pkgRes.error

      const mapped: PackageRow[] = (pkgRes.data ?? []).map((r) => ({
        id: r.id,
        eventId: r.event_id,
        name: r.name,
        code: r.code,
        price: r.price,
        discountedPrice: r.discounted_price ?? undefined,
        items: (r.items as string[]) ?? [],
        image: r.image ?? undefined,
        description: r.description ?? undefined,
        isBundle: !!r.is_bundle,
        sortOrder: r.sort_order,
        active: !!r.active,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        eventName: (r.events as unknown as { name: string } | null)?.name ?? '-',
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

  // Helpers -----------------------------------------------------------------

  const showSnack = (message: string, severity: 'success' | 'error') =>
    setSnack({ open: true, message, severity })

  const openAdd = () => {
    setEditing({ ...emptyPkg })
    setItemsText('')
    setDialogOpen(true)
  }

  const openEdit = (pkg: PackageRow) => {
    setEditing({ ...pkg })
    setItemsText(pkg.items.join('\n'))
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditing(emptyPkg)
    setItemsText('')
  }

  const handleSave = async () => {
    if (!editing.name?.trim() || !editing.code?.trim() || !editing.eventId) {
      showSnack('Nama, kode, dan event wajib diisi', 'error')
      return
    }

    setSaving(true)
    try {
      const row = {
        event_id: editing.eventId as number,
        name: editing.name,
        code: editing.code,
        price: editing.price ?? 0,
        discounted_price: editing.discountedPrice ?? null,
        items: itemsText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        description: editing.description || null,
        is_bundle: !!editing.isBundle,
        sort_order: editing.sortOrder ?? 0,
        active: editing.active ?? true,
      }

      if (editing.id) {
        const { error } = await supabase.from('event_packages').update(row).eq('id', editing.id)
        if (error) throw error
        showSnack('Paket berhasil diperbarui', 'success')
      } else {
        const { error } = await supabase.from('event_packages').insert(row)
        if (error) throw error
        showSnack('Paket berhasil ditambahkan', 'success')
      }
      closeDialog()
      fetchData()
    } catch (err) {
      showSnack(err instanceof Error ? err.message : 'Gagal menyimpan', 'error')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = (id: number) => {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingId) return
    setSaving(true)
    try {
      const { error } = await supabase.from('event_packages').delete().eq('id', deletingId)
      if (error) throw error
      showSnack('Paket berhasil dihapus', 'success')
      setDeleteDialogOpen(false)
      setDeletingId(null)
      fetchData()
    } catch (err) {
      showSnack(err instanceof Error ? err.message : 'Gagal menghapus', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>Paket Event</Typography>
          <Typography sx={{ fontSize: 13, color: '#64748b', mt: 0.3 }}>
            Kelola paket dan harga tiket event
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
          + Tambah Paket
        </Button>
      </Box>

      {/* Table */}
      <Card sx={{ borderRadius: 3, background: '#0f172a', border: '1px solid #1e293b' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Event', 'Nama', 'Kode', 'Harga', 'Diskon', 'Item', 'Bundle', 'Aktif', 'Urutan', 'Aksi'].map(
                    (h) => (
                      <TableCell key={h} sx={headCellSx}>
                        {h}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 10 }).map((_, j) => (
                          <TableCell key={j} sx={{ borderColor: '#1e293b' }}>
                            <Skeleton variant="text" sx={{ bgcolor: '#1e293b' }} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : rows.map((pkg) => (
                      <TableRow key={pkg.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                        <TableCell sx={cellSx}>{pkg.eventName}</TableCell>
                        <TableCell sx={cellSx}>
                          <Typography sx={{ fontWeight: 600, color: '#f1f5f9', fontSize: 13 }}>{pkg.name}</Typography>
                        </TableCell>
                        <TableCell sx={{ ...cellSx, fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>
                          {pkg.code}
                        </TableCell>
                        <TableCell sx={cellSx}>{formatCurrency(pkg.price)}</TableCell>
                        <TableCell sx={cellSx}>
                          {pkg.discountedPrice ? formatCurrency(pkg.discountedPrice) : '-'}
                        </TableCell>
                        <TableCell sx={cellSx}>
                          <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>
                            {pkg.items.length} item
                          </Typography>
                        </TableCell>
                        <TableCell sx={cellSx}>
                          {pkg.isBundle ? (
                            <Chip label="Bundle" size="small" sx={{ fontSize: 10, fontWeight: 700, bgcolor: '#a855f720', color: '#a855f7', borderRadius: 1.5, height: 22 }} />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell sx={cellSx}>
                          <Chip
                            label={pkg.active ? 'Aktif' : 'Nonaktif'}
                            size="small"
                            sx={{
                              fontSize: 10,
                              fontWeight: 700,
                              bgcolor: pkg.active ? '#22c55e20' : '#64748b20',
                              color: pkg.active ? '#22c55e' : '#64748b',
                              borderRadius: 1.5,
                              height: 22,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={cellSx}>{pkg.sortOrder}</TableCell>
                        <TableCell sx={cellSx}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton size="small" onClick={() => openEdit(pkg)} sx={{ color: '#3b82f6', fontSize: 16 }}>
                              ✏️
                            </IconButton>
                            <IconButton size="small" onClick={() => confirmDelete(pkg.id)} sx={{ color: '#ef4444', fontSize: 16 }}>
                              🗑️
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                {!loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} sx={{ ...cellSx, textAlign: 'center', py: 6 }}>
                      Belum ada paket. Klik &quot;Tambah Paket&quot; untuk mulai.
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
        PaperProps={{ sx: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 3, color: '#f1f5f9' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #1e293b' }}>
          {editing.id ? 'Edit Paket' : 'Tambah Paket Baru'}
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Event"
            value={editing.eventId ?? ''}
            onChange={(e) => setEditing((p) => ({ ...p, eventId: Number(e.target.value) }))}
            fullWidth
            size="small"
            select
            required
            slotProps={{ inputLabel: { sx: { color: '#64748b' } }, input: { sx: { color: '#f1f5f9' } } }}
            sx={{ ...tfSx, '& .MuiSvgIcon-root': { color: '#64748b' } }}
          >
            {events.map((ev) => (
              <MenuItem key={ev.id} value={ev.id}>
                {ev.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Nama Paket"
            value={editing.name ?? ''}
            onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
            fullWidth
            size="small"
            required
            slotProps={{ inputLabel: { sx: { color: '#64748b' } }, input: { sx: { color: '#f1f5f9' } } }}
            sx={tfSx}
          />
          <TextField
            label="Kode"
            value={editing.code ?? ''}
            onChange={(e) => setEditing((p) => ({ ...p, code: e.target.value }))}
            fullWidth
            size="small"
            required
            slotProps={{ inputLabel: { sx: { color: '#64748b' } }, input: { sx: { color: '#f1f5f9' } } }}
            sx={tfSx}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Harga (IDR)"
              type="number"
              value={editing.price ?? 0}
              onChange={(e) => setEditing((p) => ({ ...p, price: Number(e.target.value) }))}
              fullWidth
              size="small"
              slotProps={{ inputLabel: { sx: { color: '#64748b' } }, input: { sx: { color: '#f1f5f9' } } }}
              sx={tfSx}
            />
            <TextField
              label="Harga Diskon (IDR)"
              type="number"
              value={editing.discountedPrice ?? ''}
              onChange={(e) =>
                setEditing((p) => ({
                  ...p,
                  discountedPrice: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              fullWidth
              size="small"
              slotProps={{ inputLabel: { sx: { color: '#64748b' } }, input: { sx: { color: '#f1f5f9' } } }}
              sx={tfSx}
            />
          </Box>
          <TextField
            label="Deskripsi"
            value={editing.description ?? ''}
            onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))}
            fullWidth
            size="small"
            multiline
            minRows={2}
            slotProps={{ inputLabel: { sx: { color: '#64748b' } }, input: { sx: { color: '#f1f5f9' } } }}
            sx={tfSx}
          />
          <TextField
            label="Items (satu per baris)"
            value={itemsText}
            onChange={(e) => setItemsText(e.target.value)}
            fullWidth
            size="small"
            multiline
            minRows={3}
            helperText="Masukkan setiap item di baris terpisah"
            slotProps={{ inputLabel: { sx: { color: '#64748b' } }, input: { sx: { color: '#f1f5f9' } } }}
            FormHelperTextProps={{ sx: { color: '#475569' } }}
            sx={tfSx}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Urutan"
              type="number"
              value={editing.sortOrder ?? 0}
              onChange={(e) => setEditing((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
              fullWidth
              size="small"
              slotProps={{ inputLabel: { sx: { color: '#64748b' } }, input: { sx: { color: '#f1f5f9' } } }}
              sx={tfSx}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!editing.isBundle}
                  onChange={(e) => setEditing((p) => ({ ...p, isBundle: e.target.checked }))}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#a855f7' }, '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': { bgcolor: '#a855f7' } }}
                />
              }
              label={<Typography sx={{ color: '#94a3b8', fontSize: 13 }}>Bundle</Typography>}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editing.active ?? true}
                  onChange={(e) => setEditing((p) => ({ ...p, active: e.target.checked }))}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#22c55e' }, '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': { bgcolor: '#22c55e' } }}
                />
              }
              label={<Typography sx={{ color: '#94a3b8', fontSize: 13 }}>Aktif</Typography>}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #1e293b' }}>
          <Button onClick={closeDialog} sx={{ color: '#64748b', textTransform: 'none' }}>
            Batal
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' } }}
          >
            {saving ? 'Menyimpan...' : editing.id ? 'Simpan Perubahan' : 'Tambah Paket'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 3, color: '#f1f5f9' } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Hapus Paket?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#94a3b8', fontSize: 14 }}>
            Paket yang dihapus tidak dapat dikembalikan.
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
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
          >
            {saving ? 'Menghapus...' : 'Hapus Paket'}
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
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} variant="filled" sx={{ borderRadius: 2 }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
