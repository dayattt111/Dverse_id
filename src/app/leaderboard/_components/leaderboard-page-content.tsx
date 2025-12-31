'use client'

import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import { motion } from 'framer-motion'
import { useTheme } from '@mui/material/styles'
import { getLeaderboard } from '@/lib/supabase/leaderboard'
import { ILeaderboardUser } from '@/types/app'

const getLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'expert':
      return '#f59e0b'
    case 'intermediate':
      return '#3b82f6'
    case 'beginner':
      return '#10b981'
    default:
      return '#6b7280'
  }
}

const getRankMedalEmoji = (rank: number) => {
  switch (rank) {
    case 1:
      return '🥇'
    case 2:
      return '🥈'
    case 3:
      return '🥉'
    default:
      return ''
  }
}

export default function LeaderboardPageContent() {
  const { palette } = useTheme()
  const [users, setUsers] = useState<ILeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard()
        setUsers(data)
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: { xs: 10, md: 12 },
        pb: 8,
        background:
          palette.mode === 'dark'
            ? 'radial-gradient(circle at top right, rgba(152, 15, 90, 0.15), transparent 50%), radial-gradient(circle at bottom left, rgba(76, 0, 39, 0.15), transparent 50%)'
            : 'radial-gradient(circle at top right, rgba(152, 15, 90, 0.05), transparent 50%), radial-gradient(circle at bottom left, rgba(76, 0, 39, 0.05), transparent 50%)',
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                mb: 2,
                background: 'linear-gradient(135deg, #980f5a 0%, #4c0027 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              🏆 Leaderboard
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 700, mx: 'auto', fontSize: { xs: '1rem', md: '1.1rem' } }}
            >
              Daftar kontributor terbaik berdasarkan poin, level, dan pencapaian mereka
            </Typography>
          </Box>
        </motion.div>

        {loading ? (
          <Box>
            {[1, 2, 3, 4, 5].map((item) => (
              <Skeleton
                key={item}
                variant="rounded"
                height={100}
                sx={{ mb: 2, borderRadius: 3 }}
              />
            ))}
          </Box>
        ) : users.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                px: 3,
                borderRadius: 3,
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
              }}
            >
              <Typography variant="h4" sx={{ mb: 1, fontSize: '2.5rem' }}>
                🏆
              </Typography>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                Belum ada data leaderboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tambahkan data leaderboard melalui admin panel
              </Typography>
            </Box>
          </motion.div>
        ) : (
          <Box>
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, md: 3 },
                    mb: 2,
                    borderRadius: 3,
                    border: '2px solid',
                    borderColor: user.rank <= 3 ? 'primary.main' : 'divider',
                    background:
                      user.rank <= 3
                        ? palette.mode === 'dark'
                          ? 'linear-gradient(135deg, rgba(152, 15, 90, 0.1) 0%, rgba(76, 0, 39, 0.05) 100%)'
                          : 'linear-gradient(135deg, rgba(152, 15, 90, 0.05) 0%, rgba(76, 0, 39, 0.02) 100%)'
                        : palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(8px)',
                      boxShadow: user.rank <= 3 ? '0 8px 24px rgba(152, 15, 90, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 3 } }}>
                    {/* Rank */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: { xs: 50, md: 60 },
                        height: { xs: 50, md: 60 },
                        borderRadius: 2,
                        background:
                          user.rank <= 3
                            ? 'linear-gradient(135deg, #980f5a 0%, #4c0027 100%)'
                            : palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.05)',
                        flexShrink: 0,
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 900,
                          color: user.rank <= 3 ? 'white' : 'text.primary',
                          fontSize: { xs: '1.25rem', md: '1.5rem' },
                        }}
                      >
                        {getRankMedalEmoji(user.rank) || `#${user.rank}`}
                      </Typography>
                    </Box>

                    {/* Avatar */}
                    <Avatar
                      src={user.avatar}
                      alt={user.name}
                      sx={{
                        width: { xs: 56, md: 64 },
                        height: { xs: 56, md: 64 },
                        border: '2px solid',
                        borderColor: user.rank <= 3 ? 'primary.main' : 'divider',
                        flexShrink: 0,
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>

                    {/* User Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          mb: 0.5,
                          fontSize: { xs: '1rem', md: '1.25rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {user.name}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={user.level}
                          size="small"
                          sx={{
                            bgcolor: getLevelColor(user.level),
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        />
                        {user.projectsCompleted !== undefined && user.projectsCompleted > 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            {user.projectsCompleted} Projects
                          </Typography>
                        )}
                        {user.achievements !== undefined && user.achievements > 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            🎖️ {user.achievements} Achievements
                          </Typography>
                        )}
                      </Box>
                      {user.badges && user.badges.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                          {user.badges.slice(0, 5).map((badge, i) => (
                            <Typography key={i} sx={{ fontSize: '1.25rem' }}>
                              {badge}
                            </Typography>
                          ))}
                          {user.badges.length > 5 && (
                            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                              +{user.badges.length - 5}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>

                    {/* Points */}
                    <Box
                      sx={{
                        textAlign: 'right',
                        flexShrink: 0,
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 900,
                          color: user.rank <= 3 ? 'primary.main' : 'text.primary',
                          fontSize: { xs: '1.25rem', md: '1.75rem' },
                        }}
                      >
                        {user.points.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Points
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  )
}
