'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Link from 'next/link'
import Skeleton from '@mui/material/Skeleton'
import { motion } from 'framer-motion'
import { useTheme } from '@mui/material/styles'
import { getFeaturedPortfolioProjects } from '@/lib/supabase/portfolio'
import { IPortfolioProject } from '@/types/portfolio'

const HomePortfolio = () => {
  const { palette } = useTheme()
  const [featuredProjects, setFeaturedProjects] = useState<IPortfolioProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const featured = await getFeaturedPortfolioProjects(3)
        setFeaturedProjects(featured)
      } catch (error) {
        console.error('Error fetching featured projects:', error)
        setFeaturedProjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProjects()
  }, [])

  return (
    <Box
      component="section"
      id="home-portfolio"
      sx={{
        width: '100%',
        py: { xs: 8, md: 14 },
        position: 'relative',
        background:
          palette.mode === 'dark'
            ? 'linear-gradient(180deg, #1a0010 0%, #2d0017 100%)'
            : 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)',
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                letterSpacing: 2,
                mb: 2,
                display: 'block',
              }}
            >
              Portfolio
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2rem', md: '2.5rem' },
                mb: 2,
              }}
            >
              Project Karya Anggota
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Lihat hasil karya dan project yang telah diselesaikan oleh anggota komunitas kami
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={3}>
          {loading ? (
            // Loading Skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Box sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                  <Skeleton variant="rectangular" height={200} />
                  <Box sx={{ p: 3 }}>
                    <Skeleton variant="text" height={32} width="80%" />
                    <Skeleton variant="text" height={20} width="100%" sx={{ mt: 1 }} />
                    <Skeleton variant="text" height={20} width="90%" />
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 2 }}>
                      <Skeleton variant="rounded" width={60} height={24} />
                      <Skeleton variant="rounded" width={70} height={24} />
                      <Skeleton variant="rounded" width={65} height={24} />
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))
          ) : featuredProjects.length > 0 ? (
            featuredProjects.map((project, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={project.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Box
                  component={Link}
                  href={`/portfolio/${project.slug}`}
                  sx={{
                    display: 'block',
                    textDecoration: 'none',
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    background:
                      palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'rgba(255, 255, 255, 0.9)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(152, 15, 90, 0.2)',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      height: 200,
                      background: `linear-gradient(135deg, ${palette.primary.main}40 0%, ${palette.secondary.main}40 100%)`,
                      overflow: 'hidden',
                    }}
                  >
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '3rem',
                        }}
                      >
                        📱
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {project.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {project.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {project.techStack?.slice(0, 3).map((tech) => (
                        <Box
                          key={tech}
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background:
                              palette.mode === 'dark'
                                ? 'rgba(152, 15, 90, 0.2)'
                                : 'rgba(152, 15, 90, 0.1)',
                            color: 'primary.main',
                          }}
                        >
                          {tech}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          ))
          ) : (
            // Empty State
            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Belum ada portfolio featured
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Project akan segera ditampilkan di sini
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              component={Link}
              href="/portfolio"
              variant="outlined"
              size="large"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 700,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Lihat Semua Portfolio
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  )
}

export default HomePortfolio
