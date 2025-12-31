import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getJobBySlug, getActiveJobs } from '@/lib/supabase/career'
import { AppConfig } from '@/configs'
import { IJobPosting } from '@/types/career'
import JobDetailContent from './_components/job-detail-content'

type Props = {
  params: Promise<{ slug: string }>
}

async function getJob(slug: string): Promise<IJobPosting | null> {
  try {
    return await getJobBySlug(slug)
  } catch (error) {
    console.error('Error fetching job:', error)
    return null
  }
}

async function getAllJobs(): Promise<IJobPosting[]> {
  try {
    return await getActiveJobs()
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const job = await getJob(slug)

  if (!job) {
    return {
      title: 'Lowongan Tidak Ditemukan',
    }
  }

  return {
    title: `${job.title} - ${job.company}`,
    description: job.description,
    keywords: [job.title, job.company, job.location, ...job.skills],
    openGraph: {
      title: `${job.title} - ${job.company} | ${AppConfig.appName}`,
      description: job.description,
      url: `${AppConfig.siteUrl}/career/${job.slug}`,
      siteName: AppConfig.appName,
      locale: 'id_ID',
      type: 'website',
    },
  }
}

export async function generateStaticParams() {
  const jobs = await getAllJobs()
  return jobs.map((job) => ({
    slug: job.slug,
  }))
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params
  const job = await getJob(slug)

  if (!job) {
    notFound()
  }

  return <JobDetailContent job={job} />
}
