import { Fragment, useMemo, useState } from 'react'
import { useAgenda } from '../hooks/useAgenda'
import { createAppointment, updateAppointmentStatus } from '../api/appointments'
import type { AppointmentWithPatient } from '../api/appointments'
import type { Patient } from '../types/database.types'

const HOURS = Array.from({ length: 12 }, (_, i) => 8 + i) // 08h–19h

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function dateLabel(d: Date) {
  const label = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
  return label.charAt(0).toUpperCase() + label.slice(1).replace('.', '')
}

export function AgendaTab({
  patients,
  onOpenPatient,
}: {
  patients: Patient[]
  onOpenPatient: (patientId: string) => void
}) {
  const [date, setDate] = useState(() => startOfDay(new Date()))
  const { appointments, loading, error, reload } = useAgenda(date)
  const [slotHour, setSlotHour] = useState<number | null>(null)
  const [viewing, setViewing] = useState<AppointmentWithPatient | null>(null)

  const byHour = useMemo(() => {
    const map = new Map<number, AppointmentWithPatient[]>()
    for (const appt of appointments) {
      if (appt.status === 'cancelada') continue
      const h = new Date(appt.scheduled_at).getHours()
      const list = map.get(h) ?? []
      list.push(appt)
      map.set(h, list)
    }
    return map
  }, [appointments])

  function shiftDay(delta: number) {
    setDate((prev) => {
      const next = new Date(prev)
      next.setDate(next.getDate() + delta)
      return next
    })
  }

  return (
    <div className="main module-main visible">
      <div className="module-header">
        <div className="module-title">Agenda</div>
        <div className="module-sub">
          {error
            ? error
            : appointments.length === 0
              ? 'Nenhuma consulta neste dia.'
              : `${appointments.length} consulta${appointments.length > 1 ? 's' : ''} neste dia.`}
        </div>
      </div>

      <div className="agenda-controls">
        <div className="agenda-nav">
          <button onClick={() => shiftDay(-1)} aria-label="Dia anterior">
            ‹
          </button>
          <span className="agenda-date-label">{dateLabel(date)}</span>
          <button onClick={() => shiftDay(1)} aria-label="Próximo dia">
            ›
          </button>
        </div>
        <button className="btn btn-ghost" onClick={() => setDate(startOfDay(new Date()))}>
          Hoje
        </button>
        <button className="btn btn-solid" onClick={() => setSlotHour(9)}>
          Nova consulta
        </button>
      </div>

      <div className="agenda-grid">
        {HOURS.map((h) => {
          const appts = byHour.get(h) ?? []
          return (
            <Fragment key={h}>
              <div className="agenda-hour">{String(h).padStart(2, '0')}:00</div>
              <div className="agenda-slot">
                {appts.length === 0 ? (
                  <span className="slot-add" onClick={() => setSlotHour(h)}>
                    ＋
                  </span>
                ) : (
                  appts.map((a) => (
                    <button key={a.id} className="slot-appointment" onClick={() => setViewing(a)}>
                      <span className="slot-name">{a.patient_name}</span>
                      <span className="slot-reason">{a.reason}</span>
                    </button>
                  ))
                )}
              </div>
            </Fragment>
          )
        })}
      </div>

      {loading && appointments.length === 0 && !error && (
        <div className="empty">
          <p>Carregando agenda…</p>
        </div>
      )}

      {slotHour !== null && (
        <NewAppointmentModal
          patients={patients}
          date={date}
          initialHour={slotHour}
          onClose={() => setSlotHour(null)}
          onSave={async (patientId, time, reason) => {
            const [hh, mm] = time.split(':').map(Number)
            const scheduledAt = new Date(date)
            scheduledAt.setHours(hh, mm, 0, 0)
            await createAppointment({ patientId, scheduledAt: scheduledAt.toISOString(), reason })
            setSlotHour(null)
            reload()
          }}
        />
      )}

      {viewing && (
        <AppointmentDetailModal
          appointment={viewing}
          onClose={() => setViewing(null)}
          onOpenPatient={() => {
            onOpenPatient(viewing.patient_id)
            setViewing(null)
          }}
          onCancel={async () => {
            await updateAppointmentStatus(viewing.id, 'cancelada')
            setViewing(null)
            reload()
          }}
        />
      )}
    </div>
  )
}

function NewAppointmentModal({
  patients,
  date,
  initialHour,
  onClose,
  onSave,
}: {
  patients: Patient[]
  date: Date
  initialHour: number
  onClose: () => void
  onSave: (patientId: string, time: string, reason: string) => Promise<void>
}) {
  const [patientId, setPatientId] = useState(patients[0]?.id ?? '')
  const [time, setTime] = useState(`${String(initialHour).padStart(2, '0')}:00`)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  return (
    <div className="modal-overlay visible" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-title">Nova consulta</div>
        <div className="modal-sub">{date.toLocaleDateString('pt-BR')}</div>

        <label className="field-label">Paciente</label>
        <select className="field-select" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
          {patients.length === 0 && <option value="">Nenhum paciente cadastrado</option>}
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="field-row">
          <div>
            <label className="field-label">Horário</label>
            <input className="field-input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Motivo</label>
            <input
              className="field-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Consulta"
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-solid"
            disabled={!patientId || saving}
            onClick={async () => {
              setSaving(true)
              await onSave(patientId, time, reason.trim() || 'Consulta')
              setSaving(false)
            }}
          >
            {saving ? 'Agendando…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AppointmentDetailModal({
  appointment,
  onClose,
  onOpenPatient,
  onCancel,
}: {
  appointment: AppointmentWithPatient
  onClose: () => void
  onOpenPatient: () => void
  onCancel: () => Promise<void>
}) {
  const [canceling, setCanceling] = useState(false)
  return (
    <div className="modal-overlay visible" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-title">{appointment.patient_name}</div>
        <div className="modal-sub">
          {new Date(appointment.scheduled_at).toLocaleString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
          })}
          {' · '}
          {appointment.reason}
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Fechar
          </button>
          <button className="btn btn-ghost" onClick={onOpenPatient}>
            Ver prontuário
          </button>
          {appointment.status === 'agendada' && (
            <button
              className="btn btn-solid"
              disabled={canceling}
              onClick={async () => {
                setCanceling(true)
                await onCancel()
                setCanceling(false)
              }}
            >
              {canceling ? 'Cancelando…' : 'Cancelar consulta'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
