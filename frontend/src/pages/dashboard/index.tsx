// frontend/src/pages/dashboard/index.tsx

import useDashboard from './services/useDashboard'
import { useAuth } from '../../Routes/AuthProtected'
import DashboardOverview from './components/DashboardOverview'
import DashboardSkeleton from './components/DashboardSkeleton'
import DashboardMinList from './components/DashboardMinList'
import DashboardMinDetail from './components/DashboardMinDetail'
import DashboardMinEmpty from './components/DashboardMinEmpty'
import DashboardRecentActivity from './components/DashboardRecentActivity'
import '../../assets/styles/report-filters.css'
import '../../assets/styles/dashboard-min-stock.css'
import '../../assets/styles/dashboard-overview.css'

const DashboardPage = () => {
  const d = useDashboard()
  const { user } = useAuth()
  const isAdmin = user.role === 'ADMIN'

  if (d.loading) return <DashboardSkeleton />

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      <DashboardOverview d={d} />

      {d.statusError ? (
        <p className="dms-card dms-none" role="alert">โหลดสถานะสต็อกไม่สำเร็จ — ลองโหลดหน้านี้ใหม่อีกครั้ง</p>
      ) : !d.configured ? (
        <DashboardMinEmpty isAdmin={isAdmin} />
      ) : (
        <DashboardMinList d={d} isAdmin={isAdmin} />
      )}

      <DashboardRecentActivity entries={d.logEntries} />

      <DashboardMinDetail
        item={d.detail}
        typeName={d.types.find((t) => t.code === d.detail?.type)?.name ?? null}
        isAdmin={isAdmin}
        onClose={d.closeDetail}
      />
    </div>
  )
}

export default DashboardPage
