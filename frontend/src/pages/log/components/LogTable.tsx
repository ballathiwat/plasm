// ============================================================
//  src/pages/log/components/LogTable.tsx
// ============================================================

import { Package, PackageOpen, Pencil } from 'lucide-react'
import type { LogEntryItem } from '../services/LogType'
import { groupSurface, groupInk } from '../../../helpers/blood'
import { zoneLabel } from '../../../helpers/zone'
import { Pagination } from '../../../components/shared'
import type { PaginationInfo } from '../../../components/shared'

interface Props {
  entries: LogEntryItem[]
  loading: boolean
  pagination: PaginationInfo
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const actionMap: Record<string, { icon: typeof Package; label: string; color: string }> = {
  store:    { icon: Package,     label: 'จัดเก็บ',  color: '#16A34A' },
  withdraw: { icon: PackageOpen, label: 'นำออก',    color: '#DC2626' },
  edit:     { icon: Pencil,      label: 'แก้ไข',    color: '#D97706' },
}

export default function LogTable({ entries, loading, pagination, onPageChange, onPageSizeChange }: Props) {
  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '140px 90px 140px 70px 100px 1fr 100px',
        gap: 8, padding: '12px 20px',
        background: 'var(--surface-raised, #F4F4F5)',
        borderBottom: '1px solid var(--border)',
        fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #71717A)',
      }}>
        <span>เวลา</span>
        <span>การดำเนินการ</span>
        <span>กล่อง</span>
        <span>หมู่เลือด</span>
        <span>ตำแหน่ง</span>
        <span>รายละเอียด</span>
        <span>ผู้ดำเนินการ</span>
      </div>

      {/* Rows */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังโหลด...</div>
      ) : entries.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>ไม่พบรายการ</div>
      ) : (
        entries.map((entry) => {
          const act = actionMap[entry.action] || actionMap.store
          const Icon = act.icon
          const ts = new Date(entry.timestamp)
          const timeStr = ts.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
            + ' ' + ts.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })

          return (
            <div key={entry.id} style={{
              display: 'grid',
              gridTemplateColumns: '140px 90px 140px 70px 100px 1fr 100px',
              gap: 8, padding: '12px 20px',
              borderBottom: '1px solid var(--border)',
              fontSize: 13, alignItems: 'center',
            }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{timeStr}</span>

              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 12, fontWeight: 600, color: act.color,
              }}>
                <Icon size={13} />
                {act.label}
              </span>

              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12 }}>
                {entry.boxLabel}
              </span>

              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 22, borderRadius: 99,
                fontSize: 11, fontWeight: 700,
                background: groupSurface(entry.blood) || '#f0f0f0',
                color: groupInk(entry.blood) || '#666',
              }}>
                {entry.blood}
              </span>

              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {zoneLabel(entry.zoneName, entry.location)} {entry.shelf || ''}
              </span>

              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {entry.detail}
              </span>

              <span style={{ fontSize: 12, fontWeight: 500 }}>
                {entry.performedBy || '-'}
              </span>
            </div>
          )
        })
      )}

      {/* Pagination */}
      {!loading && entries.length > 0 && (
        <div style={{ padding: '0 20px' }}>
          <Pagination
            pagination={pagination}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}
    </div>
  )
}
