import { supabase } from './config'
import { IEventParticipant } from '@/types/event-participant'

/**
 * Register a new event participant
 */
export async function registerEventParticipant(participant: Omit<IEventParticipant, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
  const { data, error } = await supabase
    .from('event_participant')
    .insert({
      event_id: participant.eventId,
      package_id: participant.packageId || null,
      name: participant.name,
      email: participant.email,
      phone: participant.phone,
      institution: participant.institution,
      pic_payment: participant.picPayment || null,
      pic_follow: participant.picFollow || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error registering participant:', error.message, error.code, error.details)
    throw new Error(error.message || 'Gagal menyimpan data pendaftaran')
  }

  return transformFromDB(data)
}

/**
 * Check if email is already registered for an event
 */
export async function checkExistingRegistration(eventId: number, email: string) {
  const { data, error } = await supabase
    .from('event_participant')
    .select('id')
    .eq('event_id', eventId)
    .eq('email', email)
    .maybeSingle()

  if (error) {
    console.error('Error checking registration:', error)
    return false
  }

  return !!data
}

/**
 * Get participants by event ID
 */
export async function getEventParticipants(eventId: number) {
  const { data, error } = await supabase
    .from('event_participant')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching participants:', error)
    return []
  }

  return (data || []).map(transformFromDB)
}

/**
 * Count total registrations for an event
 */
export async function getRegistrationCount(eventId: number): Promise<number> {
  const { count, error } = await supabase
    .from('event_participant')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)

  if (error) {
    console.error('Error counting registrations:', error)
    return 0
  }

  return count || 0
}

// Transform from DB snake_case to camelCase
function transformFromDB(data: Record<string, unknown>): IEventParticipant {
  return {
    id: data.id as number,
    eventId: data.event_id as number,
    packageId: data.package_id as number | undefined,
    name: data.name as string,
    email: data.email as string,
    phone: data.phone as string,
    institution: data.institution as string,
    picPayment: data.pic_payment as string | undefined,
    picFollow: data.pic_follow as string | undefined,
    status: data.status as IEventParticipant['status'],
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}
