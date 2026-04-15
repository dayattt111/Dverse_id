/**
 * Hackathon Registration Types
 */

export interface IHackathonMember {
  name: string
  identity_url: string  // PDF file URL from Supabase Storage
}

export interface IHackathonParticipant {
  id: number
  team_name: string
  institution: string
  email: string
  leader_name: string
  leader_phone: string
  leader_identity_url: string  // PDF file URL
  members: IHackathonMember[]  // 1-2 members
  proposal_url: string  // PDF file URL
  status: 'pending' | 'verified' | 'rejected'
  notes?: string
  created_at: string
  updated_at: string
}

export interface IHackathonRegistrationInput {
  team_name: string
  institution: string
  email: string
  leader_name: string
  leader_phone: string
  leader_identity_file?: File
  members: {
    name: string
    identity_file?: File
  }[]
  proposal_file?: File
}
