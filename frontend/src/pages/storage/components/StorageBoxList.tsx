// ============================================================
//  src/pages/storage/components/StorageBoxList.tsx
// ============================================================

import { useState } from 'react'
import { Printer, Search } from 'lucide-react'
import type { BloodGroup } from '../../../types/models'
import type { StorageBoxItem } from '../services/StorageType'

const GROUP_COLOR: Record<BloodGroup, string> = {
  A: 'var(--group-a, #3B82F6)', B: 'var(--group-b, #10B981)',
  O: 'var(--group-o, #F59E0B)', AB: 'var(--group-ab, #8B5CF6)',
}
const GROUP_SURFACE: Record<BloodGroup, string> = {
  A: 'var(--group-a-surface, #DBEAFE)', B: 'var(--group-b-surface, #D1FAE5)',
  O: 'var(--group-o-surface, #FEF3C7)', AB: 'var(--group-ab-surface, #EDE9FE)',
}

interface Props {
  boxes: StorageBoxItem[]
  loading: boolean
  onPrintBox: (box: StorageBoxItem) => void
}

export default function StorageBoxList({ boxes, loading, onPrintBox }: Props) {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = boxes.filter((b) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      b.boxLabel.toLowerCase().includes(q) ||
      b.blood.toLowerCase().includes(q) ||
      b.shelf.toLowerCase().includes(q) ||
      b.units.some((u) => u.toLowerCase().includes(q))
    )
  })

  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)',
      padding: '24px 28px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Header + Search */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16, gap: 12, flexWrap: 'wrap',
      }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
          กล่องที่จัดเก็บแล้ว
          <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 8 }}>
            {filtered.length}/{boxes.length}
          </span>
        </h3>

        <div style={{ position: 'relative', flex: '0 1 260px' }}>
          <Search size={14} style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
          }} />
          <input
            type="text"
            placeholder="ค้นหากล่อง, หมู่เลือด, unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px 8px 32px',
              border: '1px solid var(--border, #E4E4E7)',
              borderRadius: 'var(--radius-sm, 6px)',
              fontSize: 13, background: 'var(--surface, #fff)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
          กำลังโหลด...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
          {searchQuery ? `ไม่พบกล่องที่ตรงกับ "${searchQuery}"` : 'ยังไม่มีกล่องที่จัดเก็บ'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.map((box, idx) => (
            <div
              key={box.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom: idx < filtered.length - 1 ? '1px solid var(--border, #E4E4E7)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 34, height: 34, borderRadius: '50%',
                  background: GROUP_SURFACE[box.blood], color: GROUP_COLOR[box.blood],
                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                }}>
                  {box.blood}
                </span>
                <div>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}>
                    {box.boxLabel}
                  </span>
                  <span style={{
                    fontSize: 13, color: 'var(--text-secondary)', marginLeft: 10,
                  }}>
                    {box.units.length} units
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => onPrintBox(box)}
                  title="พิมพ์บาร์โค้ด"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid var(--border, #E4E4E7)',
                    background: 'transparent', cursor: 'pointer',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Printer size={14} />
                </button>

                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 14px', borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--border, #E4E4E7)',
                  fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                }}>
                  {box.location === 'room' ? 'ห้อง' : 'ตู้'} -30°C · {box.shelf}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}