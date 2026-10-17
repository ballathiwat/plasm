// frontend/src/pages/map/MapPage.tsx

import { Map } from 'lucide-react'

export default function MapPage() {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Map size={18} style={{ color: 'var(--color-primary)' }} />
        แผนผังจัดเก็บ
      </h3>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>แผนผังห้อง -30°C (7 ตำแหน่ง) และตู้ -30°C</p>
    </div>
  )
}
