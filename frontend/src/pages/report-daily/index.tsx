// frontend/src/pages/report-daily/index.tsx

import useDailyReport from './services/useDailyReport'
import DailyChart from './components/DailyChart'
import DailyTable from './components/DailyTable'

export default function DailyReportPage() {
  const { dailyData, loading, groups, maxValue, totals } = useDailyReport()

  if (loading) return null

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      <DailyChart dailyData={dailyData} groups={groups} maxValue={maxValue} />
      <DailyTable dailyData={dailyData} groups={groups} totals={totals} />
    </div>
  )
}