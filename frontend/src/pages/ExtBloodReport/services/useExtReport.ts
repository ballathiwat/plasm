// frontend/src/pages/ExtBloodReport/services/useExtReport.ts
import { useState, useEffect, useCallback } from 'react'
import extReportService from './ExtReportService'
import type { ExtReportFilter, ExtReportKPI, ExtReportChartItem, ExtReportMatrixRow } from './ExtReportType'
import type { ExtSource } from '../../ExtBlood/services/ExtBloodType'

function defaultFilter(): ExtReportFilter {
  const n = new Date(); return { dateFrom: new Date(n.getFullYear(), n.getMonth(), 1).toISOString().slice(0, 10), dateTo: new Date(n.getFullYear(), n.getMonth() + 1, 0).toISOString().slice(0, 10) }
}
export default function useExtReport() {
  const [filter, setFilterRaw] = useState<ExtReportFilter>(defaultFilter)
  const [kpi, setKpi] = useState<ExtReportKPI | null>(null)
  const [chartData, setChartData] = useState<ExtReportChartItem[]>([])
  const [matrix, setMatrix] = useState<ExtReportMatrixRow[]>([])
  const [sources, setSources] = useState<ExtSource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { extReportService.getSources().then(s => setSources(s.filter(x => x.active))) }, [])
  const fetch = useCallback(async () => {
    setLoading(true); try { const r: any = await extReportService.getReport(filter); setKpi(r.kpi || null); setChartData(r.chart || []); setMatrix(r.matrix || []) } catch { setKpi(null); setChartData([]); setMatrix([]) } finally { setLoading(false) }
  }, [filter])
  useEffect(() => { fetch() }, [fetch])
  return { filter, setFilter: (f: Partial<ExtReportFilter>) => setFilterRaw(p => ({ ...p, ...f })), kpi, chartData, matrix, sources, loading }
}
