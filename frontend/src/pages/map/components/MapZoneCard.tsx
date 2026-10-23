// ============================================================
//  src/pages/map/components/MapZoneCard.tsx
//  การ์ดสถานที่ 1 แห่ง render ตาม master (ห้อง/ตู้/สถานที่ใหม่ใด ๆ)
//  - legacyKey 'ROOM' → ผังพื้นห้อง 3x3 + ชั้นที่ไม่อยู่ในผังแสดงต่อท้าย
//  - สถานที่อื่น      → รายการชั้นเรียงลง
// ============================================================

import type { ShelfSummary, ZoneSummary } from '../services/MapType'
import { ROOM_LAYOUT, ROOM_LEGACY_KEY } from '../services/MapType'
import { bloodBase } from '../../../helpers/blood'

interface Props {
  zone: ZoneSummary
  bloodOrder: string[]
}

const cardStyle: React.CSSProperties = {
  background: 'var(--surface, #fff)',
  border: '1px solid var(--border, #E4E4E7)',
  borderRadius: 'var(--radius-lg, 10px)',
  padding: 24,
  boxShadow: 'var(--shadow-sm)',
}

function BloodBadges({ shelf, bloodOrder }: { shelf: ShelfSummary; bloodOrder: string[] }) {
  const codes = Object.keys(shelf.byBlood)
    .filter((g) => shelf.byBlood[g] > 0)
    .sort((a, b) => bloodOrder.indexOf(a) - bloodOrder.indexOf(b))

  return (
    <>
      {codes.map((g) => (
        <span
          key={g}
          className="blood-badge"
          data-blood={bloodBase(g)}
          style={{ fontSize: 10, padding: '2px 6px' }}
        >
          {g}:{shelf.byBlood[g]}
        </span>
      ))}
    </>
  )
}

// ── ช่องชั้นแบบการ์ดเล็ก (ใช้ในผังห้อง) ──
function ShelfTile({ code, shelf, bloodOrder }: { code: string; shelf: ShelfSummary | undefined; bloodOrder: string[] }) {
  const hasBoxes = !!shelf && shelf.totalBoxes > 0

  return (
    <div
      style={{
        padding: 14,
        borderRadius: 'var(--radius-md, 8px)',
        border: `1px solid ${hasBoxes ? 'var(--primary, #2563EB)' : 'var(--border, #E4E4E7)'}`,
        background: hasBoxes ? 'var(--group-a-surface, #DBEAFE)' : 'var(--surface-raised, #F4F4F5)',
        transition: 'all 0.15s',
      }}
    >
      <div style={{
        fontSize: 15, fontWeight: 700, marginBottom: 6,
        color: hasBoxes ? 'var(--primary)' : 'var(--text-secondary)',
      }}>
        {code}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
        {shelf ? `${shelf.totalBoxes} กล่อง · ${shelf.totalUnits} u` : 'ว่าง'}
      </div>
      {shelf && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <BloodBadges shelf={shelf} bloodOrder={bloodOrder} />
        </div>
      )}
    </div>
  )
}

// ── ผังพื้นห้อง 3x3 + ชั้นเพิ่มเติม ──
function RoomBody({ zone, bloodOrder }: Props) {
  const shelfMap = Object.fromEntries(zone.shelves.map((s) => [s.shelf, s]))
  const layoutCodes = new Set(ROOM_LAYOUT.map((c) => c.shelf).filter(Boolean))
  const extras = zone.shelves.filter((s) => !layoutCodes.has(s.shelf))

  return (
    <>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
        maxWidth: 480, margin: '0 auto',
      }}>
        {ROOM_LAYOUT.map((cell, idx) => {
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
          if (!cell.shelf) return <div key={idx} />
          return <ShelfTile key={idx} code={cell.shelf} shelf={shelfMap[cell.shelf]} bloodOrder={bloodOrder} />
        })}
      </div>

      {extras.length > 0 && (
        <div style={{ maxWidth: 480, margin: '20px auto 0' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            ชั้นอื่น ๆ
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {extras.map((s) => <ShelfTile key={s.shelf} code={s.shelf} shelf={s} bloodOrder={bloodOrder} />)}
          </div>
        </div>
      )}
    </>
  )
}

// ── รายการชั้นเรียงลง ──
function ListBody({ zone, bloodOrder }: Props) {
  if (zone.shelves.length === 0) {
    return <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>ยังไม่มีชั้นวาง</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {zone.shelves.map((shelf) => {
        const hasBoxes = shelf.totalBoxes > 0
        return (
          <div
            key={shelf.shelf}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 8, flexWrap: 'wrap', padding: '14px 18px',
              borderRadius: 'var(--radius-md, 8px)',
              border: `1px solid ${hasBoxes ? 'var(--primary, #2563EB)' : 'var(--border, #E4E4E7)'}`,
              background: hasBoxes ? 'var(--group-a-surface, #DBEAFE)' : 'var(--surface-raised, #F4F4F5)',
            }}
          >
            <div>
              <span style={{
                fontSize: 15, fontWeight: 700,
                color: hasBoxes ? 'var(--primary)' : 'var(--text-secondary)',
              }}>
                {shelf.shelf}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 12 }}>
                {shelf.totalBoxes} กล่อง · {shelf.totalUnits} units
              </span>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <BloodBadges shelf={shelf} bloodOrder={bloodOrder} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function MapZoneCard({ zone, bloodOrder }: Props) {
  return (
    <div style={{ ...cardStyle, opacity: zone.active ? 1 : 0.7 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, gap: 8, flexWrap: 'wrap',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
          {zone.name}
          {!zone.active && (
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginLeft: 8 }}>
              (ปิดใช้งาน)
            </span>
          )}
        </h3>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {zone.totalBoxes} กล่อง · {zone.totalUnits} units
        </span>
      </div>

      {zone.legacyKey === ROOM_LEGACY_KEY
        ? <RoomBody zone={zone} bloodOrder={bloodOrder} />
        : <ListBody zone={zone} bloodOrder={bloodOrder} />}
    </div>
  )
}
