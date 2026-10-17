// frontend/src/pages/log/LogPage.tsx

import { ClipboardList } from 'lucide-react'

export default function LogPage() {
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
        <ClipboardList size={18} style={{ color: 'var(--color-primary)' }} />
        ประวัติการจัดเก็บ/นำออก
      </h3>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>บันทึกประวัติทุกรายการ</p>
    </div>
  )
}
