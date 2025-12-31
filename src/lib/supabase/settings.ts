import { supabase } from './config'
import type { ICommunityStats } from '@/types/community'

/**
 * Get community stats (stored in settings table as JSONB)
 */
export async function getCommunityStats(): Promise<ICommunityStats | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 'community_stats')
    .single()

  if (error) {
    console.error('Error fetching community stats:', error)
    return null
  }

  if (!data) return null

  // Data is stored in the 'data' JSONB column
  const stats = data.data as any
  
  return {
    id: data.id,
    totalMembers: stats.totalMembers || 0,
    activeProjects: stats.activeProjects || 0,
    successRate: stats.successRate || 0,
    yearsExperience: stats.yearsExperience || 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

/**
 * Update community stats
 */
export async function updateCommunityStats(
  updates: Partial<ICommunityStats>
): Promise<ICommunityStats | null> {
  // First get current data
  const current = await getCommunityStats()
  
  if (!current) {
    // Initialize if doesn't exist
    return initializeCommunityStats(updates)
  }

  // Merge updates with current data
  const updatedData = {
    totalMembers: updates.totalMembers ?? current.totalMembers,
    activeProjects: updates.activeProjects ?? current.activeProjects,
    successRate: updates.successRate ?? current.successRate,
    yearsExperience: updates.yearsExperience ?? current.yearsExperience,
  }

  const { data, error } = await supabase
    .from('settings')
    .update({ data: updatedData })
    .eq('id', 'community_stats')
    .select()
    .single()

  if (error) {
    console.error('Error updating community stats:', error)
    throw error
  }

  if (!data) return null

  const stats = data.data as any
  
  return {
    id: data.id,
    totalMembers: stats.totalMembers || 0,
    activeProjects: stats.activeProjects || 0,
    successRate: stats.successRate || 0,
    yearsExperience: stats.yearsExperience || 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

/**
 * Initialize community stats if not exists
 */
export async function initializeCommunityStats(
  initialData?: Partial<ICommunityStats>
): Promise<ICommunityStats | null> {
  const defaultStats = {
    totalMembers: initialData?.totalMembers ?? 100,
    activeProjects: initialData?.activeProjects ?? 50,
    successRate: initialData?.successRate ?? 95,
    yearsExperience: initialData?.yearsExperience ?? 5,
  }

  const { data, error } = await supabase
    .from('settings')
    .upsert({
      id: 'community_stats',
      data: defaultStats,
    })
    .select()
    .single()

  if (error) {
    console.error('Error initializing community stats:', error)
    throw error
  }

  if (!data) return null

  const stats = data.data as any
  
  return {
    id: data.id,
    totalMembers: stats.totalMembers || 0,
    activeProjects: stats.activeProjects || 0,
    successRate: stats.successRate || 0,
    yearsExperience: stats.yearsExperience || 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}
