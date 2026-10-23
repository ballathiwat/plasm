// ============================================================
//  src/pages/map/index.tsx
// ============================================================

import useMap from './services/useMap'
import MapZoneCard from './components/MapZoneCard'

// สีการ์ดสรุปของแต่ละสถานที่ (วนซ้ำถ้ามีมากกว่านี้)
const ZONE_COLORS = ['var(--group-a)', 'var(--group-ab)', 'var(--group-o)', 'var(--group-other)']

const MapPage = () => {
  const { zones, bloodOrder, totalBoxes, totalUnits, loading } = useMap()

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังโหลด...</div>
  }

  const summaryCards = [
    { key: 'total-boxes', label: 'กล่องทั้งหมด', value: totalBoxes, color: 'var(--primary)' },
    { key: 'total-units', label: 'Unit ทั้งหมด', value: totalUnits, color: 'var(--group-b)' },
    ...zones.map((z, i) => ({
      key: z.id,
      label: z.name,
      value: z.totalBoxes,
      color: ZONE_COLORS[i % ZONE_COLORS.length],
    })),
  ]

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>แผนผังจัดเก็บ</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          ภาพรวมตำแหน่งจัดเก็บพลาสมา · รวม {totalBoxes} กล่อง · {totalUnits} units
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {summaryCards.map((item) => (
          <div key={item.key} style={{
            background: 'var(--surface, #fff)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '14px 18px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Maps — หนึ่งการ์ดต่อสถานที่ตาม master */}
      {zones.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
          ยังไม่มีสถานที่จัดเก็บ — เพิ่มได้ที่ ตั้งค่า › สถานที่จัดเก็บ
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
          {zones.map((z) => <MapZoneCard key={z.id} zone={z} bloodOrder={bloodOrder} />)}
        </div>
      )}
    </div>
  )
}

export default MapPage
