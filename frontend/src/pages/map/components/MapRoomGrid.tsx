// ============================================================
//  src/pages/map/components/MapRoomGrid.tsx
// ============================================================

import type { BloodGroup } from '../../../types/models'
import type { LocationSummary } from '../services/MapType'
import { ROOM_LAYOUT } from '../services/MapType'

const GROUP_COLOR: Record<BloodGroup, string> = {
  A: '#3B82F6', B: '#10B981', O: '#F59E0B', AB: '#8B5CF6',
}

interface Props {
  data: LocationSummary
}

export default function MapRoomGrid({ data }: Props) {
  const shelfMap = Object.fromEntries(data.shelves.map((s) => [s.shelf, s]))

  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)',
      padding: 24, boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
          ห้อง -30°C
        </h3>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {data.totalBoxes} กล่อง · {data.totalUnits} units
        </span>
      </div>

      {/* 3x3 Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10, maxWidth: 480, margin: '0 auto',
      }}>
        {ROOM_LAYOUT.map((cell, idx) => {
          // Door cell
          if (cell.label === 'ประตู') {
            return (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 16, borderRadius: 'var(--radius-md, 8px)',
                border: '2px dashed var(--border, #E4E4E7)',
                color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500,
              }}>
                🚪 ประตู
              </div>
            )
          }

          // Empty center
          if (!cell.shelf) {
            return <div key={idx} />
          }

          // Shelf cell
          const shelf = shelfMap[cell.shelf]
          const hasBoxes = shelf && shelf.totalBoxes > 0

          return (
            <div key={idx} style={{
              padding: 14, borderRadius: 'var(--radius-md, 8px)',
              border: `1px solid ${hasBoxes ? 'var(--primary, #2563EB)' : 'var(--border, #E4E4E7)'}`,
              background: hasBoxes ? 'var(--group-a-surface, #DBEAFE)' : 'var(--surface-raised, #F4F4F5)',
              transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: hasBoxes ? 'var(--primary)' : 'var(--text-secondary)' }}>
                {cell.shelf}
              </div>
              {shelf ? (
                <>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    {shelf.totalBoxes} กล่อง · {shelf.totalUnits} u
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {(['A', 'B', 'O', 'AB'] as BloodGroup[]).map((g) => {
                      const count = shelf.byBlood[g]
                      if (!count) return null
                      return (
                        <span key={g} style={{
                          fontSize: 10, fontWeight: 700,
                          padding: '2px 6px', borderRadius: 99,
                          background: `${GROUP_COLOR[g]}20`,
                          color: GROUP_COLOR[g],
                        }}>
                          {g}:{count}
                        </span>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-disabled, #A1A1AA)' }}>ว่าง</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
