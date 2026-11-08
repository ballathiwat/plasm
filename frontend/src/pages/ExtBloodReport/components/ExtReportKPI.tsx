// frontend/src/pages/ExtBloodReport/components/ExtReportKPI.tsx
import { FileText, Package, PackageOpen, Timer } from 'lucide-react'
import type { ExtReportKPI as T } from '../services/ExtReportType'
const C = [{ k: 'totalReceived', l: 'รับเข้าทั้งหมด', i: FileText, c: '#2563EB', b: '#EFF6FF' },{ k: 'remaining', l: 'คงคลัง', i: Package, c: '#16A34A', b: '#F0FDF4' },{ k: 'totalExported', l: 'นำออกทั้งหมด', i: PackageOpen, c: '#8B5CF6', b: '#F5F3FF' },{ k: 'avgDaysToExport', l: 'เฉลี่ย (วัน)', i: Timer, c: '#F59E0B', b: '#FFFBEB' }] as const
export default function ExtReportKPI({ kpi }: { kpi: T }) {
  return <div className="ext-summary-grid" style={{ marginBottom: 20 }}>{C.map(c => { const I = c.i; const v = kpi[c.k as keyof T]; return (
    <div key={c.k} className="ext-summary-card"><div className="ext-summary-icon" style={{ background: c.b, color: c.c }}><I size={20} /></div><div><div className="ext-summary-value">{typeof v === 'number' ? (c.k === 'avgDaysToExport' ? v.toFixed(1) : v.toLocaleString()) : '-'}</div><div className="ext-summary-label">{c.l}</div></div></div>
  )})}</div>
}
