// ============================================================
//  src/pages/rack/components/RackLevelPicker.tsx
//  เลือกชั้น 1–5 (1 = บนสุด) + mini map 5 คอลัมน์ × 4 ช่อง
// ============================================================

import { groupColor } from '../../../helpers/blood'
import { RACK_POSITIONS } from '../../../helpers/rack'
import type { RackLevel } from '../services/RackType'

function RackMini({ slots }: { slots: RackLevel['slots'] }) {
  const cnt: Record<string, number> = {}
  Object.values(slots).forEach((b) => { cnt[b.blood] = (cnt[b.blood] || 0) + 1 })
  const summary = Object.keys(cnt).length
    ? Object.entries(cnt).map(([g, n]) => `${g} ${n}`).join(' · ')
    : 'ว่างทั้งชั้น'

  const cell = (p: number) => {
    const b = slots[p]
    return (
      <span
        key={p}
        className={`rack-mini__cell${b ? ' rack-mini__cell--filled' : ''}`}
        style={b ? { background: groupColor(b.blood) } : undefined}
      />
    )
  }

  // แต่ละคอลัมน์: หลัง-บน, หลัง-ล่าง, เว้น, หน้า-บน, หน้า-ล่าง
  return (
    <span className="rack-mini" title={summary}>
      <span className="plasm-sr-only">{summary}</span>
      {[1, 2, 3, 4, 5].map((c) => (
        <span key={c} className="rack-mini__col" aria-hidden="true">
          {cell(c * 4)}
          {cell(c * 4 - 1)}
          <span className="rack-mini__gap" />
          {cell(c * 4 - 2)}
          {cell(c * 4 - 3)}
        </span>
      ))}
    </span>
  )
}

interface Props {
  code: string
  levels: RackLevel[]
  active: number
  bloodOrder: string[]
  onPick: (level: number) => void
}

export default function RackLevelPicker({ code, levels, active, bloodOrder, onPick }: Props) {
  return (
    <div>
      <div className="rack-label" id="rack-level-label">เลือกชั้น (1 = บนสุด)</div>
      <div className="rack-frame" role="radiogroup" aria-labelledby="rack-level-label" aria-label={`ชั้นของ Rack ${code}`}>
        {levels.map((l) => {
          const n = Object.keys(l.slots).length
          const on = l.level === active
          return (
            <button
              key={l.level}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              className="rack-level"
              onClick={() => onPick(l.level)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                  e.preventDefault()
                  const next = Math.min(levels.length, Math.max(1, l.level + (e.key === 'ArrowDown' ? 1 : -1)))
                  onPick(next)
                  const el = (e.currentTarget.parentElement?.children[next - 1] as HTMLElement | undefined)
                  el?.focus()
                }
              }}
            >
              <span className="rack-level__name">ชั้น {l.level}</span>
              <RackMini slots={l.slots} />
              <span className="rack-level__count">{n}/{RACK_POSITIONS}</span>
            </button>
          )
        })}
      </div>
      <div className="rack-legend">
        {bloodOrder.map((g) => (
          <span key={g} className="rack-legend__item">
            <span className="rack-legend__swatch" style={{ background: groupColor(g) }} />
            {g}
          </span>
        ))}
        <span className="rack-legend__item">
          <span className="rack-legend__swatch" style={{ border: '1px solid var(--border)' }} />
          ว่าง
        </span>
      </div>
    </div>
  )
}
