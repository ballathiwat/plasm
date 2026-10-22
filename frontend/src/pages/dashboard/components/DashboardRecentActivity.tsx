// ============================================================
//  src/pages/dashboard/components/DashboardRecentActivity.tsx
// ============================================================

import { Package, PackageOpen } from 'lucide-react'
import { groupSurface, type LogEntryItem } from '../services/DashboardType'
import { groupColor } from '../../../helpers/blood'


interface Props {
  entries: LogEntryItem[]
}

export default function DashboardRecentActivity({ entries }: Props) {
  return (
    <div style={{
      background: 'var(--surface, #fff)', border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)', boxShadow: 'var(--shadow-sm)', padding: 20,
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>รายการล่าสุด</h3>

      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '120px 100px 140px 70px 60px 1fr',
        gap: 8, padding: '8px 0',
        borderBottom: '1px solid var(--border, #E4E4E7)',
        fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #71717A)',
      }}>
        <span>เวลา</span>
        <span>การดำเนินการ</span>
        <span>กล่อง</span>
        <span>หมู่เลือด</span>
        <span>จำนวน</span>
        <span>รายละเอียด</span>
      </div>

      {entries.slice(0, 10).map((entry) => {
        const isStore = entry.action === 'store'
        const ts = new Date(entry.timestamp)
        const timeStr = ts.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
          + ' ' + ts.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })

        return (
          <div key={entry.id} style={{
            display: 'grid',
            gridTemplateColumns: '120px 100px 140px 70px 60px 1fr',
            gap: 8, padding: '10px 0',
            borderBottom: '1px solid var(--border, #E4E4E7)',
            fontSize: 13, alignItems: 'center',
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>{timeStr}</span>

            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 12, fontWeight: 600,
              color: isStore ? '#16A34A' : '#DC2626',
            }}>
              {isStore ? <Package size={13} /> : <PackageOpen size={13} />}
              {isStore ? 'จัดเก็บ' : 'นำออก'}
            </span>

            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              {entry.boxLabel}
            </span>

            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 22, borderRadius: 99,
              fontSize: 11, fontWeight: 600,
              background: groupSurface(entry.blood) || '#f0f0f0',
              color: groupColor(entry.blood) || '#666',
            }}>
              {entry.blood}
            </span>

            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              {entry.units?.length || 0}
            </span>

            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              {entry.detail}
            </span>
          </div>
        )
      })}

      {entries.length === 0 && (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
          ยังไม่มีรายการ
        </div>
      )}
    </div>
  )
}
