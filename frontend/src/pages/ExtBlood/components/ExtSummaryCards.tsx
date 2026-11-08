// frontend/src/pages/ExtBlood/components/ExtSummaryCards.tsx
import { FileText, Package, Clock, PackageOpen } from 'lucide-react'
import type { ExtSummary } from '../services/ExtBloodType'
import type { TabKey } from '../services/useExtBlood'

const CARDS = [
  { key: 'receivedThisMonth', label: 'เอกสารรับเข้าเดือนนี้', unit: 'เอกสาร', icon: FileText, color: '#2563EB', bg: '#EFF6FF', tab: 'ALL' },
  { key: 'remaining', label: 'ถุงคงคลัง', unit: 'ถุง', icon: Package, color: '#16A34A', bg: '#F0FDF4', tab: 'APPROVED' },
  { key: 'pendingApproval', label: 'เอกสารรออนุมัติ', unit: 'เอกสาร', icon: Clock, color: '#B45309', bg: '#FFFBEB', tab: 'PENDING' },
  { key: 'exportedThisMonth', label: 'ถุงนำออกเดือนนี้', unit: 'ถุง', icon: PackageOpen, color: '#7C3AED', bg: '#F5F3FF', tab: 'EXPORTED' },
] as const

export default function ExtSummaryCards({ summary, activeTab, onSelect }: { summary: ExtSummary; activeTab?: TabKey; onSelect?: (t: TabKey) => void }) {
  return (
    <div className="ext-summary-grid">
      {CARDS.map((c) => {
        const Icon = c.icon, v = summary[c.key as keyof ExtSummary] as number, on = activeTab === c.tab && c.tab !== 'ALL'
        return (
          <button key={c.key} type="button" className={`ext-summary-card ext-summary-card--btn ${on ? 'is-active' : ''}`} style={{ ['--c' as any]: c.color }}
            onClick={() => onSelect?.(c.tab as TabKey)} aria-label={`${c.label} ${v} ${c.unit} — ดูรายการ`}>
            <div className="ext-summary-icon" style={{ background: c.bg, color: c.color }}><Icon size={20} /></div>
            <div style={{ minWidth: 0 }}>
              <div className="ext-summary-value">{v.toLocaleString()} <span className="ext-summary-unit">{c.unit}</span></div>
              <div className="ext-summary-label">{c.label}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
