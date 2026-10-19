// ============================================================
//  src/pages/log/components/LogFiltersBar.tsx
// ============================================================

import { Filter, RotateCcw } from 'lucide-react'
import type { LogFilters } from '../services/LogType'

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid var(--border, #E4E4E7)',
  borderRadius: 'var(--radius-sm, 6px)',
  fontSize: 13,
  background: 'var(--surface, #fff)',
  color: 'var(--text-primary, #18181B)',
}

interface Props {
  filters: LogFilters
  onChange: (field: keyof LogFilters, value: string) => void
  onReset: () => void
}

export default function LogFiltersBar({ filters, onChange, onReset }: Props) {
  const hasFilter = filters.action || filters.blood || filters.dateFrom || filters.dateTo

  return (
    <div style={{
      display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center',
    }}>
      <Filter size={14} style={{ color: 'var(--text-secondary)' }} />

      <select value={filters.action} onChange={(e) => onChange('action', e.target.value)} style={inputStyle}>
        <option value="">ทุกการดำเนินการ</option>
        <option value="store">จัดเก็บ</option>
        <option value="withdraw">นำออก</option>
      </select>

      <select value={filters.blood} onChange={(e) => onChange('blood', e.target.value)} style={inputStyle}>
        <option value="">ทุกหมู่เลือด</option>
        {['A', 'B', 'O', 'AB'].map((g) => <option key={g} value={g}>{g}</option>)}
      </select>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>จาก</span>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange('dateFrom', e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ถึง</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange('dateTo', e.target.value)}
          style={inputStyle}
        />
      </div>

      {hasFilter && (
        <button onClick={onReset} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '7px 12px', borderRadius: 'var(--radius-sm, 6px)',
          border: '1px solid var(--border)', background: 'transparent',
          fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer',
        }}>
          <RotateCcw size={12} /> ล้าง
        </button>
      )}
    </div>
  )
}
