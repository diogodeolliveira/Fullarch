import { useDashboard } from '../hooks/useDashboard'
import type { ViewName } from './Sidebar'

const TREATMENT_STATUS_LABEL: Record<string, string> = {
  aguardando_aprovacao: 'Aguardando aprovação',
  nao_agendado: 'Aprovado — falta agendar',
}

export function DashboardTab({
  patientCount,
  patientsLoading,
  onNavigate,
  onOpenPatient,
}: {
  patientCount: number
  patientsLoading: boolean
  onNavigate: (view: ViewName) => void
  onOpenPatient: (patientId: string) => void
}) {
  const { todayCount, upcoming, pendingTreatments, attentionCount, loading, error, reload } = useDashboard()

  return (
    <div className="main module-main visible">
      <div className="module-header">
        <div className="module-title">Início</div>
        <div className="module-sub">
          {error ? (
            <>
              {error}{' '}
              <button className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: 11 }} onClick={reload}>
                Tentar de novo
              </button>
            </>
          ) : (
            'O que precisa da sua atenção agora.'
          )}
        </div>
      </div>

      <div className="dash-grid">
        <button className="dash-card" onClick={() => onNavigate('pacientes')}>
          <div className="fact-label">Pacientes ativos</div>
          <div className="dash-num">{patientsLoading ? '…' : patientCount}</div>
        </button>

        <button className="dash-card" onClick={() => onNavigate('agenda')}>
          <div className="fact-label">Consultas hoje</div>
          <div className="dash-num">{loading ? '…' : todayCount}</div>
        </button>

        <button
          className={`dash-card ${attentionCount > 0 ? 'attention' : ''}`}
          onClick={() => onNavigate('pacientes')}
        >
          <div className="fact-label">Requerem atenção</div>
          <div className="dash-num">{loading ? '…' : attentionCount}</div>
        </button>
      </div>

      <div className="dash-two-col">
        <div>
          <div className="section-label">Próximas consultas</div>
          {loading ? (
            <div className="empty">
              <p>Carregando…</p>
            </div>
          ) : upcoming.length === 0 ? (
            <div className="empty">
              <p>Nenhuma consulta agendada.</p>
            </div>
          ) : (
            upcoming.map((a) => (
              <button key={a.id} className="dash-list-item" onClick={() => onOpenPatient(a.patient_id)}>
                <span className="agenda-time">
                  {new Date(a.scheduled_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}{' '}
                  {new Date(a.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="agenda-name">{a.patient_name}</span>
                <span className="agenda-reason">{a.reason}</span>
              </button>
            ))
          )}
        </div>

        <div>
          <div className="section-label">Tratamentos pendentes</div>
          {loading ? (
            <div className="empty">
              <p>Carregando…</p>
            </div>
          ) : pendingTreatments.length === 0 ? (
            <div className="empty">
              <p>Nenhum tratamento pendente.</p>
            </div>
          ) : (
            pendingTreatments.map((t) => (
              <button key={t.id} className="dash-list-item" onClick={() => onOpenPatient(t.patient_id)}>
                <span className="agenda-name">{t.name}</span>
                <span className="agenda-reason">
                  {t.patient_name} · {TREATMENT_STATUS_LABEL[t.status] ?? t.status}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}