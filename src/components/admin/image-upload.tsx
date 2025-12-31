'use client'

import React, { useState, useRef } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/lib/firebase/config'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  folder?: string
  maxSize?: number // in MB
  label?: string
  helperText?: string
}

const ImageUpload = ({
  value,
  onChange,
  folder = 'images',
  maxSize = 5,
  label = 'Upload Image',
  helperText = 'Maksimal 5MB (JPG, PNG, GIF)',
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Format file tidak valid. Gunakan JPG, PNG, GIF, atau WebP')
      return
    }

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setError(`Ukuran file terlalu besar. Maksimal ${maxSize}MB`)
      return
    }

    setError(null)
    setUploading(true)
    setProgress(0)

    try {
      // Create unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const storageRef = ref(storage, `${folder}/${filename}`)

      console.log('Uploading to:', `${folder}/${filename}`)

      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setProgress(prog)
          console.log('Upload progress:', prog)
        },
        (error) => {
          console.error('Upload error:', error)
          setError(`Gagal upload gambar: ${error.message}`)
          setUploading(false)
        },
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            console.log('Download URL:', downloadURL)
            onChange(downloadURL)
            setUploading(false)
            setProgress(0)
          } catch (error: any) {
            console.error('Error getting download URL:', error)
            setError(`Gagal mendapatkan URL: ${error.message}`)
            setUploading(false)
          }
        }
      )
    } catch (error: any) {
      console.error('Upload error:', error)
      setError(`Gagal upload gambar: ${error.message}`)
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!value) return

    try {
      // Delete from storage if it's a Firebase Storage URL
      if (value.includes('firebasestorage.googleapis.com')) {
        const storageRef = ref(storage, value)
        await deleteObject(storageRef)
      }
      onChange('')
    } catch (error) {
      console.error('Delete error:', error)
      // Still clear the value even if delete fails
      onChange('')
    }
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom fontWeight={600}>
        {label}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          position: 'relative',
          backgroundColor: 'background.default',
        }}
      >
        {value ? (
          // Preview
          <Box>
            <Box
              sx={{
                width: '100%',
                maxWidth: 400,
                height: 200,
                mx: 'auto',
                mb: 2,
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                backgroundImage: `url(${value})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                Ganti Gambar
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleRemove}
                disabled={uploading}
              >
                🗑️ Hapus
              </Button>
            </Box>
          </Box>
        ) : uploading ? (
          // Uploading
          <Box>
            <CircularProgress
              variant="determinate"
              value={progress}
              size={60}
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              Uploading... {Math.round(progress)}%
            </Typography>
          </Box>
        ) : (
          // Upload button
          <Box>
            <Typography
              variant="h1"
              sx={{ fontSize: 48, mb: 2, opacity: 0.3 }}
            >
              📷
            </Typography>
            <Button
              variant="contained"
              onClick={() => fileInputRef.current?.click()}
            >
              Pilih Gambar
            </Button>
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
              {helperText}
            </Typography>
          </Box>
        )}
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </Box>
  )
}

export default ImageUpload
