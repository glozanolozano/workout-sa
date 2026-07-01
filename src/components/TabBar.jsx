import { useLocation, useNavigate } from 'react-router-dom'

function TabIcon({ name }) {
  const icons = {
    today: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),
    week: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    progress: (
      <path d="M3 3v18h18M7 14l4-4 4 4 5-5" />
    ),
  }

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      {icons[name]}
    </svg>
  )
}

export default function TabBar() {
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = [
    { path: '/', label: 'Hoy', icon: 'today' },
    { path: '/week', label: 'Semana', icon: 'week' },
    { path: '/progress', label: 'Progreso', icon: 'progress' },
  ]

  return (
    <div className="h-20 flex-shrink-0 border-t border-line flex items-start pt-3 safe-bottom">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex-1 flex flex-col items-center gap-1 text-[10px] tracking-wider no-select ${
              isActive ? 'text-fg' : 'text-muted'
            }`}
          >
            <TabIcon name={tab.icon} />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
