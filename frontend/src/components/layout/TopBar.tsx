// frontend/src/components/layout/TopBar.tsx

import { User } from 'lucide-react'
import { PAGE_TITLES, type UserRole } from '../../types/navigation'

interface TopBarProps {
  activeModule: string
  userName: string
  userRole: UserRole
}

export default function TopBar({ activeModule, userName }: TopBarProps) {
  const title = PAGE_TITLES[activeModule] || 'Plasm'

  return (
    <header
      className="flex items-center justify-between px-6 flex-none"
      style={{
        height: 56,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <h1 style={{ fontWeight: 700, fontSize: 18, lineHeight: '28px' }}>
        {title}
      </h1>

      <div className="flex items-center gap-3">
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{userName}</span>
        <div
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--surface-raised)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <User size={16} color="var(--text-secondary)" />
        </div>
      </div>
    </header>
  )
}