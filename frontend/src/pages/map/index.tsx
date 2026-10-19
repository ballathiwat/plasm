// ============================================================
//  src/pages/map/index.tsx
// ============================================================

import useMap from './services/useMap'
import MapRoomGrid from './components/MapRoomGrid'
import MapCabinetGrid from './components/MapCabinetGrid'

const MapPage = () => {
  const { room, cabinet, totalBoxes, totalUnits, loading } = useMap()

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังโหลด...</div>
  }

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
        {[
          { label: 'กล่องทั้งหมด', value: totalBoxes, color: 'var(--primary)' },
          { label: 'Unit ทั้งหมด', value: totalUnits, color: 'var(--group-b)' },
          { label: 'ห้อง -30°C', value: room.totalBoxes, color: 'var(--group-a)' },
          { label: 'ตู้ -30°C', value: cabinet.totalBoxes, color: 'var(--group-ab)' },
        ].map((item) => (
          <div key={item.label} style={{
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

      {/* Maps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        <MapRoomGrid data={room} />
        <MapCabinetGrid data={cabinet} />
      </div>
    </div>
  )
}

export default MapPage
