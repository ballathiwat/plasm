// ============================================================
//  src/pages/report/services/useReport.ts
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react'
import apiAdapter from '../../../helpers/http/apiAdapter'
import { MASTER_PLASMA_TYPES } from '../../../helpers/url_helper'
import reportService from './ReportService'
import type { ReportData, ReportFilters } from './ReportType'

const todayStr = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })

export default function useReport() {
  const [plasmaTypes, setPlasmaTypes] = useState<string[]>([])
  const [filters, setFilters] = useState<ReportFilters>({
    from: todayStr(),
    to: todayStr(),
    type: '',
  })

  const [activeType, setActiveType] = useState('')
  const [activeLabel, setActiveLabel] = useState('')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searched, setSearched] = useState(false)
  const didInitialFetch = useRef(false)

  const fetchReport = useCallback(async (f: ReportFilters) => {
    setLoading(true)
    setSearched(true)
    try {
      const data = await reportService.getReport({ from: f.from, to: f.to })


      setReportData(data)
      setActiveType(f.type)
      const fmtDate = (d: string) => d.split('-').reverse().join('/')
      setActiveLabel(`${f.type} · ${fmtDate(f.from)} — ${fmtDate(f.to)}`)
    } catch (err) {
      console.error('Report fetch error:', err)
      setReportData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    apiAdapter
      .get<{ code: string; active: boolean }[]>(MASTER_PLASMA_TYPES)
      .then((list) => {
        const codes = list.filter((t) => t.active).map((t) => t.code)
        setPlasmaTypes(codes)
        if (codes.length && !didInitialFetch.current) {
          didInitialFetch.current = true
          const initFilters: ReportFilters = {
            from: todayStr(),
            to: todayStr(),
            type: codes[0],
          }
          setFilters(initFilters)
          fetchReport(initFilters)
        } else {
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))
  }, [fetchReport])

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters((p) => ({ ...p, [key]: value }))
  }

  const handleSearch = () => {
    fetchReport(filters)
  }

  return {
    filters, plasmaTypes, reportData, loading, searched,
    activeType, activeLabel,
    handleFilterChange, handleSearch,
  }
}