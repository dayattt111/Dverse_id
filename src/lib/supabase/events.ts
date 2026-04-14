import { supabase } from './config'
import type { IEvent } from '@/types/event'

// ---------------------------------------------------------------------------
// snake_case ↔ camelCase conversion
// ---------------------------------------------------------------------------

function toEvent(row: Record<string, unknown>): IEvent {
  return {
    id: row.id as number,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string) ?? undefined,
    eventDate: (row.event_date as string) ?? undefined,
    location: (row.location as string) ?? undefined,
    imageUrl: (row.image_url as string) ?? undefined,
    status: (row.status as IEvent['status']) ?? 'draft',
    maxParticipants: (row.max_participants as number) ?? undefined,
    createdAt: (row.created_at as string) ?? undefined,
    updatedAt: (row.updated_at as string) ?? undefined,
  }
}

function toRow(event: Partial<IEvent>) {
  const row: Record<string, unknown> = {}
  if (event.name !== undefined) row.name = event.name
  if (event.slug !== undefined) row.slug = event.slug
  if (event.description !== undefined) row.description = event.description
  if (event.eventDate !== undefined) row.event_date = event.eventDate
  if (event.location !== undefined) row.location = event.location
  if (event.imageUrl !== undefined) row.image_url = event.imageUrl
  if (event.status !== undefined) row.status = event.status
  if (event.maxParticipants !== undefined) row.max_participants = event.maxParticipants
  return row
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function getEvents(): Promise<IEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(toEvent)
}

export async function getEventById(id: number): Promise<IEvent | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return toEvent(data)
}

export async function addEvent(event: Partial<IEvent>): Promise<IEvent> {
  const { data, error } = await supabase
    .from('events')
    .insert(toRow(event))
    .select()
    .single()

  if (error) throw error
  return toEvent(data)
}

export async function updateEvent(id: number, event: Partial<IEvent>): Promise<IEvent> {
  const { data, error } = await supabase
    .from('events')
    .update(toRow(event))
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return toEvent(data)
}

export async function deleteEvent(id: number): Promise<void> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) throw error
}
