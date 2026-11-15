// ============================================================
//  src/pages/map/components/MapZoneCard.tsx
//  ผังของสถานที่ 1 แห่ง render ตาม master (ห้อง/ตู้/สถานที่ใหม่ใด ๆ)
//  - legacyKey 'ROOM' → ผังพื้นห้อง 3x3 + ชั้นที่ไม่อยู่ในผังแสดงต่อท้าย
//  - สถานที่อื่น      → รายการชั้นเรียงลง
//  ป้ายสี = จำนวน "กล่อง" แยกหมู่เลือด (ไม่ใช่ units)
// ============================================================

import { useNavigate } from 'react-router-dom'
import { DoorOpen } from 'lucide-react'
import type { ShelfSummary, ZoneSummary } from '../services/MapType'
import { ROOM_LAYOUT, ROOM_LEGACY_KEY } from '../services/MapType'
import { bloodBase } from '../../../helpers/blood'
import { rackUrl } from '../../../helpers/rack'
import '../map.css'

interface Props {
  zone: ZoneSummary
  bloodOrder: string[]
}

const num = (n: number) => n.toLocaleString('th-TH')
const stockText = (boxes: number, units: number) => `${num(boxes)} กล่อง · ${num(units)} units`

/** หมู่เลือดที่มีกล่อง เรียงตามลำดับ master */
const bloodCodes = (shelf: ShelfSummary, bloodOrder: string[]) =>
  Object.keys(shelf.byBloodBoxes)
    .filter((g) => shelf.byBloodBoxes[g] > 0)
    .sort((a, b) => bloodOrder.indexOf(a) - bloodOrder.indexOf(b))

/** "กล่องแยกหมู่เลือด: A 3 กล่อง, B 1 กล่อง" */
const bloodSummary = (shelf: ShelfSummary, bloodOrder: string[]) => {
  const codes = bloodCodes(shelf, bloodOrder)
  if (codes.length === 0) return ''
  return `กล่องแยกหมู่เลือด: ${codes.map((g) => `${g} ${num(shelf.byBloodBoxes[g])} กล่อง`).join(', ')}`
}

function BloodBadges({ shelf, bloodOrder, labelled }: { shelf: ShelfSummary; bloodOrder: string[]; labelled: boolean }) {
  const codes = bloodCodes(shelf, bloodOrder)
  if (codes.length === 0) return null

  return (
    <div
      className="map-blood-badges"
      {...(labelled ? { role: 'group', 'aria-label': bloodSummary(shelf, bloodOrder) } : {})}
    >
      {codes.map((g) => (
        <span key={g} className="blood-badge map-blood-badges__item" data-blood={bloodBase(g)}>
          {g} · {num(shelf.byBloodBoxes[g])}
        </span>
      ))}
    </div>
  )
}

// ── ช่องชั้นแบบการ์ดเล็ก (ใช้ในผังห้อง) — คลิกเพื่อเปิด rack ──
function ShelfTile({ code, shelf, bloodOrder }: { code: string; shelf: ShelfSummary | undefined; bloodOrder: string[] }) {
  const navigate = useNavigate()
  const hasBoxes = !!shelf && shelf.totalBoxes > 0
  const summary = shelf ? bloodSummary(shelf, bloodOrder) : ''

  return (
    <button
      type="button"
      className={`map-shelf-tile${hasBoxes ? ' map-shelf-tile--filled' : ''}`}
      onClick={() => navigate(rackUrl(code))}
      aria-label={`เปิด rack ${code}${shelf ? ` · ${stockText(shelf.totalBoxes, shelf.totalUnits)}` : ' · ว่าง'}${summary ? ` · ${summary}` : ''}`}
    >
      <div className="map-shelf-tile__code">{code}</div>
      <div className="map-shelf-tile__stock">
        {shelf ? stockText(shelf.totalBoxes, shelf.totalUnits) : 'ว่าง'}
      </div>
      {/* ปุ่มมี aria-label ครบแล้ว → ป้ายสีไม่ต้องมี label ซ้ำ */}
      {shelf && <BloodBadges shelf={shelf} bloodOrder={bloodOrder} labelled={false} />}
      <span className="map-shelf-tile__open">เปิด rack ›</span>
    </button>
  )
}

// ── ผังพื้นห้อง 3x3 + ชั้นเพิ่มเติม ──
function RoomBody({ zone, bloodOrder }: Props) {
  const shelfMap = Object.fromEntries(zone.shelves.map((s) => [s.shelf, s]))
  const layoutCodes = new Set(ROOM_LAYOUT.map((c) => c.shelf).filter(Boolean))
  const extras = zone.shelves.filter((s) => !layoutCodes.has(s.shelf))

  return (
    <>
      <div className="map-room">
        {ROOM_LAYOUT.map((cell, idx) => {
          if (cell.label === 'ประตู') {
            return (
              <div key={idx} className="map-room__door">
                <DoorOpen size={16} aria-hidden="true" /> ประตู
              </div>
            )
          }
          if (!cell.shelf) return <div key={idx} />
          return <ShelfTile key={idx} code={cell.shelf} shelf={shelfMap[cell.shelf]} bloodOrder={bloodOrder} />
        })}
      </div>

      {extras.length > 0 && (
        <div className="map-room__extras">
          <div className="map-room__extras-title">ชั้นอื่น ๆ</div>
          <div className="map-room">
            {extras.map((s) => (
              <ShelfTile key={s.shelf} code={s.shelf} shelf={s} bloodOrder={bloodOrder} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// ── รายการชั้นเรียงลง ──
function ListBody({ zone, bloodOrder }: Props) {
  if (zone.shelves.length === 0) {
    return <div className="map-zone__note">ยังไม่มีชั้นวาง</div>
  }

  return (
    <ul className="map-shelf-list">
      {zone.shelves.map((shelf) => (
        <li
          key={shelf.shelf}
          className={`map-shelf-row${shelf.totalBoxes > 0 ? ' map-shelf-row--filled' : ''}`}
        >
          <div>
            <span className="map-shelf-row__code">{shelf.shelf}</span>
            <span className="map-shelf-row__stock">{stockText(shelf.totalBoxes, shelf.totalUnits)}</span>
          </div>
          <BloodBadges shelf={shelf} bloodOrder={bloodOrder} labelled />
        </li>
      ))}
    </ul>
  )
}

export default function MapZoneCard({ zone, bloodOrder }: Props) {
  const isRoom = zone.legacyKey === ROOM_LEGACY_KEY

  return (
    <section className={`map-zone${zone.active ? '' : ' map-zone--inactive'}`} aria-label={`ผัง ${zone.name}`}>
      <div className="map-zone__head">
        <div className="map-zone__heading">
          <h3 className="map-zone__name">
            {zone.name}
            {!zone.active && <span className="map-zone__inactive">(ปิดใช้งาน)</span>}
          </h3>
          <p className="map-zone__note">
            {isRoom && 'คลิกที่ rack เพื่อดูกล่องในแต่ละชั้น (ชั้น 1–5) · '}
            ป้ายสี = จำนวนกล่องแยกหมู่เลือด
          </p>
        </div>
        <span className="map-zone__total">{stockText(zone.totalBoxes, zone.totalUnits)}</span>
      </div>

      {isRoom ? <RoomBody zone={zone} bloodOrder={bloodOrder} /> : <ListBody zone={zone} bloodOrder={bloodOrder} />}
    </section>
  )
}
