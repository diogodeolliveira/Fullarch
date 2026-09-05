import { useState } from 'react'
import { usePatientDetail } from '../hooks/usePatientDetail'
import { addTimelineEvent } from '../api/timeline'
import { financialLabel } from '../utils/patientStatus'
import { FilesTab } from './FilesTab'
import { OdontogramaTab } from './OdontogramaTab'
import { TreatmentsTab } from './TreatmentsTab'
import { supabase } from '../lib/supabase'

type Tab = 'timeline' | 'tratamentos' | 'odontograma' | 'imagens' | 'documentos'

const TABS: { key: Tab; label: string }[] = [
  { key: 'timeline', label: 'Timeline' },
  { key: 'tratamentos', label: 'Tratamentos' },
  { key: 'odontograma', label: 'Odontograma' },
  { key: 'imagens', label: 'Imagens' },
  { key: 'documentos', label: 'Documentos' },
]

export function PatientProfile({ patientId }: { patientId: string }) {
  const { patient, treatments, timeline, status, loading, error, reload } = usePatientDetail(patientId)
  const [tab, setTab] = useState<Tab>('timeline')
  const [noteOpen, setNoteOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)

  if (loading && !patient) return <div className="panel-body">Carregando prontuário…</div>
  if (error) return <div className="panel-body">{error}</div>
  if (!patient) return null

  const activeTreatment = treatments.find((t) => t.status === 'em_andamento')

  return (
    <div className="main">
      <div className="profile-header">
        <div className="ph-top">
          <div>
            <div className="ph-name">{patient.name}</div>
            <div className="ph-sub">
              <span>{patient.age ? `${patient.age} anos` : '—'}</span>
              <span>{patient.phone ?? '—'}</span>
              <span>{patient.plan}</span>
            </div>
          </div>
          <div className="ph-actions">
            <button className="btn btn-ghost" onClick={() => setNoteOpen(true)}>
              Anotar
            </button>
            <button className="btn btn-solid" onClick={() => setScheduleOpen(true)}>
              Agendar
            </button>
          </div>
        </div>
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="panel-body">
        <div className="facts-row">
          <Fact label="Status" value={status?.nextStep ?? '—'} attention={status?.tag === 'attention'} />
          <Fact
            label="Tratamento ativo"
            value={activeTreatment?.name ?? 'Nenhum'}
            attention={false}
          />
          <Fact
            label="Situação financeira"
            value={financialLabel(patient.financial_status)}
            attention={patient.financial_status === 'atrasado'}
          />
          <Fact label="Tratamentos" value={String(treatments.length)} attention={false} />
        </div>

        {tab === 'timeline' && <TimelineTab events={timeline} />}
        {tab === 'tratamentos' && (
          <TreatmentsTab
            patientId={patient.id}
            treatments={treatments}
            onChanged={reload}
            onGoToTooth={() => setTab('odontograma')}
          />
        )}
        {tab === 'odontograma' && <OdontogramaTab patientId={patient.id} onChanged={reload} />}
        {tab === 'imagens' && (
          <FilesTab patientId={patient.id} patientName={patient.name} kind="image" onChanged={reload} />
        )}
        {tab === 'documentos' && (
          <FilesTab patientId={patient.id} patientName={patient.name} kind="document" onChanged={reload} />
        )}
      </div>

      {noteOpen && (
        <NoteModal
          onClose={() => setNoteOpen(false)}
          onSave={async (text) => {
            await addTimelineEvent({ patientId: patient.id, title: 'Anotação clínica', description: text, kind: 'Anotação' })
            setNoteOpen(false)
            setTab('timeline')
            reload()
          }}
        />
      )}
      {scheduleOpen && (
        <ScheduleModal
          onClose={() => setScheduleOpen(false)}
          onSave={async (date, time, reason) => {
            const scheduledAt = new Date(`${date}T${time}:00`).toISOString()
            const { error: apptError } = await supabase
              .from('appointments')
              .insert({ patient_id: patient.id, scheduled_at: scheduledAt, reason })
            if (apptError) throw apptError
            await addTimelineEvent({
              patientId: patient.id,
              title: 'Consulta agendada',
              description: `${reason} marcada para ${new Date(scheduledAt).toLocaleString('pt-BR')}.`,
              kind: 'Consulta',
            })
            setScheduleOpen(false)
            setTab('timeline')
            reload()
          }}
        />
      )}
    </div>
  )
}

function Fact({ label, value, attention }: { label: string; value: string; attention: boolean }) {
  return (
    <div className="fact">
      <div className="fact-label">{label}</div>
      <div className={`fact-value ${attention ? 'attention' : ''}`}>{value}</div>
    </div>
  )
}

function TimelineTab({ events }: { events: import('../types/database.types').TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="empty">
        <p>Nenhum evento na timeline ainda.</p>
      </div>
    )
  }
  return (
    <div className="timeline">
      {events.map((ev) => (
        <div key={ev.id} className={`tl-item ${ev.muted ? 'muted' : ''}`}>
          <div className="tl-dot" />
          <div className="tl-date">{new Date(ev.event_date).toLocaleDateString('pt-BR')}</div>
          <div className="tl-card">
            <div className="tl-title">{ev.title}</div>
            {ev.description && <div className="tl-desc">{ev.description}</div>}
            <span className="tl-kind">{ev.kind}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function NoteModal({ onClose, onSave }: { onClose: () => void; onSave: (text: string) => Promise<void> }) {
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  return (
    <div className="modal-overlay visible" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-title">Nova anotação clínica</div>
        <label className="field-label">Anotação</label>
        <textarea className="field-textarea" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-solid"
            disabled={!text.trim() || saving}
            onClick={async () => {
              setSaving(true)
              await onSave(text.trim())
              setSaving(false)
            }}
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ScheduleModal({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (date: string, time: string, reason: string) => Promise<void>
}) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  return (
    <div className="modal-overlay visible" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-title">Agendar consulta</div>
        <div className="field-row">
          <div>
            <label className="field-label">Data</label>
            <input className="field-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Horário</label>
            <input className="field-input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        <label className="field-label">Motivo</label>
        <input className="field-input" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-solid"
            disabled={!date || saving}
            onClick={async () => {
              setSaving(true)
              await onSave(date, time, reason.trim() || 'Consulta')
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
