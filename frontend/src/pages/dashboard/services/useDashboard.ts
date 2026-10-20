// ============================================================
//  src/pages/dashboard/services/useDashboard.ts
// ============================================================

import { useState, useEffect } from 'react'
import dashboardService from './DashboardService'
import type { StockSummary, DailyData, LogEntryItem } from './DashboardType'
import { BLOOD_GROUPS, levelOf } from './DashboardType'

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

  // Derived data
  const total = stockData
    ? BLOOD_GROUPS.reduce((s, g) => s + stockData.stocks[g], 0)
    : 0

  const lowGroups = stockData
    ? BLOOD_GROUPS.filter((g) => levelOf(stockData.stocks[g], stockData.minimum[g]) === 'danger')
    : []

  const warnGroups = stockData
    ? BLOOD_GROUPS.filter((g) => levelOf(stockData.stocks[g], stockData.minimum[g]) === 'warning')
    : []

  const maxDailyValue = Math.max(...dailyData.map((d) => d.value), 1)

  return {
    stockData,
    dailyData,
    logEntries,
    loading,
    total,
    lowGroups,
    warnGroups,
    maxDailyValue,
  }
}
