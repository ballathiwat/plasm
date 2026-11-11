// frontend/src/components/layout/BottomNav.tsx

import { MOBILE_NAV_ITEMS } from '../../types/navigation'

interface BottomNavProps {
  activeModule: string
  onNavigate: (key: string) => void
}

export default function BottomNav({ activeModule, onNavigate }: BottomNavProps) {
  return (
    <nav
      className="md:hidden flex items-center justify-around flex-none"
      style={{
        height: 56,
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const isActive = activeModule === item.key
        const Icon = item.icon
        return (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontSize: 11,
              fontWeight: isActive ? 600 : 400,
              fontFamily: 'inherit',
            }}
          >
            <Icon size={20} />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
