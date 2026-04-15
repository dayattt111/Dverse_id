import { supabase } from './config'
import type { IHackathonParticipant, IHackathonMember } from '@/types/hackathon'

/**
 * Register a new hackathon team
 */
export async function registerHackathonTeam(data: {
  team_name: string
  institution: string
  email: string
  leader_name: string
  leader_phone: string
  leader_identity_url: string
  members: IHackathonMember[]
  proposal_url: string
}): Promise<IHackathonParticipant> {
  const { data: result, error } = await supabase
    .from('hackathon_participants')
    .insert([
      {
        team_name: data.team_name,
        institution: data.institution,
        email: data.email,
        leader_name: data.leader_name,
        leader_phone: data.leader_phone,
        leader_identity_url: data.leader_identity_url,
        members: data.members,
        proposal_url: data.proposal_url,
        status: 'pending',
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error registering hackathon team:', error)
    throw error
  }

  return result as IHackathonParticipant
}

/**
 * Check if a team with the given email already exists
 */
export async function checkExistingHackathonRegistration(
  email: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('hackathon_participants')
    .select('id')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('Error checking existing registration:', error)
    throw error
  }

  return !!data
}

/**
 * Check if a team with the given team_name already exists
 */
export async function checkExistingTeamName(
  teamName: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('hackathon_participants')
    .select('id')
    .eq('team_name', teamName)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('Error checking existing team name:', error)
    throw error
  }

  return !!data
}

/**
 * Get total number of hackathon registrations
 */
export async function getHackathonRegistrationCount(): Promise<number> {
  const { count, error } = await supabase
    .from('hackathon_participants')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error getting registration count:', error)
    throw error
  }

  return count || 0
}

/**
 * Get all hackathon registrations (admin only via RLS)
 */
export async function getAllHackathonRegistrations(): Promise<
  IHackathonParticipant[]
> {
  const { data, error } = await supabase
    .from('hackathon_participants')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching hackathon registrations:', error)
    throw error
  }

  return (data || []) as IHackathonParticipant[]
}

/**
 * Get hackathon registration by ID
 */
export async function getHackathonRegistrationById(
  id: number
): Promise<IHackathonParticipant | null> {
  const { data, error } = await supabase
    .from('hackathon_participants')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching hackathon registration:', error)
    throw error
  }

  return (data as IHackathonParticipant) || null
}

/**
 * Update hackathon registration status (admin only)
 */
export async function updateHackathonRegistrationStatus(
  id: number,
  status: 'pending' | 'verified' | 'rejected',
  notes?: string
): Promise<IHackathonParticipant | null> {
  const { data, error } = await supabase
    .from('hackathon_participants')
    .update({
      status,
      ...(notes && { notes }),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating hackathon registration status:', error)
    throw error
  }

  return (data as IHackathonParticipant) || null
}

/**
 * Get hackathon registrations by status
 */
export async function getHackathonRegistrationsByStatus(
  status: 'pending' | 'verified' | 'rejected'
): Promise<IHackathonParticipant[]> {
  const { data, error } = await supabase
    .from('hackathon_participants')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(
      'Error fetching hackathon registrations by status:',
      error
    )
    throw error
  }

  return (data || []) as IHackathonParticipant[]
}
