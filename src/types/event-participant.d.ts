/**
 * Event Participant Types
 */

export interface IEventParticipant {
  id?: number
  eventId: number
  name: string
  email: string
  phone: string
  institution: string
  picPayment?: string
  picFollow?: string
  status?: 'pending' | 'verified' | 'rejected'
  createdAt?: string
  updatedAt?: string
}
