/**
 * Event Package Types
 */

export interface IEventPackage {
  id: number
  eventId: number
  name: string
  code: string
  price: number
  discountedPrice?: number
  items: string[]
  image?: string
  description?: string
  isBundle: boolean
  sortOrder: number
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface IEarlyBirdConfig {
  enabled: boolean
  maxCount: number
  discountPercent: number
  eventId: number
}
