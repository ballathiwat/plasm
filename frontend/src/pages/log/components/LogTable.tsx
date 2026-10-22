// ============================================================
//  src/pages/log/components/LogTable.tsx
// ============================================================

import { Package, PackageOpen } from 'lucide-react'
import type { LogEntryItem } from '../services/LogType'

const GROUP_COLOR: Record<string, string> = {
  A: 'var(--group-a, #3B82F6)', B: 'var(--group-b, #10B981)',
  O: 'var(--group-o, #F59E0B)', AB: 'var(--group-ab, #8B5CF6)',
}
const GROUP_SURFACE: Record<string, string> = {
  A: 'var(--group-a-surface, #DBEAFE)', B: 'var(--group-b-surface, #D1FAE5)',
  O: 'var(--group-o-surface, #FEF3C7)', AB: 'var(--group-ab-surface, #EDE9FE)',
}

interface Props {
  entries: LogEntryItem[]
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
}

export default function LogTable({ entries, loading, hasMore, onLoadMore }: Props) {
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
      {loading && entries.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังโหลด...</div>
      ) : entries.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>ไม่พบรายการ</div>
      ) : (
        <>
          {entries.map((entry) => {
            const isStore = entry.action === 'store'
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
                {/* Time */}
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{timeStr}</span>

                {/* Action */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 12, fontWeight: 600,
                  color: isStore ? '#16A34A' : '#DC2626',
                }}>
                  {isStore ? <Package size={13} /> : <PackageOpen size={13} />}
                  {isStore ? 'จัดเก็บ' : 'นำออก'}
                </span>

                {/* Box */}
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12 }}>
                  {entry.boxLabel}
                </span>

                {/* Blood */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 30, height: 22, borderRadius: 99,
                  fontSize: 11, fontWeight: 700,
                  background: GROUP_SURFACE[entry.blood] || '#f0f0f0',
                  color: GROUP_COLOR[entry.blood] || '#666',
                }}>
                  {entry.blood}
                </span>

                {/* Location */}
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {entry.location === 'room' ? 'ห้อง' : entry.location === 'cabinet' ? 'ตู้' : '-'} {entry.shelf || ''}
                </span>

                {/* Detail */}
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {entry.detail}
                </span>

                {/* Performed by */}
                <span style={{ fontSize: 12, fontWeight: 500 }}>
                  {entry.performedBy || '-'}
                </span>
              </div>
            )
          })}

          {/* Load more */}
          {hasMore && (
            <div style={{ padding: 16, textAlign: 'center' }}>
              <button onClick={onLoadMore} style={{
                padding: '8px 24px', borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--border)', background: 'transparent',
                fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer',
              }}>
                {loading ? 'กำลังโหลด...' : 'โหลดเพิ่ม'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
