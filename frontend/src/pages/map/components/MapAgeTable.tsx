// ============================================================
//  src/pages/map/components/MapAgeTable.tsx
//  ตาราง "เก่าสุด / ใหม่สุด" แยกตาม ชนิดเลือด + หมู่เลือด
//  - container กว้าง ≥ 900px → ตาราง · แคบกว่า → การ์ดต่อแถว (วัดด้วย ResizeObserver)
//  - ไม่แสดงวันหมดอายุ · เลขกล่องไม่ใช้สีแดง/เขียว
// ============================================================

import { useEffect, useRef, useState } from 'react'
import { Building2, MapPin, RotateCcw } from 'lucide-react'
import Button from '../../../components/common/Button'
import { bloodBase } from '../../../helpers/blood'
import { formatThaiDate } from '../../ExtBlood/services/extHelpers'
import { SOURCE_DATE_LABEL, SOURCE_UNIT, daysAgoLabel } from '../services/mapAgeHelpers'
import type { AgeBox, AgeRow, MapSource } from '../services/MapType'

interface Props {
  source: MapSource
  rows: AgeRow[]
  /** มีตัวกรองที่กด "ค้นหา" แล้ว */
  hasFilter: boolean
  busy: boolean
  onClear: () => void
}

const CARD_BREAKPOINT = 900

const EMPTY_TEXT: Record<MapSource, string> = {
  in: 'ยังไม่มีกล่องที่จัดเก็บอยู่',
  ex: 'ยังไม่มีเลือดจากภายนอกในคลัง',
}

const num = (n: number) => n.toLocaleString('th-TH')

/** true เมื่อ container แคบกว่า breakpoint */
function useIsNarrow<T extends HTMLElement>(breakpoint: number) {
  const ref = useRef<T>(null)
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = (width: number) => setNarrow(width < breakpoint)
    update(el.getBoundingClientRect().width)
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) update(entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [breakpoint])

  return { ref, narrow }
}

function Dot({ kind }: { kind: 'oldest' | 'newest' }) {
  return <span className={`map-age__dot map-age__dot--${kind}`} aria-hidden="true" />
}

function BloodBadge({ blood }: { blood: string }) {
  return (
    <span className="blood-badge map-age__blood" data-blood={bloodBase(blood)}>
      {blood}
    </span>
  )
}

function Stock({ row, source }: { row: AgeRow; source: MapSource }) {
  return (
    <>
      <div className="map-age__stock-main">{num(row.boxes)} กล่อง</div>
      <div className="map-age__sub">
        {num(row.qty)} {SOURCE_UNIT[source]}
      </div>
    </>
  )
}

function BoxInfo({ box, source }: { box: AgeBox | null; source: MapSource }) {
  if (!box) return <span className="map-age__sub">มีกล่องเดียว</span>
  const ago = daysAgoLabel(box.date)
  const unit = SOURCE_UNIT[source]

  return (
    <div className="map-age__box">
      <div className="map-age__box-label">
        {box.boxLabel}
        {box.docNumber && <span className="map-age__doc">{box.docNumber}</span>}
      </div>
      {source === 'ex' && (
        <div className="map-age__sub map-age__line">
          <Building2 size={12} aria-hidden="true" />
          <span>{box.place || '-'}</span>
        </div>
      )}
      <div className="map-age__sub map-age__line">
        <MapPin size={12} aria-hidden="true" />
        <span>
          {source === 'in'
            ? [box.place, box.location].filter(Boolean).join(' · ')
            : box.location || '-'}
          {' · '}
          {num(box.qty)} {unit}
        </span>
      </div>
      <div className="map-age__sub">
        {SOURCE_DATE_LABEL[source]} <b className="map-age__date">{formatThaiDate(box.date)}</b>
        {ago && ` · ${ago}`}
      </div>
    </div>
  )
}

export default function MapAgeTable({ source, rows, hasFilter, busy, onClear }: Props) {
  const { ref, narrow } = useIsNarrow<HTMLDivElement>(CARD_BREAKPOINT)
  const rowKey = (r: AgeRow) => `${r.type}|${r.blood}`

  let content
  if (rows.length === 0) {
    content = busy ? null : (
      <div className="map-empty">
        {hasFilter ? (
          <>
            <p>ไม่พบรายการตามหมู่เลือด / ชนิดเลือดที่เลือก</p>
            <Button variant="outline" size="sm" icon={<RotateCcw size={14} />} onClick={onClear}>
              ล้างตัวกรอง
            </Button>
          </>
        ) : (
          <p>{EMPTY_TEXT[source]}</p>
        )}
      </div>
    )
  } else if (narrow) {
    content = (
      <ul className="map-age-cards">
        {rows.map((row) => (
          <li key={rowKey(row)} className="map-age-card">
            <div className="map-age-card__head">
              <span className="map-age-card__type">{row.type}</span>
              <BloodBadge blood={row.blood} />
              <div className="map-age-card__stock">
                <Stock row={row} source={source} />
              </div>
            </div>
            <div className="map-age-card__part">
              <div className="map-age-card__title">
                <Dot kind="oldest" /> เก่าสุด
              </div>
              <BoxInfo box={row.oldest} source={source} />
            </div>
            <div className="map-age-card__part">
              <div className="map-age-card__title">
                <Dot kind="newest" /> ใหม่สุด
              </div>
              <BoxInfo box={row.newest} source={source} />
            </div>
          </li>
        ))}
      </ul>
    )
  } else {
    content = (
      <div className="map-age">
        <table className="map-age__table">
          <colgroup>
            <col className="map-age__col-type" />
            <col className="map-age__col-blood" />
            <col className="map-age__col-stock" />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">ชนิดเลือด</th>
              <th scope="col">กรุ๊ป</th>
              <th scope="col" className="map-age__num">
                คงคลัง
              </th>
              <th scope="col">
                <Dot kind="oldest" /> เก่าสุด
              </th>
              <th scope="col">
                <Dot kind="newest" /> ใหม่สุด
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)}>
                <th scope="row">{row.type}</th>
                <td>
                  <BloodBadge blood={row.blood} />
                </td>
                <td className="map-age__num">
                  <Stock row={row} source={source} />
                </td>
                <td>
                  <BoxInfo box={row.oldest} source={source} />
                </td>
                <td>
                  <BoxInfo box={row.newest} source={source} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div ref={ref} className={`map-content${busy ? ' map-content--busy' : ''}`} aria-busy={busy}>
      {content}
    </div>
  )
}
