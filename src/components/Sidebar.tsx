export type ViewName = 'pacientes' | 'dashboard' | 'agenda' | 'crm' | 'financeiro' | 'ajustes'

type IconName = 'patients' | 'home' | 'calendar' | 'crm' | 'finance' | 'settings' | 'logout'

const ITEMS: { view: ViewName; label: string; icon: IconName }[] = [
  { view: 'dashboard', label: 'Início', icon: 'home' },
  { view: 'pacientes', label: 'Pacientes', icon: 'patients' },
  { view: 'agenda', label: 'Agenda', icon: 'calendar' },
  { view: 'crm', label: 'CRM', icon: 'crm' },
  { view: 'financeiro', label: 'Financeiro', icon: 'finance' },
]

function NavIcon({ name }: { name: IconName }) {
  const common = { width: 19, height: 19, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  if (name === 'patients') return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.7-3.2 2.5-5 5.5-5s4.8 1.8 5.5 5" /><path d="M16 7.5a3 3 0 0 1 0 5.5M16 14c2.5.2 4 1.8 4.5 4" /></svg>
  if (name === 'home') return <svg {...common}><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></svg>
  if (name === 'calendar') return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M8 14h3M13 14h3M8 17h3" /></svg>
  if (name === 'crm') return <svg {...common}><path d="M4 5h16v11H8l-4 4Z" /><path d="M8 9h8M8 12h5" /></svg>
  if (name === 'finance') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /><circle cx="16.5" cy="15" r="1" /></svg>
  if (name === 'settings') return <svg {...common}><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" /><path d="m19.4 15 .1.1a2 2 0 0 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4v.2a2 2 0 0 1-4 0v-.2a2 2 0 0 0-3.4-1.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A2 2 0 0 0 4.4 12 2 2 0 0 0 3 8.6a2 2 0 1 1 2.8-2.8l.1.1A2 2 0 0 0 9.3 4.5v-.2a2 2 0 1 1 4 0v.2a2 2 0 0 0 3.4 1.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A2 2 0 0 0 20.9 12a2 2 0 0 0-1.5 3Z" /></svg>
  return <svg {...common}><path d="M10 17l5-5-5-5M15 12H3M21 3v18" /></svg>
}

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
      <div className="brand">
        <img src="/mascote-dentinho.png" alt="Mascote Fullarch" />
      </div>
      {ITEMS.map((item) => (
        <button
          key={item.view}
          className={`nav-item ${active === item.view ? 'active' : ''}`}
          onClick={() => onChange(item.view)}
        >
          <NavIcon name={item.icon} />
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
      <div className="nav-spacer" />
      <button className="nav-item" onClick={() => onChange('ajustes')}>
        <NavIcon name="settings" />
        <span className="nav-label">Ajustes</span>
      </button>
      <button className="nav-item" onClick={onSignOut} title="Sair">
        <NavIcon name="logout" />
        <span className="nav-label">Sair</span>
      </button>
    </nav>
  )
}
