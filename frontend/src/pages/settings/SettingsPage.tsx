// frontend/src/pages/settings/SettingsPage.tsx

import { Settings } from 'lucide-react'

export default function SettingsPage() {
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
        <Settings size={18} style={{ color: 'var(--color-primary)' }} />
        ตั้งค่า
      </h3>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>ตั้งค่า minimum stock, ตำแหน่งชั้นวาง</p>
    </div>
  )
}
