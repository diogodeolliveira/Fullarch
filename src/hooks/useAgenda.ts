import { useCallback, useEffect, useState } from 'react'
import { listAppointmentsByRange } from '../api/appointments'
import type { AppointmentWithPatient } from '../api/appointments'

function dayRange(date: Date, days: number) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + days)
  return { startISO: start.toISOString(), endISO: end.toISOString() }
}

export function useAgenda(date: Date, days = 1) {
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { startISO, endISO } = dayRange(date, days)
      setAppointments(await listAppointmentsByRange(startISO, endISO))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar a agenda.')
    } finally {
      setLoading(false)
    }
  }, [date.getFullYear(), date.getMonth(), date.getDate(), days])

  useEffect(() => {
    reload()
  }, [reload])

  return { appointments, loading, error, reload }
}
