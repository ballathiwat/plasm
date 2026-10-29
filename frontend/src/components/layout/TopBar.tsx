// ============================================================
//  frontend/src/components/layout/TopBar.tsx
// ============================================================

import { useState, useRef, useEffect } from 'react'
import { User, ChevronDown, UserCircle } from 'lucide-react'
import { PAGE_TITLES, type UserRole } from '../../types/navigation'

interface TopBarProps {
  activeModule: string
  userName: string
  userRole: UserRole
  onNavigate?: (key: string) => void
}

export default function TopBar({ activeModule, userName, userRole, onNavigate }: TopBarProps) {
  const title = PAGE_TITLES[activeModule] || 'Plasm'
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

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

      {/* User menu */}
      <div ref={menuRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px 8px', borderRadius: 'var(--radius-md, 8px)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-raised, #F4F4F5)' }}
          onMouseLeave={(e) => { if (!showMenu) e.currentTarget.style.background = 'none' }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
            {userName}
          </span>
          <div
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--surface-raised)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <User size={16} color="var(--text-secondary)" />
          </div>
          <ChevronDown
            size={14}
            color="var(--text-secondary)"
            style={{
              transition: 'transform 0.15s',
              transform: showMenu ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>

        {/* Dropdown */}
        {showMenu && (
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 4,
            minWidth: 180,
            background: 'var(--surface, #fff)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md, 8px)',
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden',
            animation: 'plasm-fade-in 0.15s ease',
            zIndex: 50,
          }}>
            {/* User info */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{userName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                {userRole === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่'}
              </div>
            </div>

            {/* Menu items */}
            <button
              onClick={() => {
                setShowMenu(false)
                onNavigate?.('profile')
              }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 16px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, color: 'var(--text)', fontFamily: 'inherit',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-raised, #F4F4F5)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
            >
              <UserCircle size={16} color="var(--text-secondary)" />
              โปรไฟล์
            </button>
          </div>
        )}
      </div>
    </header>
  )
}