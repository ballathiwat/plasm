// frontend/src/pages/dashboard/index.tsx

import useDashboard from './services/useDashboard'
import { useAuth } from '../../Routes/AuthProtected'
import DashboardHero from './components/DashboardHero'
import DashboardMinBanner from './components/DashboardMinBanner'
import DashboardMinSummary from './components/DashboardMinSummary'
import DashboardMinMatrix from './components/DashboardMinMatrix'
import DashboardRefillList from './components/DashboardRefillList'
import DashboardMinDetail from './components/DashboardMinDetail'
import DashboardMinEmpty from './components/DashboardMinEmpty'
import DashboardRecentActivity from './components/DashboardRecentActivity'
import '../../assets/styles/dashboard-min-stock.css'

const DashboardPage = () => {
  const d = useDashboard()
  const { user } = useAuth()
  const isAdmin = user.role === 'ADMIN'

  if (d.loading) return null

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      {d.configured && <DashboardMinBanner items={d.dangerItems} onView={d.scrollToMatrix} />}
      <DashboardHero total={d.total} dailyData={d.dailyData} />

      {d.statusError ? (
        <p className="dms-card dms-none" role="alert">โหลดสถานะสต็อกไม่สำเร็จ — ลองโหลดหน้านี้ใหม่อีกครั้ง</p>
      ) : !d.configured ? (
        <DashboardMinEmpty isAdmin={isAdmin} />
      ) : (
        <>
          <DashboardMinSummary
            counts={d.counts}
            onlyDanger={d.onlyDanger}
            onToggleDanger={() => d.setOnlyDanger(!d.onlyDanger)}
          />
          <div className="dms-grid">
            <DashboardMinMatrix
              boxRef={d.matrixRef}
              types={d.types}
              rows={d.rows}
              columns={d.columns}
              passes={d.passes}
              anyVisible={d.anyVisible}
              noneCount={d.counts.none}
              highlight={d.highlight}
              isAdmin={isAdmin}
              typeFilter={d.typeFilter}
              groupFilter={d.groupFilter}
              onlyDanger={d.onlyDanger}
              onTypeFilter={d.setTypeFilter}
              onGroupFilter={d.setGroupFilter}
              onOnlyDanger={d.setOnlyDanger}
              onOpen={d.openDetail}
            />
            <DashboardRefillList items={d.refill} onOpen={d.openDetail} />
          </div>
        </>
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
