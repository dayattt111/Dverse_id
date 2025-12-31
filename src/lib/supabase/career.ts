import { supabase } from './config'
import { IJobPosting } from '@/types/career'

/**
 * Get all active job postings
 */
export async function getActiveJobs() {
  const { data, error } = await supabase
    .from('career')
    .select('*')
    .eq('status', 'active')
    .order('id', { ascending: false })

  if (error) {
    console.error('Error fetching jobs:', error)
    return []
  }

  return (data || []).map(transformJobFromDB)
}

/**
 * Get featured job postings
 */
export async function getFeaturedJobs(limit = 3) {
  const { data, error } = await supabase
    .from('career')
    .select('*')
    .eq('featured', true)
    .eq('status', 'active')
    .order('id', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching featured jobs:', error)
    return []
  }

  return (data || []).map(transformJobFromDB)
}

/**
 * Get job by slug
 */
export async function getJobBySlug(slug: string) {
  const { data, error} = await supabase
    .from('career')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching job by slug:', error)
    return null
  }

  return data ? transformJobFromDB(data) : null
}

/**
 * Add new job posting
 */
export async function addJob(job: Omit<IJobPosting, 'id'>) {
  const dbData = transformJobToDB(job)
  
  const { data, error } = await supabase
    .from('career')
    .insert([dbData])
    .select()
    .single()

  if (error) {
    console.error('Error adding job:', error)
    throw error
  }

  return transformJobFromDB(data)
}

/**
 * Update job posting
 */
export async function updateJob(id: number, job: Partial<IJobPosting>) {
  const dbData = transformJobToDB(job)
  
  const { data, error } = await supabase
    .from('career')
    .update(dbData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating job:', error)
    throw error
  }

  return transformJobFromDB(data)
}

/**
 * Delete job posting
 */
export async function deleteJob(id: number) {
  const { error } = await supabase
    .from('career')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting job:', error)
    throw error
  }
}

/**
 * Transform database row to IJobPosting
 */
function transformJobFromDB(data: any): IJobPosting {
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    company: data.company,
    companyLogo: data.company_logo,
    location: data.location,
    workType: data.work_type,
    employmentType: data.employment_type,
    description: data.description,
    requirements: data.requirements || [],
    responsibilities: data.responsibilities || [],
    salaryRange: data.salary_range,
    benefits: data.benefits || [],
    skills: data.skills || [],
    experience: data.experience,
    postedDate: data.posted_date,
    deadlineDate: data.deadline_date,
    applyUrl: data.apply_url,
    contactEmail: data.contact_email,
    status: data.status,
    featured: data.featured || false,
  }
}

/**
 * Transform IJobPosting to database format
 */
function transformJobToDB(job: Partial<IJobPosting>) {
  const dbData: any = {}
  
  if (job.title !== undefined) dbData.title = job.title
  if (job.slug !== undefined) dbData.slug = job.slug
  if (job.company !== undefined) dbData.company = job.company
  if (job.companyLogo !== undefined) dbData.company_logo = job.companyLogo
  if (job.location !== undefined) dbData.location = job.location
  if (job.workType !== undefined) dbData.work_type = job.workType
  if (job.employmentType !== undefined) dbData.employment_type = job.employmentType
  if (job.description !== undefined) dbData.description = job.description
  if (job.requirements !== undefined) dbData.requirements = job.requirements
  if (job.responsibilities !== undefined) dbData.responsibilities = job.responsibilities
  if (job.salaryRange !== undefined) dbData.salary_range = job.salaryRange
  if (job.benefits !== undefined) dbData.benefits = job.benefits
  if (job.skills !== undefined) dbData.skills = job.skills
  if (job.experience !== undefined) dbData.experience = job.experience
  if (job.postedDate !== undefined) dbData.posted_date = job.postedDate
  if (job.deadlineDate !== undefined) dbData.deadline_date = job.deadlineDate
  if (job.applyUrl !== undefined) dbData.apply_url = job.applyUrl
  if (job.contactEmail !== undefined) dbData.contact_email = job.contactEmail
  if (job.status !== undefined) dbData.status = job.status
  if (job.featured !== undefined) dbData.featured = job.featured
  
  return dbData
}
