// frontend/src/components/layout/MainLayout.tsx

import { useState, type ReactNode } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import type { UserRole } from '../../types/navigation'

interface MainLayoutProps {
  children: ReactNode
  activeModule: string
  onNavigate: (key: string) => void
  role?: UserRole
  userName?: string
}

export default function MainLayout({
  children,
  activeModule,
  onNavigate,
  role = 'ADMIN',
  userName = 'ผู้ดูแลระบบ',
}: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        activeModule={activeModule}
        onNavigate={onNavigate}
        role={role}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <TopBar
          activeModule={activeModule}
          userName={userName}
          userRole={role}
        />

        <main
          className="flex-1 min-h-0 overflow-auto"
          style={{ padding: 'var(--space-7)', background: 'var(--bg)' }}
        >
          {children}
        </main>

        <BottomNav activeModule={activeModule} onNavigate={onNavigate} />
      </div>
    </div>
  )
}