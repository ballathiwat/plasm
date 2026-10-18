// ============================================================
//  src/pages/storage/components/StorageBoxList.tsx
// ============================================================

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
}

export default function StorageBoxList({ boxes, loading }: Props) {
  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)',
      padding: '24px 28px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
        กล่องที่จัดเก็บแล้ว
      </h3>

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
          กำลังโหลด...
        </div>
      ) : boxes.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
          ยังไม่มีกล่องที่จัดเก็บ
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {boxes.map((box, idx) => (
            <div
              key={box.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom: idx < boxes.length - 1 ? '1px solid var(--border, #E4E4E7)' : 'none',
              }}
            >
              {/* Left: badge + label + units */}
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
                    fontSize: 13, color: 'var(--text-secondary)',
                    marginLeft: 10,
                  }}>
                    {box.units.length} units
                  </span>
                </div>
              </div>

              {/* Right: location badge */}
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
          ))}
        </div>
      )}
    </div>
  )
}