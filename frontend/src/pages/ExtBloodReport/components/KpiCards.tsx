// frontend/src/pages/ExtBloodReport/components/KpiCards.tsx
//
// KPI 4 ใบ + เปรียบเทียบกับช่วงก่อนหน้า (ความยาวเท่ากัน)

import { Building2, ClipboardCheck, Droplets, FlaskConical, Minus, type LucideIcon } from 'lucide-react'
import { fmtInt, fmtLiters, formatThaiRange } from '../services/reportHelpers'
import type { ReportKpi, ReportRange } from '../services/ReportType'

interface Props {
  kpi: ReportKpi
  prev: ReportKpi
  range: ReportRange
}

interface CardDef {
  key: keyof ReportKpi
  label: string
  unit: string
  icon: LucideIcon
  format: (n: number) => string
}

const CARDS: CardDef[] = [
  { key: 'bags', label: 'ถุงทั้งหมด', unit: 'ถุง', icon: Droplets, format: fmtInt },
  { key: 'volumeMl', label: 'ปริมาตรรวม', unit: 'ลิตร', icon: FlaskConical, format: fmtLiters },
  { key: 'sources', label: 'แหล่งที่มา', unit: 'แห่ง', icon: Building2, format: fmtInt },
  { key: 'receipts', label: 'ครั้งที่รับ', unit: 'ครั้ง', icon: ClipboardCheck, format: fmtInt },
]

function Delta({ cur, prev }: { cur: number; prev: number }) {
  if (prev === 0) {
    return (
      <span className="rpt-kpi__delta rpt-kpi__delta--flat">
        <Minus size={12} aria-hidden="true" />
        {cur === 0 ? 'เท่ากับช่วงก่อนหน้า' : 'ช่วงก่อนหน้าไม่มีข้อมูล'}
      </span>
    )
  }
  const diff = ((cur - prev) / prev) * 100
  if (Math.abs(diff) < 0.05) {
    return (
      <span className="rpt-kpi__delta rpt-kpi__delta--flat">
        <Minus size={12} aria-hidden="true" />
        เท่ากับช่วงก่อนหน้า
      </span>
    )
  }
  const up = diff > 0
  return (
    <span className={`rpt-kpi__delta rpt-kpi__delta--${up ? 'up' : 'down'}`}>
      <span aria-hidden="true">{up ? '▲' : '▼'}</span>
      <span className="rpt-sr">{up ? 'เพิ่มขึ้น' : 'ลดลง'}</span> {Math.abs(diff).toLocaleString('th-TH', { maximumFractionDigits: 1 })}%
      <span className="rpt-kpi__delta-note">เทียบช่วงก่อนหน้า</span>
    </span>
  )
}

export default function KpiCards({ kpi, prev, range }: Props) {
  const prevLabel = `ช่วงก่อนหน้า: ${formatThaiRange(range.prevFrom, range.prevTo)}`
  return (
    <div className="rpt-kpis">
      {CARDS.map((c) => {
        const Icon = c.icon
        return (
          <div key={c.key} className="rpt-kpi" title={prevLabel}>
            <div className="rpt-kpi__head">
              <span className="rpt-kpi__icon"><Icon size={16} aria-hidden="true" /></span>
              <span className="rpt-kpi__label">{c.label}</span>
            </div>
            <div className="rpt-kpi__value">
              {c.format(kpi[c.key])} <span className="rpt-kpi__unit">{c.unit}</span>
            </div>
            <Delta cur={kpi[c.key]} prev={prev[c.key]} />
          </div>
        )
      })}
    </div>
  )
}
