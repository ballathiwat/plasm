// frontend/src/pages/ExtBloodReport/services/useExtReport.ts
import { useState, useEffect, useCallback } from 'react'
import extBloodService from '../../ExtBlood/services/ExtBloodService'
import type { ExtSource, ExtBloodProduct } from '../../ExtBlood/services/ExtBloodType'
import type { ExtReportFilter, ExtReportKPI, ExtReportChartItem, ExtReportMatrixRow } from './ExtReportType'

// Default: ต้นเดือนนี้ → วันนี้
const today = () => new Date().toISOString().slice(0, 10)
const monthStart = () => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10) }

export default function useExtReport() {
  const [filter, setFilterRaw] = useState<ExtReportFilter>({ dateFrom: monthStart(), dateTo: today() })
  const [kpi, setKpi] = useState<ExtReportKPI | null>(null)
  const [chartData, setChartData] = useState<ExtReportChartItem[]>([])
  const [matrix, setMatrix] = useState<ExtReportMatrixRow[]>([])
  const [sources, setSources] = useState<ExtSource[]>([])
  const [products, setProducts] = useState<ExtBloodProduct[]>([])
  const [loading, setLoading] = useState(true)

  // Master data
  useEffect(() => {
    Promise.all([extBloodService.getSources(), extBloodService.getBloodProducts()])
      .then(([s, p]) => { setSources(s.filter((x) => x.active)); setProducts(p.filter((x) => x.active)) })
  }, [])

  const fetchReport = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (filter.dateFrom) params.dateFrom = filter.dateFrom
      if (filter.dateTo) params.dateTo = filter.dateTo
      if (filter.sourceId) params.sourceId = filter.sourceId
      if (filter.bloodProductId) params.bloodProductId = filter.bloodProductId
      if (filter.bloodGroup) params.bloodGroup = filter.bloodGroup
      const res = await extBloodService.getReport(params) as any
      setKpi(res.kpi ?? null)
      setChartData(res.chart ?? [])
      setMatrix(res.matrix ?? [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [filter])

  useEffect(() => { fetchReport() }, [fetchReport])

  const setFilter = (f: Partial<ExtReportFilter>) => setFilterRaw((p) => ({ ...p, ...f }))

  return { filter, setFilter, kpi, chartData, matrix, sources, products, loading }
}
