import { useCallback, useEffect, useState } from 'react'
import { listPatients } from '../api/patients'
import type { Patient } from '../types/database.types'

export function usePatients(enabled = true) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setPatients(await listPatients())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pacientes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      setPatients([])
      setError(null)
      setLoading(false)
      return
    }
    reload()
  }, [enabled, reload])

  return { patients, loading, error, reload }
}
