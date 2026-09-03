import { useCallback, useEffect, useState } from 'react'
import { getPatient } from '../api/patients'
import { listTreatments } from '../api/treatments'
import { listTimeline } from '../api/timeline'
import { supabase } from '../lib/supabase'
import type { Appointment, Patient, TimelineEvent, Treatment } from '../types/database.types'
import { computePatientStatus } from '../utils/patientStatus'

export function usePatientDetail(patientId: string | null) {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!patientId) return
    setLoading(true)
    setError(null)
    try {
      const [p, t, tl, nextAppt] = await Promise.all([
        getPatient(patientId),
        listTreatments(patientId),
        listTimeline(patientId),
        supabase
          .from('appointments')
          .select('*')
          .eq('patient_id', patientId)
          .eq('status', 'agendada')
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at')
          .limit(1)
          .maybeSingle()
          .then((res) => {
            if (res.error) throw res.error
            return res.data as Appointment | null
          }),
      ])
      setPatient(p)
      setTreatments(t)
      setTimeline(tl)
      setNextAppointment(nextAppt)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar o prontuário.')
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    reload()
  }, [reload])

  const status = patient ? computePatientStatus(treatments, patient, nextAppointment) : null

  return { patient, treatments, timeline, nextAppointment, status, loading, error, reload }
}
