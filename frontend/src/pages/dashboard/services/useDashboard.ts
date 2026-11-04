// ============================================================
//  src/pages/dashboard/services/useDashboard.ts
// ============================================================

import { useState, useEffect } from 'react'
import dashboardService from './DashboardService'
import type { StockSummary, DailyData, LogEntryItem } from './DashboardType'
import { levelOf, sumBlood } from './DashboardType'

export default function useDashboard() {
  const [stockData, setStockData] = useState<StockSummary | null>(null)
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [logEntries, setLogEntries] = useState<LogEntryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardService.getStockSummary(),
      dashboardService.getStockDaily(7),
      dashboardService.getRecentLog(),
    ])
      .then(([stock, daily, log]) => {
        setStockData(stock)
        setDailyData(daily)
        setLogEntries(log)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const groups = stockData?.groups ?? []


  const total = stockData ? sumBlood(stockData.stocks) : 0

  const lowGroups = stockData
    ? groups.filter((g) => levelOf(stockData.stocks[g] || 0, stockData.minimum[g]) === 'danger')
    : []

  const warnGroups = stockData
    ? groups.filter((g) => levelOf(stockData.stocks[g] || 0, stockData.minimum[g]) === 'warning')
    : []

  const maxDailyValue = Math.max(
    ...dailyData.flatMap((d) => [sumBlood(d.store), sumBlood(d.withdraw)]),
    1,
  )

  return {
    stockData, dailyData, logEntries, loading,
    groups, total, lowGroups, warnGroups, maxDailyValue,
  }
}