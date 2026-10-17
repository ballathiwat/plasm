// frontend/src/pages/withdraw/WithdrawPage.tsx

import { PackageOpen } from 'lucide-react'

export default function WithdrawPage() {
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
        <PackageOpen size={18} style={{ color: 'var(--color-primary)' }} />
        นำออกพลาสมา
      </h3>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>นำออกเป็นกล่อง หรือเป็น Unit</p>
    </div>
  )
}
