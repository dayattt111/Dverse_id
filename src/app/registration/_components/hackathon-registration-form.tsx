'use client'

import React, { useState, useRef, useEffect } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import { useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/config'

const GOOGLE_DRIVE_FOLDER_URL =
  'https://drive.google.com/drive/folders/1KZlsRz6criPodaU1b2H389Rd-zwxE5a_?usp=drive_link'

const MAX_PDF_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_IDENTITY_SIZE = 5 * 1024 * 1024 // 5MB

/** Sanitize text input — remove null bytes and control characters */
function sanitizeText(value: string): string {
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim()
}

interface MemberFormState {
  name: string
  identity_file: File | null
  identity_file_name: string
}

export default function HackathonRegistrationForm() {
  const { palette } = useTheme()
  const router = useRouter()
  const isDark = palette.mode === 'dark'

  // Form state
  const [teamName, setTeamName] = useState('')
  const [institution, setInstitution] = useState('')
  const [email, setEmail] = useState('')
  const [leaderName, setLeaderName] = useState('')
  const [leaderPhone, setLeaderPhone] = useState('')
  const [memberCount, setMemberCount] = useState(1) // 1 or 2
  const [members, setMembers] = useState<MemberFormState[]>([
    { name: '', identity_file: null, identity_file_name: '' },
  ])
  const [proposalFile, setProposalFile] = useState<File | null>(null)
  const [proposalFileName, setProposalFileName] = useState('')
  const [leaderIdentityFile, setLeaderIdentityFile] = useState<File | null>(null)
  const [leaderIdentityFileName, setLeaderIdentityFileName] = useState('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [expandGuide, setExpandGuide] = useState(false)

  const leaderIdentityInputRef = useRef<HTMLInputElement>(null)
  const proposalInputRef = useRef<HTMLInputElement>(null)

  // When member count changes, add/remove member fields
  useEffect(() => {
    if (memberCount === 1 && members.length === 2) {
      setMembers(members.slice(0, 1))
    } else if (memberCount === 2 && members.length === 1) {
      setMembers([
        ...members,
        { name: '', identity_file: null, identity_file_name: '' },
      ])
    }
  }, [memberCount])

  // Event handlers
  const handleTextChange = (field: string, value: string) => {
    const sanitized = sanitizeText(value)
    switch (field) {
      case 'teamName':
        setTeamName(sanitized)
        break
      case 'institution':
        setInstitution(sanitized)
        break
      case 'email':
        setEmail(value.toLowerCase().trim())
        break
      case 'leaderName':
        setLeaderName(sanitized)
        break
      case 'leaderPhone':
        setLeaderPhone(value.replace(/[^\d+\-\s()]/g, ''))
        break
    }
  }

  const handleMemberNameChange = (index: number, value: string) => {
    const sanitized = sanitizeText(value)
    const newMembers = [...members]
    newMembers[index].name = sanitized
    setMembers(newMembers)
  }

  const validatePDF = (file: File, isIdentity: boolean): string | null => {
    if (file.type !== 'application/pdf') {
      return 'Format file harus PDF.'
    }
    const maxSize = isIdentity ? MAX_IDENTITY_SIZE : MAX_PDF_SIZE
    if (file.size > maxSize) {
      const maxMB = isIdentity ? 5 : 10
      return `Ukuran file terlalu besar. Maksimal ${maxMB}MB.`
    }
    return null
  }

  const handleLeaderIdentitySelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const err = validatePDF(file, true)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setLeaderIdentityFile(file)
    setLeaderIdentityFileName(file.name)
  }

  const handleMemberIdentitySelect = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const err = validatePDF(file, true)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    const newMembers = [...members]
    newMembers[index].identity_file = file
    newMembers[index].identity_file_name = file.name
    setMembers(newMembers)
  }

  const handleProposalSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const err = validatePDF(file, false)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setProposalFile(file)
    setProposalFileName(file.name)
  }

  // Upload file to Supabase Storage (documents bucket)
  const uploadFile = async (
    file: File,
    folder: string
  ): Promise<string> => {
    const timestamp = Date.now()
    const filename = `${timestamp}_${Math.random().toString(36).substring(2, 9)}.pdf`
    const filePath = `${folder}/${filename}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, { cacheControl: '3600', upsert: false })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)
    return urlData.publicUrl
  }

  // Validate form
  const validateForm = (): string | null => {
    if (!teamName.trim()) return 'Nama tim harus diisi.'
    if (!institution.trim()) return 'Asal instansi harus diisi.'
    if (!email.trim()) return 'Email harus diisi.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Format email tidak valid.'
    }
    if (!leaderName.trim()) return 'Nama ketua harus diisi.'
    if (!leaderPhone.trim()) return 'Nomor HP ketua harus diisi.'
    if (!leaderIdentityFile) {
      return 'KTM/Kartu Pelajar ketua harus diupload.'
    }

    for (let i = 0; i < members.length; i++) {
      if (!members[i].name.trim()) {
        return `Nama anggota ${i + 1} harus diisi.`
      }
      if (!members[i].identity_file) {
        return `KTM/Kartu Pelajar anggota ${i + 1} harus diupload.`
      }
    }

    if (!proposalFile) {
      return 'File proposal harus diupload.'
    }

    return null
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      // Upload all files in parallel
      const [
        leaderIdentityUrl,
        proposalUrl,
        ...memberIdentityUrls
      ] = await Promise.all([
        uploadFile(leaderIdentityFile!, 'hackathon/identities'),
        uploadFile(proposalFile!, 'hackathon/proposals'),
        ...members.map((member) =>
          member.identity_file
            ? uploadFile(member.identity_file, 'hackathon/identities')
            : Promise.resolve('')
        ),
      ])

      // Prepare members data for submission
      const membersData = members.map((member, index) => ({
        name: member.name,
        identity_url: memberIdentityUrls[index],
      }))

      // Submit to API
      const response = await fetch('/api/register/hackathon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_name: teamName,
          institution: institution,
          email: email,
          leader_name: leaderName,
          leader_phone: leaderPhone,
          leader_identity_url: leaderIdentityUrl,
          members: membersData,
          proposal_url: proposalUrl,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Gagal mendaftar. Silakan coba lagi.')
        setLoading(false)
        return
      }

      setSuccess(true)

      // Redirect to success page
      setTimeout(() => {
        router.push(
          `/success?name=${encodeURIComponent(leaderName)}&team=${encodeURIComponent(teamName)}`
        )
      }, 1500)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('Registration error:', message)
      setError(message || 'Gagal mendaftar. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          background: isDark
            ? 'linear-gradient(180deg, #0f172a 0%, #020617 100%)'
            : 'linear-gradient(180deg, #ffffff 0%, #fff3e0 100%)',
        }}
      >
        <Container maxWidth='sm'>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant='h4' sx={{ fontWeight: 800, mb: 2, color: 'success.main' }}>
                ✅ Pendaftaran Berhasil!
              </Typography>
              <Typography color='text.secondary' sx={{ mb: 3 }}>
                Terima kasih telah mendaftar. Tim Anda sudah terdaftar dalam sistem kami.
              </Typography>
              <CircularProgress />
            </Box>
          </motion.div>
        </Container>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        width: '100%',
        py: 8,
        background: isDark
          ? 'linear-gradient(180deg, #0f172a 0%, #020617 100%)'
          : 'linear-gradient(180deg, #ffffff 0%, #fff3e0 100%)',
      }}
    >
      <Container maxWidth='md'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography
              variant='h3'
              sx={{
                fontWeight: 800,
                mb: 2,
                color: isDark ? '#ffffff' : '#1a1a1a',
              }}
            >
              Hackathon
            </Typography>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Daftarkan tim Anda untuk berpartisipasi dalam kompetisi hackathon terbesar tahun ini!
            </Typography>
          </Box>
        </motion.div>

        {/* Guidebook & Template Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card
            sx={{
              mb: 6,
              background: isDark
                ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                : 'linear-gradient(135deg, #fff9e6 0%, #fff3e0 100%)',
              border: `1px solid ${isDark ? '#334155' : '#ffe0b2'}`,
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  mb: expandGuide ? 2 : 0,
                }}
                onClick={() => setExpandGuide(!expandGuide)}
              >
                <Box>
                  <Typography variant='h6' sx={{ fontWeight: 700, mb: 0.5 }}>
                    Guidebook & Template
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Unduh template proposal dan panduan lengkap sebelum mendaftar
                  </Typography>
                </Box>
                <ExpandMoreIcon
                  sx={{
                    transform: expandGuide ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s',
                  }}
                />
              </Box>

              {expandGuide && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      background: isDark
                        ? 'rgba(59, 130, 246, 0.1)'
                        : 'rgba(59, 130, 246, 0.05)',
                      border: `1px solid ${isDark ? '#3b82f6' : '#90caf9'}`,
                    }}
                  >
                    <FileDownloadIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='body1' sx={{ fontWeight: 600, mb: 0.5 }}>
                        Template Proposal & Panduan Lengkap
                      </Typography>
                      <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                        Akses folder Google Drive untuk mengunduh template proposal, guidebook, dan dokumentasi lainnya.
                      </Typography>
                    </Box>
                    <Button
                      variant='contained'
                      color='primary'
                      href={GOOGLE_DRIVE_FOLDER_URL}
                      target='_blank'
                      rel='noopener noreferrer'
                      sx={{ fontWeight: 600, textTransform: 'none' }}
                    >
                      Buka Folder 🔗
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert
              severity='error'
              onClose={() => setError(null)}
              sx={{ mb: 4 }}
            >
              {error}
            </Alert>
          </motion.div>
        )}

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card
            sx={{
              background: isDark ? 'rgba(15, 23, 42, 0.9)' : '#ffffff',
              border: `1px solid ${isDark ? '#334155' : '#e0e0e0'}`,
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                {/* Team Info Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant='h6'
                    sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}
                  >
                    Informasi Tim
                  </Typography>
                  <TextField
                    fullWidth
                    label='Nama Tim'
                    value={teamName}
                    onChange={(e) =>
                      handleTextChange('teamName', e.target.value)
                    }
                    placeholder='Contoh: Code Warriors'
                    sx={{ mb: 2 }}
                    required
                  />
                  <TextField
                    fullWidth
                    label='Asal Instansi / Komunitas'
                    value={institution}
                    onChange={(e) =>
                      handleTextChange('institution', e.target.value)
                    }
                    placeholder='Contoh: Universitas Teknologi'
                    required
                  />
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Leader Info Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant='h6'
                    sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}
                  >
                    Data Ketua Tim
                  </Typography>
                  <TextField
                    fullWidth
                    label='Nama Lengkap Ketua'
                    value={leaderName}
                    onChange={(e) =>
                      handleTextChange('leaderName', e.target.value)
                    }
                    placeholder='Nama lengkap'
                    sx={{ mb: 2 }}
                    required
                  />
                  <TextField
                    fullWidth
                    label='Nomor HP Ketua'
                    value={leaderPhone}
                    onChange={(e) =>
                      handleTextChange('leaderPhone', e.target.value)
                    }
                    placeholder='Contoh: 08XX-XXXX-XXXX'
                    sx={{ mb: 3 }}
                    required
                  />
                  <Box>
                    <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
                      KTM / Kartu Pelajar Ketua (PDF) *
                    </Typography>
                    {leaderIdentityFileName && (
                      <Typography
                        variant='body2'
                        sx={{ color: 'success.main', mb: 1 }}
                      >
                        ✅ File terseleksi: {leaderIdentityFileName}
                      </Typography>
                    )}
                    <input
                      type='file'
                      accept='.pdf'
                      onChange={handleLeaderIdentitySelect}
                      ref={leaderIdentityInputRef}
                      style={{ display: 'none' }}
                    />
                    <Button
                      variant='outlined'
                      onClick={() => leaderIdentityInputRef.current?.click()}
                      sx={{ textTransform: 'none' }}
                    >
                      Pilih File PDF (Maks 5MB)
                    </Button>
                  </Box>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Members Section */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant='h6'
                      sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}
                    >
                      Anggota Tim
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                      Pilih jumlah anggota: {memberCount === 1 ? '1 orang' : '2 orang'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                      {[1, 2].map((count) => (
                        <Button
                          key={count}
                          variant={memberCount === count ? 'contained' : 'outlined'}
                          onClick={() => setMemberCount(count)}
                          sx={{ textTransform: 'none' }}
                        >
                          {count} Anggota
                        </Button>
                      ))}
                    </Box>
                  </Box>

                  {/* Dynamic Member Fields */}
                  {members.map((member, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2.5,
                        mb: 2,
                        borderRadius: 2,
                        background: isDark
                          ? 'rgba(30, 41, 59, 0.5)'
                          : 'rgba(0, 0, 0, 0.02)',
                        border: `1px solid ${isDark ? '#334155' : '#e0e0e0'}`,
                      }}
                    >
                      <Typography
                        variant='subtitle2'
                        sx={{ fontWeight: 600, mb: 2 }}
                      >
                        Anggota {index + 1}
                      </Typography>
                      <TextField
                        fullWidth
                        label={`Nama Lengkap Anggota ${index + 1}`}
                        value={member.name}
                        onChange={(e) =>
                          handleMemberNameChange(index, e.target.value)
                        }
                        placeholder='Nama lengkap'
                        sx={{ mb: 2 }}
                        required
                      />
                      <Box>
                        <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
                          KTM / Kartu Pelajar (PDF) *
                        </Typography>
                        {member.identity_file_name && (
                          <Typography
                            variant='body2'
                            sx={{ color: 'success.main', mb: 1 }}
                          >
                            ✅ File terseleksi: {member.identity_file_name}
                          </Typography>
                        )}
                        <input
                          type='file'
                          accept='.pdf'
                          onChange={(e) =>
                            handleMemberIdentitySelect(index, e)
                          }
                          style={{ display: 'none' }}
                          ref={(ref) => {
                            if (ref) {
                              ;(ref as any)[`member-input-${index}`] = ref
                            }
                          }}
                        />
                        <Button
                          variant='outlined'
                          onClick={() => {
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.accept = '.pdf'
                            input.onchange = (e) => {
                              handleMemberIdentitySelect(index, e as any)
                            }
                            input.click()
                          }}
                          sx={{ textTransform: 'none' }}
                        >
                          Pilih File PDF (Maks 5MB)
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Email & Proposal Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant='h6'
                    sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}
                  >
                    Email & Proposal
                  </Typography>
                  <TextField
                    fullWidth
                    type='email'
                    label='Email'
                    value={email}
                    onChange={(e) =>
                      handleTextChange('email', e.target.value)
                    }
                    placeholder='email@example.com'
                    sx={{ mb: 3 }}
                    required
                  />
                  <Box>
                    <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
                      File Proposal (.pdf) *
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                      Gunakan template dari folder Google Drive yang tersedia di atas
                    </Typography>
                    {proposalFileName && (
                      <Typography
                        variant='body2'
                        sx={{ color: 'success.main', mb: 1 }}
                      >
                        ✅ File terseleksi: {proposalFileName}
                      </Typography>
                    )}
                    <input
                      type='file'
                      accept='.pdf'
                      onChange={handleProposalSelect}
                      ref={proposalInputRef}
                      style={{ display: 'none' }}
                    />
                    <Button
                      variant='outlined'
                      onClick={() => proposalInputRef.current?.click()}
                      sx={{ textTransform: 'none' }}
                    >
                      Pilih File PDF (Maks 10MB)
                    </Button>
                  </Box>
                </Box>

                {/* Submit Button */}
                <Box sx={{ mt: 5, display: 'flex', gap: 2 }}>
                  <Button
                    type='submit'
                    variant='contained'
                    size='large'
                    disabled={loading}
                    sx={{
                      fontWeight: 700,
                      textTransform: 'none',
                      py: 1.5,
                      flex: 1,
                    }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Memproses...
                      </>
                    ) : (
                      '✅ Daftar Tim Sekarang'
                    )}
                  </Button>
                  <Button
                    variant='outlined'
                    size='large'
                    href='/'
                    sx={{
                      fontWeight: 700,
                      textTransform: 'none',
                      py: 1.5,
                    }}
                  >
                    Batal
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Alert
            severity='info'
            sx={{ mt: 4, borderRadius: 2 }}
            icon={<Typography sx={{ fontSize: 20 }}>ℹ️</Typography>}
          >
            <Typography variant='body2'>
              <strong>Catatan Penting:</strong> Pastikan semua dokumen dalam format PDF dan tidak
              melebihi ukuran maksimal. Tim Anda akan diverifikasi oleh panitia.
            </Typography>
          </Alert>
        </motion.div>
      </Container>
    </Box>
  )
}
