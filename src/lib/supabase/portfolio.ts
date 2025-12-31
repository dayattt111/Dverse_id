import { supabase } from './config'
import { IPortfolioProject } from '@/types/portfolio'

/**
 * Get all portfolio projects
 */
export async function getPortfolioProjects() {
  const { data, error } = await supabase
    .from('portfolio')
    .select('*')
    .order('id', { ascending: false })

  if (error) {
    console.error('Error fetching portfolio:', error)
    return []
  }

  return (data || []).map(transformPortfolioFromDB)
}

/**
 * Get featured portfolio projects
 */
export async function getFeaturedPortfolioProjects(limit = 3) {
  const { data, error } = await supabase
    .from('portfolio')
    .select('*')
    .eq('featured', true)
    .order('id', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching featured portfolio:', error)
    return []
  }

  return (data || []).map(transformPortfolioFromDB)
}

/**
 * Get portfolio project by slug
 */
export async function getPortfolioBySlug(slug: string) {
  const { data, error } = await supabase
    .from('portfolio')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching portfolio by slug:', error)
    return null
  }

  return data ? transformPortfolioFromDB(data) : null
}

/**
 * Add new portfolio project
 */
export async function addPortfolioProject(project: Omit<IPortfolioProject, 'id'>) {
  const dbData = transformPortfolioToDB(project)
  
  const { data, error } = await supabase
    .from('portfolio')
    .insert([dbData])
    .select()
    .single()

  if (error) {
    console.error('Error adding portfolio:', error)
    throw error
  }

  return transformPortfolioFromDB(data)
}

/**
 * Update portfolio project
 */
export async function updatePortfolioProject(id: number, project: Partial<IPortfolioProject>) {
  const dbData = transformPortfolioToDB(project)
  
  const { data, error } = await supabase
    .from('portfolio')
    .update(dbData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating portfolio:', error)
    throw error
  }

  return transformPortfolioFromDB(data)
}

/**
 * Delete portfolio project
 */
export async function deletePortfolioProject(id: number) {
  const { error } = await supabase
    .from('portfolio')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting portfolio:', error)
    throw error
  }
}

/**
 * Transform database row to IPortfolioProject
 */
function transformPortfolioFromDB(data: any): IPortfolioProject {
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    description: data.description,
    image: data.image,
    category: data.category,
    techStack: data.tech_stack || [],
    creator: data.creator || { name: '' },
    links: data.links || {},
    tags: data.tags || [],
    completedDate: data.completed_date,
    programSource: data.program_source,
    featured: data.featured || false,
  }
}

/**
 * Transform IPortfolioProject to database format
 */
function transformPortfolioToDB(project: Partial<IPortfolioProject>) {
  const dbData: any = {}
  
  if (project.title !== undefined) dbData.title = project.title
  if (project.slug !== undefined) dbData.slug = project.slug
  if (project.description !== undefined) dbData.description = project.description
  if (project.image !== undefined) dbData.image = project.image
  if (project.category !== undefined) dbData.category = project.category
  if (project.techStack !== undefined) dbData.tech_stack = project.techStack
  if (project.creator !== undefined) dbData.creator = project.creator
  if (project.links !== undefined) dbData.links = project.links
  if (project.tags !== undefined) dbData.tags = project.tags
  if (project.completedDate !== undefined) dbData.completed_date = project.completedDate
  if (project.programSource !== undefined) dbData.program_source = project.programSource
  if (project.featured !== undefined) dbData.featured = project.featured
  
  return dbData
}
