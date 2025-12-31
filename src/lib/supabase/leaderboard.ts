import { supabase } from './config'

export interface ILeaderboardUser {
  id: string
  rank: number
  name: string
  points: number
  level: string
  avatar?: string
  badges?: string[]
  achievements?: number
  projectsCompleted?: number
  createdAt?: string
  updatedAt?: string
}

// Transform from snake_case (database) to camelCase (app)
function transformLeaderboardFromDB(dbUser: any): ILeaderboardUser {
  return {
    id: dbUser.id,
    rank: dbUser.rank,
    name: dbUser.name,
    points: dbUser.points,
    level: dbUser.level,
    avatar: dbUser.avatar,
    badges: dbUser.badges || [],
    achievements: dbUser.achievements,
    projectsCompleted: dbUser.projects_completed,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
  }
}

// Transform from camelCase (app) to snake_case (database)
function transformLeaderboardToDB(user: Partial<ILeaderboardUser>): any {
  const dbUser: any = {}
  
  if (user.rank !== undefined) dbUser.rank = user.rank
  if (user.name !== undefined) dbUser.name = user.name
  if (user.points !== undefined) dbUser.points = user.points
  if (user.level !== undefined) dbUser.level = user.level
  if (user.avatar !== undefined) dbUser.avatar = user.avatar
  if (user.badges !== undefined) dbUser.badges = user.badges
  if (user.achievements !== undefined) dbUser.achievements = user.achievements
  if (user.projectsCompleted !== undefined) dbUser.projects_completed = user.projectsCompleted
  
  return dbUser
}

/**
 * Get leaderboard users (top performers)
 */
export async function getLeaderboard(limit: number = 10): Promise<ILeaderboardUser[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('points', { ascending: false })
    .order('rank', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }

  return data ? data.map(transformLeaderboardFromDB) : []
}

/**
 * Add a leaderboard entry
 */
export async function addLeaderboardEntry(user: Omit<ILeaderboardUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<ILeaderboardUser | null> {
  const dbUser = transformLeaderboardToDB(user)

  const { data, error } = await supabase
    .from('leaderboard')
    .insert(dbUser)
    .select()
    .single()

  if (error) {
    console.error('Error adding leaderboard entry:', error)
    throw error
  }

  return data ? transformLeaderboardFromDB(data) : null
}

/**
 * Update a leaderboard entry
 */
export async function updateLeaderboardEntry(id: string, updates: Partial<ILeaderboardUser>): Promise<ILeaderboardUser | null> {
  const dbUpdates = transformLeaderboardToDB(updates)

  const { data, error } = await supabase
    .from('leaderboard')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating leaderboard entry:', error)
    throw error
  }

  return data ? transformLeaderboardFromDB(data) : null
}

/**
 * Delete a leaderboard entry
 */
export async function deleteLeaderboardEntry(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('leaderboard')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting leaderboard entry:', error)
    throw error
  }

  return true
}
