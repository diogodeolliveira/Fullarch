import { supabase } from '../lib/supabase'
import type { TimelineEvent, TimelineKind } from '../types/database.types'

export async function listTimeline(patientId: string) {
  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('patient_id', patientId)
    .order('event_date', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as TimelineEvent[]
}

export async function addTimelineEvent(params: {
  patientId: string
  title: string
  description?: string
  kind: TimelineKind
  eventDate?: string // YYYY-MM-DD; default = hoje
  muted?: boolean
}) {
  const { data, error } = await supabase
    .from('timeline_events')
    .insert({
      patient_id: params.patientId,
      title: params.title,
      description: params.description ?? null,
      kind: params.kind,
      event_date: params.eventDate ?? new Date().toISOString().slice(0, 10),
      muted: params.muted ?? false,
    })
    .select()
    .single()
  if (error) throw error
  return data as TimelineEvent
}
