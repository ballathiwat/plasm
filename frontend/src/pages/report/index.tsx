// src/pages/report/index.tsx

import { Package, PackageOpen, Archive } from 'lucide-react'
import useReport from './services/useReport'
import ReportFiltersBar from './components/ReportFilters'
import ReportChart from './components/ReportChart'
import ReportTable from './components/ReportTable'
import type { ReportData } from './services/ReportType'

function GrandTotalCards({ data }: { data: ReportData }) {
  let totalStored = 0
  let totalWithdrawn = 0
  let totalStock = 0

  for (const type of data.types) {
    for (const blood of data.bloods) {
      const d = data.data[type]?.[blood] || { stored: 0, withdrawn: 0 }
      totalStored += d.stored
      totalWithdrawn += d.withdrawn
      totalStock += (data.stock[type]?.[blood] || 0)
    }
  }

  const cards = [
    { label: 'จัดเก็บ', value: totalStored, color: '#16A34A', bg: '#F0FDF4', icon: Package },
    { label: 'นำออก', value: totalWithdrawn, color: '#DC2626', bg: '#FEF2F2', icon: PackageOpen },
    { label: 'คงเหลือในสต็อก', value: totalStock, color: '#2563EB', bg: '#EFF6FF', icon: Archive },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 12, marginBottom: 16,
    }}>
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <div key={c.label} style={{
            background: 'var(--surface, #fff)',
            border: '1px solid var(--border, #E4E4E7)',
            borderRadius: 'var(--radius-lg, 10px)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--radius-md, 8px)',
              background: c.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon size={20} color={c.color} />
            </div>
            <div>
              <div style={{
                fontSize: 24, fontWeight: 700, color: c.color,
                lineHeight: 1.1, fontVariantNumeric: 'tabular-nums',
              }}>
                {c.value.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                {c.label}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const ReportPage = () => {
  const {
    filters, reportData, loading,
    handleModeChange, handleFilterChange, handleSearch,
  } = useReport()

  const dateLabel =
    filters.mode === 'single'
      ? `วันที่ ${filters.date.split('-').reverse().join('/')}`
      : `${filters.from.split('-').reverse().join('/')} — ${filters.to.split('-').reverse().join('/')}`

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>รายงานสรุป</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          สรุปจำนวนจัดเก็บ / นำออก / คงเหลือ แยกตามชนิดพลาสมาและกรุ๊ปเลือด
        </p>
      </div>

      <ReportFiltersBar
        filters={filters}
        loading={loading}
        onModeChange={handleModeChange}
        onChange={handleFilterChange}
        onSearch={handleSearch}
      />

      {loading && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
          กำลังโหลดข้อมูล...
        </div>
      )}

      {!loading && reportData && (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
            แสดงข้อมูล: {dateLabel}
          </div>
          <GrandTotalCards data={reportData} />
          <ReportChart data={reportData} />
          <ReportTable data={reportData} />
        </>
      )}
    </div>
  )
}

export default ReportPage