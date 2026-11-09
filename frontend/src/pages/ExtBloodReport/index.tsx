// frontend/src/pages/ExtBloodReport/index.tsx
import { useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import SelectDropdown, { type OptionType } from '../../components/common/SelectDropdown'
import DateInput from '../../components/common/DateInput'
import useExtReport from './services/useExtReport'
import ExtReportKPI from './components/ExtReportKPI'
import ExtReportChart from './components/ExtReportChart'
import ExtReportMatrix from './components/ExtReportMatrix'
import '../../assets/styles/ext-blood-report.css'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
const find = (opts: OptionType[], v?: string) => opts.find((o) => o.value === (v || '')) ?? null

export default function ExtBloodReportPage() {
  const { filter, setFilter, kpi, chartData, matrix, sources, products, loading } = useExtReport()

  const srcOpts = useMemo<OptionType[]>(
    () => [{ value: '', label: 'สถานที่ทั้งหมด' }, ...sources.map((s) => ({ value: s.id, label: s.name }))],
    [sources],
  )
  const prodOpts = useMemo<OptionType[]>(
    () => [{ value: '', label: 'ชนิดเลือดทั้งหมด' }, ...products.map((p) => ({ value: p.id, label: `${p.code}${p.name ? ` — ${p.name}` : ''}` }))],
    [products],
  )
  const grpOpts = useMemo<OptionType[]>(
    () => [{ value: '', label: 'หมู่เลือดทั้งหมด' }, ...BLOOD_GROUPS.map((g) => ({ value: g, label: g }))],
    [],
  )

  return (
    <div className="ext-report-page" style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      <h2 className="ext-title">รายงานรับเลือดจากภายนอก</h2>

      {/* ── Filters ── */}
      <div className="ext-report-filter">
        <div style={{ minWidth: 140 }}>
          <DateInput label="ตั้งแต่" value={filter.dateFrom} onChange={(iso) => setFilter({ dateFrom: iso })} />
        </div>
        <div style={{ minWidth: 140 }}>
          <DateInput label="ถึง" value={filter.dateTo} onChange={(iso) => setFilter({ dateTo: iso })} />
        </div>
        <div style={{ minWidth: 200 }}>
          <SelectDropdown
            label="สถานที่"
            options={srcOpts}
            value={find(srcOpts, filter.sourceId)}
            onChange={(opt) => setFilter({ sourceId: opt?.value || undefined })}
            isClearable={false}
            isSearchable={false}
          />
        </div>
        <div style={{ minWidth: 200 }}>
          <SelectDropdown
            label="ชนิดเลือด"
            options={prodOpts}
            value={find(prodOpts, filter.bloodProductId)}
            onChange={(opt) => setFilter({ bloodProductId: opt?.value || undefined })}
            isClearable={false}
            isSearchable={false}
          />
        </div>
        <div style={{ minWidth: 140 }}>
          <SelectDropdown
            label="หมู่เลือด"
            options={grpOpts}
            value={find(grpOpts, filter.bloodGroup)}
            onChange={(opt) => setFilter({ bloodGroup: opt?.value || undefined })}
            isClearable={false}
            isSearchable={false}
          />
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="ext-form-loading">
          <Loader2 size={32} className="ext-spin" color="var(--primary)" />
        </div>
      ) : (
        <>
          {kpi && <ExtReportKPI kpi={kpi} />}
          {chartData.length > 0 && <ExtReportChart data={chartData} />}
          {matrix.length > 0 && <ExtReportMatrix data={matrix} />}
        </>
      )}
    </div>
  )
}
