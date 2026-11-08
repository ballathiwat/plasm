// frontend/src/pages/ExtBlood/components/ExtSummaryCards.tsx
import { FileText, Package, Clock, PackageOpen } from 'lucide-react'
import type { ExtSummary } from '../services/ExtBloodType'

const CARDS = [
  { key: 'receivedThisMonth', label: 'รับเข้าเดือนนี้', icon: FileText, color: '#2563EB', bg: '#EFF6FF' },
  { key: 'remaining', label: 'คงคลัง', icon: Package, color: '#16A34A', bg: '#F0FDF4' },
  { key: 'pendingApproval', label: 'รออนุมัติ', icon: Clock, color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'exportedThisMonth', label: 'นำออกเดือนนี้', icon: PackageOpen, color: '#8B5CF6', bg: '#F5F3FF' },
] as const

export default function ExtSummaryCards({ summary }: { summary: ExtSummary }) {
  return (
    <div className="ext-summary-grid">
      {CARDS.map(c => {
        const Icon = c.icon
        return (
          <div key={c.key} className="ext-summary-card">
            <div className="ext-summary-icon" style={{ background: c.bg, color: c.color }}><Icon size={20} /></div>
            <div>
              <div className="ext-summary-value">{(summary[c.key as keyof ExtSummary] as number).toLocaleString()}</div>
              <div className="ext-summary-label">{c.label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
