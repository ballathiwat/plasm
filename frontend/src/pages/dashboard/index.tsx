// frontend/src/pages/dashboard/index.tsx

import useDashboard from './services/useDashboard'
import DashboardHero from './components/DashboardHero'
import DashboardAlerts from './components/DashboardAlerts'
import DashboardStockCards from './components/DashboardStockCards'
import DashboardCharts from './components/DashboardCharts'
import DashboardRecentActivity from './components/DashboardRecentActivity'

const DashboardPage = () => {
  const {
    stockData, dailyData, logEntries, loading,
    total, lowGroups, warnGroups,
  } = useDashboard()

  if (loading || !stockData) return null

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      <DashboardHero total={total} dailyData={dailyData} />
      <DashboardAlerts lowGroups={lowGroups} warnGroups={warnGroups} />
      <DashboardStockCards data={stockData} />
      <DashboardCharts stockData={stockData} />
      <DashboardRecentActivity entries={logEntries} />
    </div>
  )
}

export default DashboardPage