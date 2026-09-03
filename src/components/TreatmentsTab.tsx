import { useState } from 'react'
import type { Treatment, TreatmentSession } from '../types/database.types'
import {
  createTreatment,
  updateTreatment,
  updateTreatmentStatus,
  addTreatmentSession,
  deleteTreatment,
  listSessions,
} from '../api/treatments'

const STATUS_LABEL: Record<Treatment['status'], string> = {
  aguardando_aprovacao: 'Aguardando aprovação',
  nao_agendado: 'Não agendado',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

const PAY_LABEL: Record<Treatment['payment_status'], string> = {
  pago: 'Pago',
  parcial: 'Pagamento parcial',
  pendente: 'Pagamento pendente',
}

export function TreatmentsTab({
  patientId,
  treatments,
  onChanged,
  onGoToTooth,
}: {
  patientId: string
  treatments: Treatment[]
  onChanged: () => void
  onGoToTooth?: (toothNumber: string) => void
}) {
  const [newModalOpen, setNewModalOpen] = useState(false)
  const [editFor, setEditFor] = useState<Treatment | null>(null)
  const [scheduleFor, setScheduleFor] = useState<Treatment | null>(null)
  const [sessionFor, setSessionFor] = useState<Treatment | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [sessionsCache, setSessionsCache] = useState<Record<string, TreatmentSession[]>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleApprove(t: Treatment) {
    setBusyId(t.id)
    setError(null)
    try {
      await updateTreatmentStatus(t.id, patientId, 'nao_agendado')
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao aprovar tratamento.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleCancel(t: Treatment) {
    setBusyId(t.id)
    setError(null)
    try {
      await updateTreatmentStatus(t.id, patientId, 'cancelado')
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar tratamento.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(t: Treatment) {
    if (!confirm(`Apagar o tratamento "${t.name}"? Esta ação não pode ser desfeita.`)) return
    setBusyId(t.id)
    setError(null)
    try {
      await deleteTreatment(t.id, patientId, t.name)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao apagar tratamento.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleToggleSessions(t: Treatment) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(t.id)) next.delete(t.id)
      else next.add(t.id)
      return next
    })
    if (!sessionsCache[t.id]) {
      try {
        const sessions = await listSessions(t.id)
        setSessionsCache((prev) => ({ ...prev, [t.id]: sessions }))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar sessões.')
      }
    }
  }

  const isToothLinked = (toothRef: string) => /^Dente \d+$/.test(toothRef)

  return (
    <div>
      <div className="treat-section-head">
        <div className="section-label" style={{ margin: 0 }}>
          Tratamentos
        </div>
        <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 11 }} onClick={() => setNewModalOpen(true)}>
          Novo
        </button>
      </div>

      {error && <p style={{ color: '#9C4A3C', fontSize: 12.5, marginBottom: 10 }}>{error}</p>}

      {treatments.length === 0 ? (
        <div className="empty">
          <p>Nenhum tratamento registrado ainda.</p>
        </div>
      ) : (
        treatments.map((t) => {
          const toothNum = isToothLinked(t.tooth_ref) ? t.tooth_ref.replace('Dente ', '') : null
          const busy = busyId === t.id
          return (
            <div key={t.id} className={`treat-card ${t.status === 'cancelado' ? 'cancelado' : ''}`}>
              <div className="treat-top">
                <div>
                  <div className="treat-name">{t.name}</div>
                  <div className="treat-meta">
                    {toothNum && onGoToTooth ? (
                      <button className="treat-link" onClick={() => onGoToTooth(toothNum)}>
                        {t.tooth_ref}
                      </button>
                    ) : (
                      t.tooth_ref
                    )}
                    {t.professional && <><span className="dot">·</span>{t.professional}</>}
                    {t.cost != null && <><span className="dot">·</span>R$ {Number(t.cost).toFixed(2)}</>}
                    {t.cost != null && (
                      <span className={`pay-badge pay-${t.payment_status}`}>{PAY_LABEL[t.payment_status]}</span>
                    )}
                  </div>
                </div>
                <div className="treat-top-right">
                  <span className={`status-badge status-${t.status}`}>{STATUS_LABEL[t.status]}</span>
                  <button
                    className="treat-edit-btn"
                    onClick={() => setEditFor(t)}
                    disabled={busy}
                    aria-label="Editar tratamento"
                    title="Editar tratamento"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>
                  <button
                    className="treat-delete-btn"
                    onClick={() => handleDelete(t)}
                    disabled={busy}
                    aria-label="Apagar tratamento"
                    title="Apagar tratamento"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              </div>

              {t.status === 'aguardando_aprovacao' && (
                <div className="treat-actions">
                  <div className="treat-actions-left">
                    <span style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>
                      Aguardando aprovação do paciente.
                    </span>
                  </div>
                  <button
                    className="btn btn-solid"
                    style={{ padding: '5px 12px', fontSize: 11 }}
                    onClick={() => handleApprove(t)}
                    disabled={busy}
                  >
                    Aprovar
                  </button>
                </div>
              )}

              {t.status === 'nao_agendado' && (
                <div className="treat-actions">
                  <div className="treat-actions-left">
                    <button className="treat-cancel-link" onClick={() => handleCancel(t)} disabled={busy}>
                      Cancelar
                    </button>
                  </div>
                  <button
                    className="btn btn-solid"
                    style={{ padding: '5px 12px', fontSize: 11 }}
                    onClick={() => setScheduleFor(t)}
                    disabled={busy}
                  >
                    Agendar
                  </button>
                </div>
              )}

              {t.status === 'em_andamento' && (
                <>
                  <div className="treat-progress-row">
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${t.progress_pct}%` }} />
                    </div>
                    <div className="treat-pct">{t.progress_pct}%</div>
                  </div>
                  <div className="treat-actions">
                    <div className="treat-actions-left">
                      <button className="treat-cancel-link" onClick={() => handleCancel(t)} disabled={busy}>
                        Cancelar
                      </button>
                      <button className="treat-link" onClick={() => handleToggleSessions(t)}>
                        Ver sessões {sessionsCache[t.id] ? `(${sessionsCache[t.id].length})` : ''}
                      </button>
                    </div>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '5px 12px', fontSize: 11 }}
                      onClick={() => setSessionFor(t)}
                      disabled={busy}
                    >
                      Registrar sessão
                    </button>
                  </div>
                  {expanded.has(t.id) && (
                    <div className="sessions-list">
                      {(sessionsCache[t.id] ?? []).map((s) => (
                        <div className="session-row" key={s.id}>
                          <span className="session-date">{new Date(s.session_date).toLocaleDateString('pt-BR')}</span>
                          <span className="session-note">{s.note}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {t.status === 'concluido' && (
                <div className="treat-progress-row">
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: '100%' }} />
                  </div>
                  <div className="treat-pct">100%</div>
                </div>
              )}
            </div>
          )
        })
      )}

      {editFor && (
        <EditTreatmentModal
          treatment={editFor}
          patientId={patientId}
          onClose={() => setEditFor(null)}
          onSaved={() => {
            setEditFor(null)
            onChanged()
          }}
        />
      )}
      {newModalOpen && (
        <NewTreatmentModal
          patientId={patientId}
          onClose={() => setNewModalOpen(false)}
          onCreated={() => {
            setNewModalOpen(false)
            onChanged()
          }}
        />
      )}
      {scheduleFor && (
        <ScheduleTreatmentModal
          treatment={scheduleFor}
          patientId={patientId}
          onClose={() => setScheduleFor(null)}
          onScheduled={() => {
            setScheduleFor(null)
            onChanged()
          }}
        />
      )}
      {sessionFor && (
        <SessionModal
          treatment={sessionFor}
          patientId={patientId}
          onClose={() => setSessionFor(null)}
          onSaved={() => {
            setSessionFor(null)
            setSessionsCache((prev) => {
              const next = { ...prev }
              delete next[sessionFor.id]
              return next
            })
            onChanged()
          }}
        />
      )}
    </div>
  )
}

function EditTreatmentModal({
  treatment,
  patientId,
  onClose,
  onSaved,
}: {
  treatment: Treatment
  patientId: string
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(treatment.name)
  const [tooth, setTooth] = useState(treatment.tooth_ref)
  const [professional, setProfessional] = useState(treatment.professional ?? '')
  const [cost, setCost] = useState(treatment.cost != null ? String(treatment.cost) : '')
  const [paymentStatus, setPaymentStatus] = useState<Treatment['payment_status']>(treatment.payment_status)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      await updateTreatment(treatment.id, patientId, {
        name: name.trim(),
        toothRef: tooth.trim() || 'Geral',
        professional: professional.trim() || null,
        cost: cost ? Number(cost) : null,
        paymentStatus,
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar as alterações.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay visible" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-title">Editar tratamento</div>
        <label className="field-label">Nome do tratamento *</label>
        <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="field-row">
          <div>
            <label className="field-label">Dente / região</label>
            <input className="field-input" value={tooth} onChange={(e) => setTooth(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Profissional</label>
            <input className="field-input" value={professional} onChange={(e) => setProfessional(e.target.value)} />
          </div>
        </div>
        <div className="field-row">
          <div>
            <label className="field-label">Custo estimado</label>
            <input className="field-input" type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Situação de pagamento</label>
            <select
              className="field-select"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as Treatment['payment_status'])}
            >
              <option value="pendente">Pendente</option>
              <option value="parcial">Parcial</option>
              <option value="pago">Pago</option>
            </select>
          </div>
        </div>
        {error && <p style={{ color: '#9C4A3C', fontSize: 12.5 }}>{error}</p>}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="btn btn-solid" onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  )
}

function NewTreatmentModal({
  patientId,
  onClose,
  onCreated,
}: {
  patientId: string
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [tooth, setTooth] = useState('')
  const [professional, setProfessional] = useState('')
  const [cost, setCost] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      await createTreatment({
        patientId,
        name: name.trim(),
        toothRef: tooth.trim() || undefined,
        professional: professional.trim() || undefined,
        cost: cost ? Number(cost) : undefined,
      })
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar tratamento.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay visible" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-title">Novo tratamento</div>
        <div className="modal-sub">Para tratamentos que não nascem de uma condição no odontograma.</div>
        <label className="field-label">Nome do tratamento *</label>
        <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="field-row">
          <div>
            <label className="field-label">Dente / região</label>
            <input className="field-input" value={tooth} onChange={(e) => setTooth(e.target.value)} placeholder="Ex.: Dente 36 ou Geral" />
          </div>
          <div>
            <label className="field-label">Profissional</label>
            <input className="field-input" value={professional} onChange={(e) => setProfessional(e.target.value)} />
          </div>
        </div>
        <label className="field-label">Custo estimado</label>
        <input className="field-input" type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
        {error && <p style={{ color: '#9C4A3C', fontSize: 12.5 }}>{error}</p>}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="btn btn-solid" onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? 'Criando…' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ScheduleTreatmentModal({
  treatment,
  patientId,
  onClose,
  onScheduled,
}: {
  treatment: Treatment
  patientId: string
  onClose: () => void
  onScheduled: () => void
}) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    if (!date) return
    setSaving(true)
    setError(null)
    try {
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString()
      await updateTreatmentStatus(treatment.id, patientId, 'em_andamento', {
        scheduled_at: scheduledAt,
        progress_pct: treatment.progress_pct || 5,
      })
      onScheduled()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao agendar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay visible" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-title">Agendar tratamento</div>
        <div className="modal-sub">{treatment.name}</div>
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
        {error && <p style={{ color: '#9C4A3C', fontSize: 12.5 }}>{error}</p>}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="btn btn-solid" onClick={handleConfirm} disabled={saving || !date}>
            {saving ? 'Confirmando…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SessionModal({
  treatment,
  patientId,
  onClose,
  onSaved,
}: {
  treatment: Treatment
  patientId: string
  onClose: () => void
  onSaved: () => void
}) {
  const [date, setDate] = useState('')
  const [pct, setPct] = useState(String(Math.min(100, (treatment.progress_pct || 0) + 20)))
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!date || !note.trim()) return
    setSaving(true)
    setError(null)
    try {
      await addTreatmentSession({
        treatmentId: treatment.id,
        patientId,
        treatmentName: treatment.name,
        sessionDate: date,
        note: note.trim(),
        progressPct: Math.max(0, Math.min(100, Number(pct) || treatment.progress_pct)),
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar sessão.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay visible" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-title">Registrar sessão</div>
        <div className="modal-sub">{treatment.name}</div>
        <div className="field-row">
          <div>
            <label className="field-label">Data da sessão</label>
            <input className="field-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Progresso (%)</label>
            <input className="field-input" type="number" min={0} max={100} value={pct} onChange={(e) => setPct(e.target.value)} />
          </div>
        </div>
        <label className="field-label">O que foi feito</label>
        <textarea className="field-textarea" value={note} onChange={(e) => setNote(e.target.value)} />
        {error && <p style={{ color: '#9C4A3C', fontSize: 12.5 }}>{error}</p>}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="btn btn-solid" onClick={handleSave} disabled={saving || !date || !note.trim()}>
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
