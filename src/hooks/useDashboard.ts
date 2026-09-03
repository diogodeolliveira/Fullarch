import { useCallback, useEffect, useState } from 'react'
import { listAppointmentsByRange, listUpcomingAppointments } from '../api/appointments'
import type { AppointmentWithPatient } from '../api/appointments'
import { listPendingTreatments } from '../api/treatments'
import type { TreatmentWithPatient } from '../api/treatments'
import { countAttentionPatients } from '../api/dashboard'

function todayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { startISO: start.toISOString(), endISO: end.toISOString() }
}

export function useDashboard() {
  const [todayCount, setTodayCount] = useState(0)
  const [upcoming, setUpcoming] = useState<AppointmentWithPatient[]>([])
  const [pendingTreatments, setPendingTreatments] = useState<TreatmentWithPatient[]>([])
  const [attentionCount, setAttentionCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { startISO, endISO } = todayRange()
      const [today, next, pending, attention] = await Promise.all([
        listAppointmentsByRange(startISO, endISO),
        listUpcomingAppointments(5),
        listPendingTreatments(5),
        countAttentionPatients(),
      ])
      setTodayCount(today.filter((a) => a.status !== 'cancelada').length)
      setUpcoming(next)
      setPendingTreatments(pending)
      setAttentionCount(attention)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar o painel.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { todayCount, upcoming, pendingTreatments, attentionCount, loading, error, reload }
}