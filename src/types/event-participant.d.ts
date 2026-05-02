/**
 * Event Participant Types
 */

export interface IEventParticipant {
  id?: number
  eventId: number
  packageId?: number
  name: string
  email: string
  phone: string
  institution: string
  registrationType?: 'individual' | 'team'
  teamMemberName?: string
  teamMemberEmail?: string
  teamMemberPhone?: string
  teamMemberInstitution?: string
  teamMemberPicKtm?: string
  picKtm?: string
  picPayment?: string
  picFollow?: string
  status?: 'pending' | 'verified' | 'rejected'
  createdAt?: string
  updatedAt?: string
}
