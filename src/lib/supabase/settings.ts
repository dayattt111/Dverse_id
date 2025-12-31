import { supabase } from './config'
import type { ICommunityStats } from '@/types/community'

// Transform from snake_case (database) to camelCase (app)
function transformStatsFromDB(dbStats: any): ICommunityStats {
  return {
    id: dbStats.id,
    totalMembers: dbStats.total_members,
    activeProjects: dbStats.active_projects,
    successRate: dbStats.success_rate,
    yearsExperience: dbStats.years_experience,
    createdAt: dbStats.created_at,
    updatedAt: dbStats.updated_at,
  }
}

// Transform from camelCase (app) to snake_case (database)
function transformStatsToDB(stats: Partial<ICommunityStats>): any {
  const dbStats: any = {}
  
  if (stats.totalMembers !== undefined) dbStats.total_members = stats.totalMembers
  if (stats.activeProjects !== undefined) dbStats.active_projects = stats.activeProjects
  if (stats.successRate !== undefined) dbStats.success_rate = stats.successRate
  if (stats.yearsExperience !== undefined) dbStats.years_experience = stats.yearsExperience
  
  return dbStats
}

/**
 * Get community stats (usually only one record)
 */
export async function getCommunityStats(): Promise<ICommunityStats | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching community stats:', error)
    return null
  }

  return data ? transformStatsFromDB(data) : null
}

/**
 * Update community stats
 */
export async function updateCommunityStats(
  id: string,
  updates: Partial<ICommunityStats>
): Promise<ICommunityStats | null> {
  const dbUpdates = transformStatsToDB(updates)

  const { data, error } = await supabase
    .from('settings')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating community stats:', error)
    throw error
  }

  return data ? transformStatsFromDB(data) : null
}

/**
 * Initialize community stats if not exists
 */
export async function initializeCommunityStats(): Promise<ICommunityStats | null> {
  const defaultStats = {
    total_members: 100,
    active_projects: 50,
    success_rate: 95,
    years_experience: 5,
  }

  const { data, error } = await supabase
    .from('settings')
    .insert(defaultStats)
    .select()
    .single()

  if (error) {
    console.error('Error initializing community stats:', error)
    throw error
  }

  return data ? transformStatsFromDB(data) : null
}
