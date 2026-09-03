import { useMemo, useState } from 'react'
import type { Patient } from '../types/database.types'
import { createPatient } from '../api/patients'

export function PatientList({
  patients,
  activeId,
  loading,
  error,
  onSelect,
  onCreated,
}: {
  patients: Patient[]
  activeId: string | null
  loading: boolean
  error: string | null
  onSelect: (id: string) => void
  onCreated: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return patients
    return patients.filter((p) => p.name.toLowerCase().includes(q))
  }, [patients, query])

  return (
    <div className="list-col">
      <div className="search-wrap">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar paciente…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="list-header">
        <h2>Pacientes</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="list-count">{loading ? '…' : filtered.length}</span>
          <button className="add-patient-btn" onClick={() => setModalOpen(true)} title="Adicionar paciente">
            +
          </button>
        </div>
      </div>
      <div className="patient-list">
        {error && <div className="search-empty">{error}</div>}
        {!error && filtered.length === 0 && !loading && (
          <div className="search-empty">Nenhum paciente encontrado.</div>
        )}
        {filtered.map((p) => (
          <button
            key={p.id}
            className={`patient-card ${p.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(p.id)}
          >
            <div className="avatar">{initials(p.name)}</div>
            <div className="patient-info">
              <div className="patient-name">{p.name}</div>
              <div className="patient-meta">
                {p.age ? `${p.age} anos · ` : ''}
                {p.plan}
              </div>
            </div>
          </button>
        ))}
      </div>

      {modalOpen && (
        <NewPatientModal
          onClose={() => setModalOpen(false)}
          onCreated={(id) => {
            setModalOpen(false)
            onCreated(id)
          }}
        />
      )}
    </div>
  )
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

function NewPatientModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (id: string) => void
}) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [phone, setPhone] = useState('')
  const [plan, setPlan] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const patient = await createPatient({
        name: name.trim(),
        age: age ? Number(age) : null,
        phone: phone.trim() || null,
        plan: plan.trim() || undefined,
        reason: reason.trim() || undefined,
      })
      onCreated(patient.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar paciente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay visible" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-title">Novo paciente</div>
        <div className="modal-sub">Cadastro rápido — o restante se constrói com o uso.</div>
        <label className="field-label">Nome completo *</label>
        <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="field-row">
          <div>
            <label className="field-label">Idade</label>
            <input
              className="field-input"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Telefone</label>
            <input className="field-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <label className="field-label">Convênio / Plano</label>
        <input className="field-input" value={plan} onChange={(e) => setPlan(e.target.value)} />
        <label className="field-label">Motivo da primeira consulta</label>
        <textarea
          className="field-textarea"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        {error && <p style={{ color: '#9C4A3C', fontSize: 12.5 }}>{error}</p>}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-solid" onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? 'Criando…' : 'Criar prontuário'}
          </button>
        </div>
      </div>
    </div>
  )
}
