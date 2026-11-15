// ============================================================
//  src/pages/map/components/MapZonePicker.tsx
//  ตัวเลือกสถานที่จัดเก็บของแท็บ "แผนผัง" (รองรับสถานที่จำนวนมาก)
//  radiogroup + roving tabindex: Tab เข้าได้เฉพาะตัวที่เลือกอยู่ · ลูกศรสลับตัวเลือก
// ============================================================

import { useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { Check } from 'lucide-react'
import type { ZoneSummary } from '../services/MapType'

interface Props {
  /** สถานที่ที่แสดงเป็นปุ่ม (เรียงกล่องมาก → น้อย) */
  zones: ZoneSummary[]
  /** สถานที่ 0 กล่องที่ถูกซ่อน → แสดงเป็นบรรทัดข้อความ */
  hiddenEmptyZones: ZoneSummary[]
  selectedId: string | null
  totalCount: number
  withBoxesCount: number
  emptyCount: number
  /** จำนวนกล่องของสถานที่ที่มากที่สุด — ฐานของแถบสัดส่วน */
  maxBoxes: number
  showEmpty: boolean
  onShowEmptyChange: (show: boolean) => void
  onSelect: (id: string) => void
}

const NEXT_KEYS = ['ArrowRight', 'ArrowDown']
const PREV_KEYS = ['ArrowLeft', 'ArrowUp']
const num = (n: number) => n.toLocaleString('th-TH')

export default function MapZonePicker({
  zones,
  hiddenEmptyZones,
  selectedId,
  totalCount,
  withBoxesCount,
  emptyCount,
  maxBoxes,
  showEmpty,
  onShowEmptyChange,
  onSelect,
}: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = NEXT_KEYS.includes(e.key) ? 1 : PREV_KEYS.includes(e.key) ? -1 : 0
    if (step === 0 || zones.length === 0) return
    e.preventDefault()
    const next = (index + step + zones.length) % zones.length
    onSelect(zones[next].id)
    refs.current[next]?.focus()
  }

  return (
    <section className="map-zones" aria-labelledby="map-zones-title">
      <div className="map-zones__head">
        <div className="map-zones__heading">
          <h3 className="map-zones__title" id="map-zones-title">
            สถานที่จัดเก็บ
          </h3>
          <span className="map-zones__count">
            · {num(totalCount)} แห่ง · มีกล่อง {num(withBoxesCount)} แห่ง
          </span>
        </div>
        {emptyCount > 0 && (
          <label className="map-zones__toggle">
            <input
              type="checkbox"
              checked={showEmpty}
              onChange={(e) => onShowEmptyChange(e.target.checked)}
            />
            <span>แสดงที่ว่าง {num(emptyCount)} แห่ง</span>
          </label>
        )}
      </div>

      <div className="map-zones__grid" role="radiogroup" aria-labelledby="map-zones-title">
        {zones.map((z, i) => {
          const checked = z.id === selectedId
          const ratio = maxBoxes > 0 ? Math.round((z.totalBoxes / maxBoxes) * 100) : 0
          return (
            <button
              key={z.id}
              ref={(el) => {
                refs.current[i] = el
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={`${z.name} · ${num(z.totalBoxes)} กล่อง${z.active ? '' : ' · ปิดใช้งาน'}`}
              tabIndex={checked ? 0 : -1}
              className={`map-zone-opt${checked ? ' map-zone-opt--checked' : ''}`}
              onClick={() => onSelect(z.id)}
              onKeyDown={(e) => handleKeyDown(e, i)}
            >
              <span className="map-zone-opt__mark" aria-hidden="true">
                {checked && <Check size={12} strokeWidth={3} />}
              </span>
              <span className="map-zone-opt__main">
                <span className="map-zone-opt__row">
                  <span className="map-zone-opt__name" title={z.name}>
                    {z.name}
                  </span>
                  <span className="map-zone-opt__boxes">{num(z.totalBoxes)} กล่อง</span>
                </span>
                <span className="map-zone-opt__bar" aria-hidden="true">
                  <span className="map-zone-opt__bar-fill" style={{ width: `${ratio}%` }} />
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {hiddenEmptyZones.length > 0 && (
        <p className="map-zones__empty">
          ยังไม่มีกล่อง: {hiddenEmptyZones.map((z) => z.name).join(' · ')}
        </p>
      )}
    </section>
  )
}
