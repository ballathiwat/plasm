// ============================================================
//  frontend/src/components/layout/MainLayout.tsx
// ============================================================

import { useState, type ReactNode } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import type { UserRole } from '../../types/navigation'
import { useNavigate } from 'react-router-dom'
import useNotifications, { type NotificationItem } from '../../helpers/useNotifications'

interface MainLayoutProps {
  children: ReactNode
  activeModule: string
  onNavigate: (key: string) => void
  role?: UserRole
  userName?: string
  onLogout?: () => void
}

export default function MainLayout({
  children,
  activeModule,
  onNavigate,
  role = 'ADMIN',
  userName = 'ผู้ดูแลระบบ',
  onLogout,
}: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const { items: notifications, markRead } = useNotifications()
  const openNoti = (n: NotificationItem) => {
    if (n.group === 'info' && !n.read) markRead([n.id])
    if (n.target) navigate(n.target.path, { state: n.target.docId ? { openDocId: n.target.docId } : undefined })
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        activeModule={activeModule}
        onNavigate={onNavigate}
        role={role}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <TopBar
          activeModule={activeModule}
          userName={userName}
          userRole={role}
          onNavigate={onNavigate}
          notifications={notifications}
          onNotificationClick={openNoti}
          onMarkAllRead={() => markRead()}
        />

        <main className="flex-1 min-h-0 overflow-auto" style={{ padding: 24, background: 'var(--background)' }}>
          {children}
        </main>

        <BottomNav activeModule={activeModule} onNavigate={onNavigate} />
      </div>
    </div>
  )
}