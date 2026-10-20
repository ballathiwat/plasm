// ============================================================
//  src/pages/dashboard/components/DashboardHero.tsx
// ============================================================

import { Package, PackageOpen } from 'lucide-react'

interface Props {
  total: number
}

export default function DashboardHero({ total }: Props) {
  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: 'var(--radius-lg, 10px)',
      background: 'var(--primary, #2563EB)', color: '#fff',
      padding: '28px 28px', marginBottom: 16,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16, flexWrap: 'wrap',
    }}>
      <div style={{ position: 'absolute', right: -40, top: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
      <div style={{ position: 'absolute', right: 120, bottom: -80, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

      <div style={{ position: 'relative', flex: '1 1 320px' }}>
        <p style={{ fontSize: 14, opacity: 0.85 }}>สวัสดี, ผู้ดูแลระบบ</p>
        <p style={{ fontWeight: 700, fontSize: 28, lineHeight: 1.3, marginTop: 6 }}>
          สต็อกพลาสมารวม {total.toLocaleString()} units
        </p>
        <p style={{ fontSize: 13, marginTop: 8, opacity: 0.8 }}>
          อัปเดตล่าสุด {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น. · ห้อง -30°C และตู้ -30°C
        </p>
      </div>

      <div style={{ position: 'relative', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
          borderRadius: 'var(--radius-sm, 6px)', border: 'none',
          background: '#fff', color: 'var(--primary, #2563EB)',
          fontWeight: 600, fontSize: 13, cursor: 'pointer',
        }}>
          <Package size={14} /> จัดเก็บกล่องใหม่-2
        </button>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
          borderRadius: 'var(--radius-sm, 6px)',
          border: '1px solid rgba(255,255,255,0.6)', background: 'transparent', color: '#fff',
          fontWeight: 600, fontSize: 13, cursor: 'pointer',
        }}>
          <PackageOpen size={14} /> นำออก
        </button>
      </div>
    </section>
  )
}
