// frontend/src/components/layout/Sidebar.tsx

import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { MENU_ITEMS, type UserRole } from '../../types/navigation'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  activeModule: string
  onNavigate: (key: string) => void
  role: UserRole
  onLogout?: () => void
}

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  activeModule,
  onNavigate,
  role,
  onLogout,
}: SidebarProps) {
  const filteredMenu = MENU_ITEMS.filter((m) => m.roles.includes(role))

  return (
    <aside
      className="hidden md:flex flex-col flex-none transition-all duration-150 ease-in-out overflow-hidden"
      style={{
        width: collapsed ? 68 : 240,
        background: 'var(--primary)',
        backgroundImage: 'url(/sidebar-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 10,
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex-none flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            P
          </div>
          {!collapsed && (
            <span style={{ fontWeight: 700, fontSize: 17, color: '#fff', whiteSpace: 'nowrap' }}>
              Plasm
            </span>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          aria-label="ย่อ/ขยายเมนู"
          style={{
            width: 24, height: 24, borderRadius: 'var(--radius-sm)',
            background: 'rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', border: 'none', flexShrink: 0, color: '#fff',
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
        {filteredMenu.map((item) => {
          const isActive = activeModule === item.key
          const Icon = item.icon
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              title={collapsed ? item.label : undefined}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                marginBottom: 2,
                background: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
                color: '#fff', fontSize: 14, fontWeight: 500,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon size={20} />
              {!collapsed && item.label}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '8px 8px 12px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <button
          onClick={onLogout}
          title={collapsed ? 'ออกจากระบบ' : undefined}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: collapsed ? '10px 0' : '10px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'rgba(255,255,255,0.7)',
            fontSize: 14, fontWeight: 500, transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
          }}
        >
          <LogOut size={20} />
          {!collapsed && 'ออกจากระบบ'}
        </button>
      </div>
    </aside>
  )
}