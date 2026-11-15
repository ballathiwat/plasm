// ============================================================
//  src/pages/map/components/MapSourceToggle.tsx
//  ตัวเลือกคลัง ภายใน / ภายนอก — segmented radiogroup
//  roving tabindex: Tab เข้าได้เฉพาะตัวที่เลือกอยู่ · ลูกศรสลับตัวเลือก
// ============================================================

import { useRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { Truck, Warehouse } from 'lucide-react'
import type { MapSource } from '../services/MapType'

interface Props {
  value: MapSource
  onChange: (source: MapSource) => void
}

const OPTIONS: { value: MapSource; label: string; hint: string; icon: ReactNode }[] = [
  { value: 'in', label: 'ภายใน', hint: 'กล่องพลาสมา', icon: <Warehouse size={16} /> },
  { value: 'ex', label: 'ภายนอก', hint: 'รับจากภายนอก', icon: <Truck size={16} /> },
]

const NEXT_KEYS = ['ArrowRight', 'ArrowDown']
const PREV_KEYS = ['ArrowLeft', 'ArrowUp']

export default function MapSourceToggle({ value, onChange }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = NEXT_KEYS.includes(e.key) ? 1 : PREV_KEYS.includes(e.key) ? -1 : 0
    if (step === 0) return
    e.preventDefault()
    const next = (index + step + OPTIONS.length) % OPTIONS.length
    onChange(OPTIONS[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div className="map-source">
      <span className="map-source__label" id="map-source-label">
        คลัง
      </span>
      <div className="map-source__group" role="radiogroup" aria-labelledby="map-source-label">
        {OPTIONS.map((o, i) => {
          const checked = o.value === value
          return (
            <button
              key={o.value}
              ref={(el) => {
                refs.current[i] = el
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              className={`map-source__option${checked ? ' map-source__option--checked' : ''}`}
              onClick={() => onChange(o.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
            >
              <span className="map-source__icon" aria-hidden="true">
                {o.icon}
              </span>
              <span className="map-source__text">
                <span className="map-source__name">{o.label}</span>
                <span className="map-source__hint">{o.hint}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
