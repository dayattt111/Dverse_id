/**
 * Event Types
 */

export interface IEvent {
  id: number
  name: string
  slug: string
  description?: string
  eventDate?: string
  location?: string
  imageUrl?: string
  status: 'draft' | 'published' | 'archived'
  maxParticipants?: number
  createdAt?: string
  updatedAt?: string
}
