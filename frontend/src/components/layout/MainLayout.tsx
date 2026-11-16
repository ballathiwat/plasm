// ============================================================
//  frontend/src/components/layout/MainLayout.tsx
// ============================================================

import { useCallback, useMemo, useState, type ReactNode } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import useNotificationCount from '../../helpers/useNotificationCount'
import useMinStockStatus from '../../helpers/useMinStockStatus'
import minStockService from '../../helpers/services/minStockService'
import type { MinStockStatusItem } from '../../helpers/minStock'
import type { UserRole } from '../../types/navigation'

interface MainLayoutProps {
  children: ReactNode
  activeModule: string
  onNavigate: (key: string) => void
  role?: UserRole
  userName?: string
  userId?: string
  onLogout?: () => void
}

export default function MainLayout({
  children, activeModule, onNavigate,
  role = 'ADMIN', userName = 'ผู้ดูแลระบบ', userId = '', onLogout,
}: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { approvalCount } = useNotificationCount()
  const { status, refetch } = useMinStockStatus()

  // แจ้งเตือนสต็อก: คู่ ชนิด × หมู่ ที่ ต่ำกว่าขั้นต่ำ / ใกล้ต่ำ — ข้อมูลชุดเดียวกับแดชบอร์ด
  const stockAlerts = useMemo(
    () => (status?.items ?? []).filter((i) => i.status === 'danger' || i.status === 'warning'),
    [status],
  )
  // รับทราบแล้ว = นับเป็นอ่านแล้ว ไม่รวมใน badge
  const totalCount = approvalCount + stockAlerts.filter((i) => !i.acknowledged).length

  const handleAcknowledge = useCallback(async (n: MinStockStatusItem) => {
    if (!n.notificationId) return
    try {
      await minStockService.acknowledge(n.notificationId)
    } finally {
      // สำเร็จ → ปุ่มหาย + badge ลด · ไม่สำเร็จ (เช่น สถานะเปลี่ยนไปแล้ว) → ดึงสถานะล่าสุดมาแสดงแทน
      await refetch()
    }
  }, [refetch])

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
          notificationCount={totalCount}
          approvalCount={approvalCount}
          stockAlerts={stockAlerts}
          onNotificationAcknowledge={handleAcknowledge}
          userId={userId}
        />
        <main className="flex-1 min-h-0 overflow-auto" style={{ padding: 24, background: 'var(--background)' }}>
          {children}
        </main>
        <BottomNav activeModule={activeModule} onNavigate={onNavigate} role={role} onLogout={onLogout} />
      </div>
    </div>
  )
}
