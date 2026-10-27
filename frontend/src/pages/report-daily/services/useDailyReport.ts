// frontend/src/pages/report-daily/services/useDailyReport.ts

import { useState, useEffect, useMemo } from 'react'
import dailyReportService from './DailyReportService'
import type { DailyData } from './DailyReportType'
import { sumBlood } from './DailyReportType'

export default function useDailyReport() {
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dailyReportService
      .getStockDaily(7)
      .then(setDailyData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const groups = useMemo(() => {
    const set = new Set<string>()
    for (const d of dailyData) {
      for (const g of [...Object.keys(d.store), ...Object.keys(d.withdraw)]) {
        set.add(g)
      }
    }
    return Array.from(set)
  }, [dailyData])

  const maxValue = Math.max(
    ...dailyData.flatMap((d) => [sumBlood(d.store), sumBlood(d.withdraw)]),
    1,
  )

  const totals = useMemo(() => {
    return dailyData.reduce(
      (acc, d) => {
        for (const g of groups) {
          acc.store[g] = (acc.store[g] || 0) + (d.store[g] || 0)
          acc.withdraw[g] = (acc.withdraw[g] || 0) + (d.withdraw[g] || 0)
        }
        return acc
      },
      { store: {} as Record<string, number>, withdraw: {} as Record<string, number> },
    )
  }, [dailyData, groups])

  return { dailyData, loading, groups, maxValue, totals }
}