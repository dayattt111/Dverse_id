'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import { supabase } from '@/lib/supabase/config'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserRow {
  id: string
  email: string
  role: string
  createdAt: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const roleConfig: Record<string, { color: string; label: string }> = {
  admin: { color: '#22c55e', label: 'Admin' },
  peserta: { color: '#3b82f6', label: 'Peserta' },
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const fetchUsers = useCallback(async () => {
    try {
      // Fetch user_roles joined with auth.users email via the FK
      // Since we can't query auth.users directly from client, we store email in user_roles
      // or query user_roles and resolve emails from the current auth session.
      // Approach: query user_roles which has user_id + role, then get emails via a
      // server-friendly query. For simplicity, we use a Postgres view or direct join.
      // Since user_roles only has user_id and role, we query and pair with cached auth info.
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error

      // We can't access auth.users from the client SDK. 
      // Display user_id and role. The email is fetched from auth metadata if available.
      const mapped: UserRow[] = (data ?? []).map((r) => ({
        id: r.user_id as string,
        email: '', // will be resolved below
        role: r.role as string,
        createdAt: r.created_at as string,
      }))

      // Try to get emails from auth.users using an RPC or a view.
      // Fallback: use the user_id as identifier. 
      // Best effort: fetch user info for each user via admin API won't work from client.
      // We'll create a simple approach: add a postgres function or view.
      // For now, show a truncated user_id + any available info from the session.

      // Attempt to resolve emails via an RPC function if it exists
      try {
        const { data: emailData } = await supabase.rpc('get_user_emails', {
          user_ids: mapped.map((u) => u.id),
        })
        if (emailData && Array.isArray(emailData)) {
          const emailMap = new Map(
            emailData.map((e: { id: string; email: string }) => [e.id, e.email])
          )
          mapped.forEach((u) => {
            u.email = emailMap.get(u.id) ?? u.id.slice(0, 8) + '...'
          })
        }
      } catch {
        // RPC doesn't exist yet — fallback to showing user_id
        mapped.forEach((u) => {
          u.email = u.id.slice(0, 8) + '...'
        })
      }

      setUsers(mapped)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const updateRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId)

      if (error) throw error

      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
      setSnack({ open: true, message: `Role diperbarui ke ${newRole}`, severity: 'success' })
    } catch (err) {
      setSnack({ open: true, message: err instanceof Error ? err.message : 'Gagal update role', severity: 'error' })
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>Users</Typography>
        <Typography sx={{ fontSize: 13, color: '#64748b', mt: 0.3 }}>
          Kelola pengguna dan role akses admin
        </Typography>
      </Box>

      {/* Info */}
      <Card sx={{ borderRadius: 3, background: '#0f172a', border: '1px solid #1e293b', mb: 3 }}>
        <CardContent sx={{ py: 2, px: 3 }}>
          <Typography sx={{ color: '#94a3b8', fontSize: 13 }}>
            💡 User ditambahkan otomatis saat registrasi via Supabase Auth. Anda dapat mengubah role antara{' '}
            <strong style={{ color: '#22c55e' }}>admin</strong> dan{' '}
            <strong style={{ color: '#3b82f6' }}>peserta</strong>. Untuk menambahkan admin baru, buat user melalui Supabase Dashboard lalu ubah role-nya di sini.
          </Typography>
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: 3, background: '#0f172a', border: '1px solid #1e293b' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Email / User ID', 'Role', 'Dibuat', 'Aksi'].map((h) => (
                    <TableCell key={h} sx={headCellSx}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 4 }).map((_, j) => (
                          <TableCell key={j} sx={{ borderColor: '#1e293b' }}>
                            <Skeleton variant="text" sx={{ bgcolor: '#1e293b' }} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : users.map((u) => {
                      const rc = roleConfig[u.role] ?? roleConfig.peserta
                      return (
                        <TableRow key={u.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                          <TableCell sx={cellSx}>
                            <Typography sx={{ fontWeight: 600, color: '#f1f5f9', fontSize: 13 }}>
                              {u.email}
                            </Typography>
                            <Typography sx={{ fontSize: 10, color: '#475569', fontFamily: 'monospace', mt: 0.3 }}>
                              {u.id}
                            </Typography>
                          </TableCell>
                          <TableCell sx={cellSx}>
                            <Chip
                              label={rc.label}
                              size="small"
                              sx={{
                                fontSize: 11,
                                fontWeight: 700,
                                bgcolor: `${rc.color}20`,
                                color: rc.color,
                                borderRadius: 1.5,
                                height: 24,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ ...cellSx, fontSize: 12, color: '#64748b' }}>
                            {formatDate(u.createdAt)}
                          </TableCell>
                          <TableCell sx={cellSx}>
                            <TextField
                              value={u.role}
                              onChange={(e) => updateRole(u.id, e.target.value)}
                              size="small"
                              select
                              variant="standard"
                              sx={{ minWidth: 110 }}
                              slotProps={{ input: { disableUnderline: true } }}
                            >
                              {Object.entries(roleConfig).map(([val, cfg]) => (
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
                        </TableRow>
                      )
                    })}
                {!loading && users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ ...cellSx, textAlign: 'center', py: 6 }}>
                      Belum ada user terdaftar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

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
