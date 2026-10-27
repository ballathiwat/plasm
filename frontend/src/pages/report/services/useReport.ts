// src/pages/report/services/useReport.ts

import { useState, useEffect, useCallback } from 'react'
import reportService from './ReportService'
import type { ReportData, ReportFilters, DateMode } from './ReportType'

const todayStr = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })

export default function useReport() {
  const [filters, setFilters] = useState<ReportFilters>({
    mode: 'single',
    date: todayStr(),
    from: todayStr(),
    to: todayStr(),
  })
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchReport = useCallback(async (f: ReportFilters) => {
    setLoading(true)
    try {
      const params: Record<string, string> =
        f.mode === 'single'
          ? { date: f.date }
          : { from: f.from, to: f.to }
      const data = await reportService.getReport(params)
      setReportData(data)
    } catch {
      setReportData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReport(filters)
  }, [])

  const handleModeChange = (mode: DateMode) => {
    setFilters((prev) => ({ ...prev, mode }))
  }

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    fetchReport(filters)
  }

  return { filters, reportData, loading, handleModeChange, handleFilterChange, handleSearch }
}