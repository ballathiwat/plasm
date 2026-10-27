// ============================================================
//  src/pages/report/components/ReportFilters.tsx
// ============================================================

import { Search } from 'lucide-react'
import type { ReportFilters as Filters } from '../services/ReportType'

interface Props {
  filters: Filters
  plasmaTypes: string[]
  loading: boolean
  onChange: (key: keyof Filters, value: string) => void
  onSearch: () => void
}

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

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-secondary, #71717A)',
  whiteSpace: 'nowrap',
}

export default function ReportFilters({
  filters, plasmaTypes, loading, onChange, onSearch,
}: Props) {
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
      {/* ชนิดพลาสมา — Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={labelStyle}>ชนิด:</span>
        <select
          value={filters.type}
          onChange={(e) => onChange('type', e.target.value)}
          style={{
            ...inputStyle,
            minWidth: 120,
            cursor: 'pointer',
            appearance: 'auto',
          }}
        >
          {!filters.type && <option value="">-- เลือก --</option>}
          {plasmaTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* วันที่ — ช่วง (จาก-ถึง) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={labelStyle}>ตั้งแต่:</span>
        <input
          type="date"
          value={filters.from}
          onChange={(e) => onChange('from', e.target.value)}
          style={inputStyle}
        />
        <span style={labelStyle}>ถึง:</span>
        <input
          type="date"
          value={filters.to}
          onChange={(e) => onChange('to', e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* ปุ่มค้นหา */}
      <button
        onClick={onSearch}
        disabled={loading || !filters.type}
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
          cursor: (loading || !filters.type) ? 'not-allowed' : 'pointer',
          opacity: (loading || !filters.type) ? 0.6 : 1,
          marginLeft: 'auto',
        }}
      >
        <Search size={14} />
        {loading ? 'กำลังโหลด...' : 'ค้นหา'}
      </button>
    </div>
  )
}