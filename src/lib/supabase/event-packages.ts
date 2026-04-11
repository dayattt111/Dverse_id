import { supabase } from './config'
import type { IEventPackage, IEarlyBirdConfig } from '@/types/event-package'

/**
 * Get all active packages for an event, ordered by sort_order
 */
export async function getEventPackages(eventId: number): Promise<IEventPackage[]> {
  const { data, error } = await supabase
    .from('event_packages')
    .select('*')
    .eq('event_id', eventId)
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching event packages:', error)
    return []
  }

  return (data || []).map(transformFromDB)
}

/**
 * Get a single package by ID
 */
export async function getPackageById(id: number): Promise<IEventPackage | null> {
  const { data, error } = await supabase
    .from('event_packages')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching package by id:', error)
    return null
  }

  return data ? transformFromDB(data) : null
}

/**
 * Get early bird discount configuration
 */
export async function getEarlyBirdConfig(): Promise<IEarlyBirdConfig | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('data')
    .eq('id', 'early_bird_discount')
    .single()

  if (error) {
    console.error('Error fetching early bird config:', error)
    return null
  }

  if (!data?.data) return null

  const config = data.data as Record<string, unknown>
  return {
    enabled: !!config.enabled,
    maxCount: (config.maxCount as number) || 10,
    discountPercent: (config.discountPercent as number) || 10,
    eventId: (config.eventId as number) || 1,
  }
}

// Transform from DB snake_case to camelCase
function transformFromDB(data: Record<string, unknown>): IEventPackage {
  return {
    id: data.id as number,
    eventId: data.event_id as number,
    name: data.name as string,
    code: data.code as string,
    price: data.price as number,
    discountedPrice: data.discounted_price as number | undefined,
    items: (data.items as string[]) || [],
    image: data.image as string | undefined,
    description: data.description as string | undefined,
    isBundle: !!data.is_bundle,
    sortOrder: data.sort_order as number,
    active: !!data.active,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}
