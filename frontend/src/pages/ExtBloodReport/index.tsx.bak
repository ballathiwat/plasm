// frontend/src/pages/ExtBloodReport/index.tsx
import { Loader2 } from 'lucide-react'
import useExtReport from './services/useExtReport'
import ExtReportKPI from './components/ExtReportKPI'
import ExtReportChart from './components/ExtReportChart'
import ExtReportMatrix from './components/ExtReportMatrix'
import '../../assets/styles/ext-blood-report.css'

export default function ExtBloodReportPage() {
  const { filter, setFilter, kpi, chartData, matrix, sources, loading } = useExtReport()
  return (
    <div className="ext-report-page" style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      <h2 className="ext-title">รายงานรับเลือดจากภายนอก</h2>
      <div className="ext-report-filter">
        <div className="ext-filter-group"><input type="date" className="ext-filter-input" value={filter.dateFrom} onChange={e => setFilter({ dateFrom: e.target.value })} /><span className="ext-filter-dash">–</span><input type="date" className="ext-filter-input" value={filter.dateTo} onChange={e => setFilter({ dateTo: e.target.value })} /></div>
        <select className="ext-filter-select" value={filter.sourceId || ''} onChange={e => setFilter({ sourceId: e.target.value || undefined })}><option value="">สถานที่ทั้งหมด</option>{sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
      </div>
      {loading ? <div className="ext-form-loading"><Loader2 size={32} className="ext-spin" color="var(--primary)" /></div> : <>
        {kpi && <ExtReportKPI kpi={kpi} />}
        {chartData.length > 0 && <ExtReportChart data={chartData} />}
        {matrix.length > 0 && <ExtReportMatrix data={matrix} />}
      </>}
    </div>
  )
}
