import { useEffect, useState } from 'react'
import { DENTES, CONDICAO_GRUPOS, CONDICAO_TYPE, QUESTIONARIO_GRUPOS } from '../data/odontograma'
import {
  listToothConditions,
  saveToothConditions,
  clearToothConditions,
} from '../api/toothConditions'
import { listQuestionnaireItems, toggleQuestionnaireItem } from '../api/questionnaire'
import type { ToothCondition } from '../types/database.types'

export function OdontogramaTab({ patientId, onChanged }: { patientId: string; onChanged?: () => void }) {
  const [conditions, setConditions] = useState<ToothCondition[]>([])
  const [questionnaire, setQuestionnaire] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalTooth, setModalTooth] = useState<number | null>(null)

  async function reload() {
    setLoading(true)
    setError(null)
    try {
      const [c, q] = await Promise.all([listToothConditions(patientId), listQuestionnaireItems(patientId)])
      setConditions(c)
      setQuestionnaire(q)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar odontograma.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId])

  function itemsForTooth(num: number) {
    return conditions.filter((c) => c.tooth_number === num).map((c) => c.condition_name)
  }

  async function handleToggleQuest(item: string) {
    const selected = !questionnaire.includes(item)
    setQuestionnaire((prev) => (selected ? [...prev, item] : prev.filter((i) => i !== item)))
    try {
      await toggleQuestionnaireItem(patientId, item, selected)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar questionário.')
      reload()
    }
  }

  if (loading) {
    return (
      <div className="empty">
        <p>Carregando odontograma…</p>
      </div>
    )
  }

  return (
    <div>
      <div className="section-label">Odontograma</div>
      {error && <p style={{ color: '#9C4A3C', fontSize: 12.5, marginBottom: 10 }}>{error}</p>}

      <div className="odonto-wrap">
        <Arcada nums={DENTES.SUPERIOR_ESQUERDA} nums2={DENTES.SUPERIOR_DIREITA} itemsForTooth={itemsForTooth} onClick={setModalTooth} />
        <Arcada nums={DENTES.INFERIOR_ESQUERDA} nums2={DENTES.INFERIOR_DIREITA} itemsForTooth={itemsForTooth} onClick={setModalTooth} />
        <div className="odonto-legend">
          <div className="legend-item">
            <span className="legend-swatch" style={{ background: 'var(--amber-soft)', border: '1px solid var(--amber)' }} />
            Atenção
          </div>
          <div className="legend-item">
            <span className="legend-swatch" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }} />
            Sem intervenção
          </div>
        </div>
        <div className="odonto-hint">Toque em um dente para abrir as condições clínicas.</div>
      </div>

      <div className="quest-wrap">
        <div className="section-label">Mini questionário</div>
        {QUESTIONARIO_GRUPOS.map((g) => (
          <div className="quest-group" key={g.label}>
            <div className="quest-group-label">{g.label}</div>
            <div className="quest-chips">
              {g.items.map((item) => (
                <button
                  key={item}
                  className={`quest-chip ${questionnaire.includes(item) ? 'selected' : ''}`}
                  onClick={() => handleToggleQuest(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {modalTooth !== null && (
        <ToothModal
          patientId={patientId}
          toothNumber={modalTooth}
          existing={itemsForTooth(modalTooth)}
          onClose={() => setModalTooth(null)}
          onSaved={() => {
            setModalTooth(null)
            reload()
            onChanged?.()
          }}
        />
      )}
    </div>
  )
}

function Arcada({
  nums,
  nums2,
  itemsForTooth,
  onClick,
}: {
  nums: number[]
  nums2: number[]
  itemsForTooth: (n: number) => string[]
  onClick: (n: number) => void
}) {
  return (
    <div className="arcada">
      {nums.map((n) => (
        <Dente key={n} num={n} items={itemsForTooth(n)} onClick={onClick} />
      ))}
      <span className="odonto-gap" />
      {nums2.map((n) => (
        <Dente key={n} num={n} items={itemsForTooth(n)} onClick={onClick} />
      ))}
    </div>
  )
}

function Dente({ num, items, onClick }: { num: number; items: string[]; onClick: (n: number) => void }) {
  const status = items.length > 0 ? 'atencao' : ''
  return (
    <button
      className={`dente-btn ${status}`}
      title={items.length ? items.join(', ') : 'Sem intervenção'}
      onClick={() => onClick(num)}
    >
      <span className="icone-dente">🦷</span>
      <span className="numero">{num}</span>
      {items.length > 1 && <span className="dente-badge">{items.length}</span>}
    </button>
  )
}

function ToothModal({
  patientId,
  toothNumber,
  existing,
  onClose,
  onSaved,
}: {
  patientId: string
  toothNumber: number
  existing: string[]
  onClose: () => void
  onSaved: () => void
}) {
  const outroExisting = existing.find((i) => i.startsWith('Outro:'))
  const [checked, setChecked] = useState<Set<string>>(
    new Set(existing.filter((i) => !i.startsWith('Outro:')))
  )
  const [outroChecked, setOutroChecked] = useState(!!outroExisting)
  const [outroText, setOutroText] = useState(outroExisting ? outroExisting.replace('Outro: ', '') : '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggle(name: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const names = Array.from(checked)
      if (outroChecked && outroText.trim()) names.push(`Outro: ${outroText.trim()}`)
      const selected = names.map((name) => ({
        name,
        type: name.startsWith('Outro:') ? ('atencao' as const) : CONDICAO_TYPE[name],
      }))
      await saveToothConditions({ patientId, toothNumber, selected })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleClear() {
    setSaving(true)
    setError(null)
    try {
      await clearToothConditions(patientId, toothNumber)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao limpar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay visible" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box-wide">
        <div className="modal-title">Dente {toothNumber}</div>
        <div className="modal-sub">Selecione as situações clínicas identificadas.</div>
        <div className="cond-list">
          {CONDICAO_GRUPOS.map((g) => (
            <div key={g.label}>
              <div className="cond-group-label">{g.label}</div>
              {g.items.map(([name]) => (
                <label className="cond-item" key={name}>
                  <input type="checkbox" checked={checked.has(name)} onChange={() => toggle(name)} />
                  {name}
                </label>
              ))}
            </div>
          ))}
          <div className="cond-outro-row">
            <label className="cond-item" style={{ borderTop: 'none', paddingTop: 0 }}>
              <input
                type="checkbox"
                checked={outroChecked}
                onChange={(e) => setOutroChecked(e.target.checked)}
              />
              Outro
            </label>
            <input
              type="text"
              className={`field-input cond-outro-input ${outroChecked ? 'visible' : ''}`}
              placeholder="Descreva a situação…"
              value={outroText}
              onChange={(e) => setOutroText(e.target.value)}
              style={{ marginBottom: 0 }}
            />
          </div>
        </div>
        {error && <p style={{ color: '#9C4A3C', fontSize: 12.5 }}>{error}</p>}
        <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-ghost" onClick={handleClear} disabled={saving}>
            Limpar dente
          </button>
          <div className="modal-actions" style={{ margin: 0 }}>
            <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button className="btn btn-solid" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
