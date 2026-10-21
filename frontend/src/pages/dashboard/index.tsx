// ============================================================
//  src/pages/dashboard/index.tsx
// ============================================================

import useDashboard from './services/useDashboard'
import DashboardHero from './components/DashboardHero'
import DashboardAlerts from './components/DashboardAlerts'
import DashboardStockCards from './components/DashboardStockCards'
import DashboardCharts from './components/DashboardCharts'
import DashboardDaily from './components/DashboardDaily'
import DashboardRecentActivity from './components/DashboardRecentActivity'

const DashboardPage = () => {
  const {
    stockData,
    dailyData,
    logEntries,
    loading,
    total,
    lowGroups,
    warnGroups,
    maxDailyValue,
  } = useDashboard()

  if (loading || !stockData) return null

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      <DashboardHero total={total} />
      <DashboardAlerts lowGroups={lowGroups} warnGroups={warnGroups} />
      <DashboardStockCards data={stockData} />
      <DashboardCharts stockData={stockData} />
      <DashboardDaily dailyData={dailyData} maxDailyValue={maxDailyValue} />
      <DashboardRecentActivity entries={logEntries} />
    </div>
  )
}

export default DashboardPage