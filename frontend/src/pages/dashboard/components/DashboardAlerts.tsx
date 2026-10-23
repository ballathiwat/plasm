// ============================================================
//  src/pages/dashboard/components/DashboardAlerts.tsx
// ============================================================

import { AlertTriangle } from 'lucide-react'

interface Props {
  lowGroups: string[]
  warnGroups: string[]
}

export default function DashboardAlerts({ lowGroups, warnGroups }: Props) {
  if (lowGroups.length === 0 && warnGroups.length === 0) return null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 16 }}>
      {lowGroups.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 'var(--radius-md, 8px)',
          background: '#FEF2F2', border: '1px solid #FECACA',
        }}>
          <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#991B1B' }}>
            <strong>ต่ำกว่าขั้นต่ำ:</strong> หมู่เลือด {lowGroups.join(', ')} — ควรเติมสต็อกโดยเร็ว
          </span>
        </div>
      )}
      {warnGroups.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 'var(--radius-md, 8px)',
          background: '#FFFBEB', border: '1px solid #FDE68A',
        }}>
          <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#92400E' }}>
            <strong>ใกล้ขั้นต่ำ:</strong> หมู่เลือด {warnGroups.join(', ')} — เหลือไม่ถึง 120% ของขั้นต่ำ
          </span>
        </div>
      )}
    </div>
  )
}
