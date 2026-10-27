// src/pages/report/components/ReportFilters.tsx

import { Search } from 'lucide-react'
import type { ReportFilters as Filters, DateMode } from '../services/ReportType'

interface Props {
  filters: Filters
  loading: boolean
  onModeChange: (mode: DateMode) => void
  onChange: (key: keyof Filters, value: string) => void
  onSearch: () => void
}

const btnStyle = (active: boolean): React.CSSProperties => ({
  padding: '7px 16px',
  fontSize: 13,
  fontWeight: 600,
  fontFamily: 'inherit',
  borderRadius: 'var(--radius-md, 8px)',
  border: active ? '2px solid var(--primary, #2563EB)' : '1px solid var(--border, #E4E4E7)',
  background: active ? 'var(--primary-light, #EFF6FF)' : 'var(--surface, #fff)',
  color: active ? 'var(--primary, #2563EB)' : 'var(--text-secondary, #71717A)',
  cursor: 'pointer',
})

const inputStyle: React.CSSProperties = {
  padding: '7px 12px',
  fontSize: 13,
  border: '1px solid var(--border, #E4E4E7)',
  borderRadius: 'var(--radius-md, 8px)',
  background: 'var(--surface, #fff)',
  color: 'var(--text-primary, #18181B)',
  fontFamily: 'inherit',
  outline: 'none',
}

export default function ReportFilters({ filters, loading, onModeChange, onChange, onSearch }: Props) {
  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)',
      padding: '16px 20px',
      marginBottom: 16,
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 12,
    }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <button style={btnStyle(filters.mode === 'single')} onClick={() => onModeChange('single')}>
          วันเดียว
        </button>
        <button style={btnStyle(filters.mode === 'range')} onClick={() => onModeChange('range')}>
          ช่วงวันที่
        </button>
      </div>

      {filters.mode === 'single' ? (
        <input
          type="date"
          value={filters.date}
          onChange={(e) => onChange('date', e.target.value)}
          style={inputStyle}
        />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => onChange('from', e.target.value)}
            style={inputStyle}
          />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>ถึง</span>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => onChange('to', e.target.value)}
            style={inputStyle}
          />
        </div>
      )}

      <button
        onClick={onSearch}
        disabled={loading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 20px',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'inherit',
          borderRadius: 'var(--radius-md, 8px)',
          border: 'none',
          background: 'var(--primary, #2563EB)',
          color: '#fff',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Search size={14} />
        {loading ? 'กำลังโหลด...' : 'ค้นหา'}
      </button>
    </div>
  )
}