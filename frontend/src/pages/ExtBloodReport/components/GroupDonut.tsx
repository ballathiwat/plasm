// frontend/src/pages/ExtBloodReport/components/GroupDonut.tsx
//
// Donut สัดส่วนหมู่เลือด (ตาม code ของ master) — คลิกชิ้น/legend = toggle ตัวกรองหมู่เลือด

import type { CSSProperties, KeyboardEvent } from 'react'
import { aboColor, compareBloodGroup, fmtInt, fmtPct } from '../services/reportHelpers'
import type { GroupItem } from '../services/ReportType'

interface Props {
  groups: GroupItem[]
  selected?: string
  onToggle: (abo: string) => void
}

const SIZE = 160
const R = 58
const STROKE = 22
const C = 2 * Math.PI * R
const GAP = 2
const cssVars = (vars: Record<string, string>) => vars as CSSProperties

export default function GroupDonut({ groups, selected, onToggle }: Props) {
  // เรียง A, B, O, AB แล้วตามด้วยหมู่อื่น (ถ้ามี)
  const items = [...groups].sort((a, b) => compareBloodGroup(a.abo, b.abo))

  const total = items.reduce((s, g) => s + g.bags, 0)
  const rhNeg = items.reduce((s, g) => s + g.rhNegBags, 0)

  const onKey = (e: KeyboardEvent, abo: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onToggle(abo)
    }
  }

  let offset = 0
  const arcs = items
    .filter((g) => g.bags > 0)
    .map((g) => {
      const full = (g.bags / total) * C
      const len = Math.max(full - GAP, 1)
      const arc = { g, len, offset }
      offset += full
      return arc
    })

  return (
    <section className="rpt-card">
      <header className="rpt-card__head">
        <h3 className="rpt-card__title">สัดส่วนหมู่เลือด (ABO)</h3>
      </header>

      <div className="rpt-donut">
        <div className="rpt-donut__chart">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} role="group" aria-label="สัดส่วนหมู่เลือด">
            <circle className="rpt-donut__track" cx={SIZE / 2} cy={SIZE / 2} r={R} strokeWidth={STROKE} />
            {arcs.map(({ g, len, offset: off }) => (
              <circle
                key={g.abo}
                className={`rpt-donut__arc${selected && selected !== g.abo ? ' is-dim' : ''}`}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                strokeWidth={STROKE}
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={-off}
                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                style={cssVars({ '--c': aboColor(g.abo) })}
                role="button"
                tabIndex={0}
                aria-pressed={selected === g.abo}
                aria-label={`หมู่ ${g.abo}: ${fmtInt(g.bags)} ถุง (${fmtPct(g.bags, total)})`}
                onClick={() => onToggle(g.abo)}
                onKeyDown={(e) => onKey(e, g.abo)}
              />
            ))}
          </svg>
          <div className="rpt-donut__center">
            <strong>{fmtInt(total)}</strong>
            <span>ถุง</span>
          </div>
        </div>

        <ul className="rpt-donut__legend">
          {items.map((g) => (
            <li key={g.abo}>
              <button
                type="button"
                className={`rpt-donut__item${selected === g.abo ? ' is-selected' : ''}${selected && selected !== g.abo ? ' is-dim' : ''}`}
                aria-pressed={selected === g.abo}
                onClick={() => onToggle(g.abo)}
              >
                <span className="rpt-dot" style={cssVars({ '--c': aboColor(g.abo) })} />
                <span className="rpt-donut__name">หมู่ {g.abo}</span>
                <span className="rpt-donut__pct">{fmtPct(g.bags, total)}</span>
                <span className="rpt-donut__bags">{fmtInt(g.bags)} ถุง</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="rpt-donut__rh">
        Rh ลบ <strong>{fmtInt(rhNeg)} ถุง</strong> ({fmtPct(rhNeg, total)})
      </p>
    </section>
  )
}
