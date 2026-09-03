export type ViewName = 'pacientes' | 'dashboard' | 'agenda' | 'crm' | 'financeiro' | 'ajustes'

const ITEMS: { view: ViewName; label: string }[] = [
  { view: 'pacientes', label: 'Pacientes' },
  { view: 'dashboard', label: 'Início' },
  { view: 'agenda', label: 'Agenda' },
  { view: 'crm', label: 'CRM' },
  { view: 'financeiro', label: 'Financ.' },
]

export function Sidebar({
  active,
  onChange,
  onSignOut,
}: {
  active: ViewName
  onChange: (v: ViewName) => void
  onSignOut: () => void
}) {
  return (
    <nav className="sidebar" aria-label="Navegação principal">
      <div className="brand">D</div>
      {ITEMS.map((item) => (
        <button
          key={item.view}
          className={`nav-item ${active === item.view ? 'active' : ''}`}
          onClick={() => onChange(item.view)}
        >
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
      <div className="nav-spacer" />
      <button className="nav-item" onClick={() => onChange('ajustes')}>
        <span className="nav-label">Ajustes</span>
      </button>
      <button className="nav-item" onClick={onSignOut} title="Sair">
        <span className="nav-label">Sair</span>
      </button>
    </nav>
  )
}
