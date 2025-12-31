import { supabase } from './config'
import type { ICommunityProgram } from '@/types/community'

// Transform from snake_case (database) to camelCase (app)
function transformProgramFromDB(dbProgram: any): ICommunityProgram {
  return {
    id: dbProgram.id,
    title: dbProgram.title,
    slug: dbProgram.slug,
    description: dbProgram.description,
    icon: dbProgram.icon,
    image: dbProgram.image,
    status: dbProgram.status,
    participants: dbProgram.participants,
    startDate: dbProgram.start_date,
    endDate: dbProgram.end_date,
    registrationDeadline: dbProgram.registration_deadline,
    category: dbProgram.category,
  }
}

// Transform from camelCase (app) to snake_case (database)
function transformProgramToDB(program: Partial<ICommunityProgram>): any {
  const dbProgram: any = {}
  
  if (program.title !== undefined) dbProgram.title = program.title
  if (program.slug !== undefined) dbProgram.slug = program.slug
  if (program.description !== undefined) dbProgram.description = program.description
  if (program.icon !== undefined) dbProgram.icon = program.icon
  if (program.image !== undefined) dbProgram.image = program.image
  if (program.status !== undefined) dbProgram.status = program.status
  if (program.participants !== undefined) dbProgram.participants = program.participants
  if (program.startDate !== undefined) dbProgram.start_date = program.startDate
  if (program.endDate !== undefined) dbProgram.end_date = program.endDate
  if (program.registrationDeadline !== undefined) dbProgram.registration_deadline = program.registrationDeadline
  if (program.category !== undefined) dbProgram.category = program.category
  
  return dbProgram
}

/**
 * Get all programs
 */
export async function getPrograms(): Promise<ICommunityProgram[]> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching programs:', error)
    throw error
  }

  return data ? data.map(transformProgramFromDB) : []
}

/**
 * Get featured programs for homepage
 */
export async function getFeaturedPrograms(limit: number = 3): Promise<ICommunityProgram[]> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching featured programs:', error)
    throw error
  }

  return data ? data.map(transformProgramFromDB) : []
}

/**
 * Get program by slug
 */
export async function getProgramBySlug(slug: string): Promise<ICommunityProgram | null> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching program by slug:', error)
    return null
  }

  return data ? transformProgramFromDB(data) : null
}

/**
 * Add a new program
 */
export async function addProgram(program: Partial<ICommunityProgram>): Promise<ICommunityProgram | null> {
  const dbProgram = transformProgramToDB(program)

  const { data, error } = await supabase
    .from('programs')
    .insert(dbProgram)
    .select()
    .single()

  if (error) {
    console.error('Error adding program:', error)
    throw error
  }

  return data ? transformProgramFromDB(data) : null
}

/**
 * Update an existing program
 */
export async function updateProgram(id: string | number, updates: Partial<ICommunityProgram>): Promise<ICommunityProgram | null> {
  const dbUpdates = transformProgramToDB(updates)

  const { data, error } = await supabase
    .from('programs')
    .update(dbUpdates)
    .eq('id', String(id))
    .select()
    .single()

  if (error) {
    console.error('Error updating program:', error)
    throw error
  }

  return data ? transformProgramFromDB(data) : null
}

/**
 * Delete a program
 */
export async function deleteProgram(id: string | number): Promise<boolean> {
  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', String(id))

  if (error) {
    console.error('Error deleting program:', error)
    throw error
  }

  return true
}
