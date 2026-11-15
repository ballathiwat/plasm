// ============================================================
//  frontend/src/pages/storage/components/RackSlotPicker.tsx
//  เลือกชั้น (1–5) + ช่อง (1–20) ของ rack ห้อง -30°C
//  ใช้ร่วมกันระหว่าง StorageMoveModal และฟอร์มจัดเก็บ
// ============================================================

import { useId, type KeyboardEvent } from 'react'
import { LEVEL_LIST, POSITION_LIST } from '../../../helpers/rack'

interface Props {
  level: number | null
  position: number | null
  /** ช่องที่ว่างของชั้นนั้น */
  freeSlots: (level: number) => number[]
  /** หมายเลขกล่องที่วางอยู่ในช่อง (ถ้ามี) — ใช้ใน title / aria-label */
  occupantLabel?: (level: number, position: number) => string | undefined
  onLevelChange: (level: number) => void
  onPositionChange: (position: number) => void
  error?: string
  disabled?: boolean
}

/** ลูกศร = ย้าย focus ไปตัวเลือกถัดไปที่กดได้ แล้วเลือกทันที (พฤติกรรมของ radiogroup) */
const onArrowKeys = (e: KeyboardEvent<HTMLDivElement>) => {
  const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1
    : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
  if (!step) return
  const radios = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'))
  const i = radios.indexOf(document.activeElement as HTMLButtonElement)
  if (i < 0 || radios.length === 0) return
  e.preventDefault()
  const next = radios[(i + step + radios.length) % radios.length]
  next.focus()
  next.click()
}

export default function RackSlotPicker({
  level, position, freeSlots, occupantLabel, onLevelChange, onPositionChange, error, disabled = false,
}: Props) {
  const id = useId()
  const free = level ? freeSlots(level) : []
  const firstFreeLevel = LEVEL_LIST.find((lv) => freeSlots(lv).length > 0)
  const levelTabStop = level ?? firstFreeLevel
  const slotTabStop = position ?? free[0]

  return (
    <div className="sto-rack">
      <div className="sto-label" id={`${id}-level`}>ชั้น <span className="sto-req" aria-hidden="true">*</span></div>
      <div className="sto-rack__levels" role="radiogroup" aria-labelledby={`${id}-level`} onKeyDown={onArrowKeys}>
        {LEVEL_LIST.map((lv) => {
          const n = freeSlots(lv).length
          const on = lv === level
          return (
            <button
              key={lv}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={lv === levelTabStop ? 0 : -1}
              disabled={disabled || (n === 0 && !on)}
              className={`sto-rack__level ${on ? 'is-on' : ''}`}
              onClick={() => onLevelChange(lv)}
            >
              <span className="sto-rack__level-name">ชั้น {lv}</span>
              <span className="sto-rack__level-free">{n === 0 ? 'เต็ม' : `ว่าง ${n}`}</span>
            </button>
          )
        })}
      </div>

      <div className="sto-rack__slots-head">
        <div className="sto-label" id={`${id}-slot`}>ช่อง <span className="sto-req" aria-hidden="true">*</span></div>
        <div className="sto-rack__legend" aria-hidden="true">
          <span><i className="sto-rack__key" /> ว่าง</span>
          <span><i className="sto-rack__key sto-rack__key--taken" /> มีกล่องแล้ว</span>
        </div>
      </div>
      <div className="sto-rack__slots" role="radiogroup" aria-labelledby={`${id}-slot`} onKeyDown={onArrowKeys}>
        {POSITION_LIST.map((p) => {
          const taken = !free.includes(p)
          const on = p === position && !taken
          const occupant = level && taken ? occupantLabel?.(level, p) : undefined
          const label = taken ? `ช่อง ${p} มีกล่อง${occupant ? ` ${occupant}` : 'แล้ว'}` : `ช่อง ${p} ว่าง`
          return (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={label}
              title={taken ? label : undefined}
              tabIndex={p === slotTabStop ? 0 : -1}
              disabled={disabled || !level || taken}
              className={`sto-rack__slot ${on ? 'is-on' : ''} ${taken ? 'is-taken' : ''}`}
              onClick={() => onPositionChange(p)}
            >
              {p}
            </button>
          )
        })}
      </div>
      {error && <p className="sto-error" role="alert">{error}</p>}
    </div>
  )
}
