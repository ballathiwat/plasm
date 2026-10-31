// ============================================================
//  src/pages/rack/components/RackLevelPlan.tsx
//  ผังชั้น (มองจากด้านบน) — แถวหลัง/แถวหน้า × บน/ล่าง × 5 คอลัมน์
// ============================================================

import { ArrowDown, Lock } from 'lucide-react'
import { groupInk, groupSurface } from '../../../helpers/blood'
import { BOX_CAPACITY, RACK_POSITIONS, slotLabel } from '../../../helpers/rack'
import type { RackBox, RackLevel } from '../services/RackType'

interface SlotProps {
  p: number
  box?: RackBox
  selected: boolean
  pending: boolean
  lockedBy: string | null
  onSelect: (p: number) => void
}

function RackSlot({ p, box, selected, pending, lockedBy, onSelect }: SlotProps) {
  const ink = box ? groupInk(box.blood) : undefined
  const cls = [
    'rack-slot',
    !box && 'rack-slot--empty',
    selected && 'rack-slot--selected',
    pending && 'rack-slot--pending',
  ].filter(Boolean).join(' ')

  const aria =
    slotLabel(p) +
    (box ? ` · ${box.boxLabel} หมู่ ${box.blood} ${box.units.length} ถุง` : ' · ว่าง') +
    (lockedBy ? ` · ${lockedBy} กำลังแก้ไข` : '')

  return (
    <button
      type="button"
      className={cls}
      aria-pressed={selected}
      aria-label={aria}
      onClick={() => onSelect(p)}
      style={box ? { background: groupSurface(box.blood) } : undefined}
    >
      {lockedBy && (
        <span className="rack-slot__lock" title={`${lockedBy} กำลังแก้ไขช่องนี้`} aria-hidden="true">
          <Lock size={11} />
        </span>
      )}
      <span className="rack-slot__top">
        <span className="rack-slot__no" style={ink ? { color: ink } : undefined}>{p}</span>
        {box && <span className="rack-slot__blood" style={{ color: ink }}>{box.blood}</span>}
      </span>
      {box ? (
        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span className="rack-slot__label" style={{ color: ink }}>{box.boxLabel.split(/[_-]/).pop()}</span>
          <span className="rack-slot__count" style={{ color: ink }}>{box.units.length}/{BOX_CAPACITY}</span>
        </span>
      ) : (
        <span className="rack-slot__empty">{pending ? 'วางที่นี่' : 'ว่าง'}</span>
      )}
    </button>
  )
}

interface Props {
  code: string
  level: RackLevel
  selected: number | null
  pending: number | null
  lockOf: (level: number, pos: number) => string | null
  onSelect: (p: number) => void
}

const COLS = [1, 2, 3, 4, 5]

export default function RackLevelPlan({ code, level, selected, pending, lockOf, onSelect }: Props) {
  const filled = Object.keys(level.slots).length

  const row = (tier: string, positions: number[]) => (
    <div className="rack-plan__row">
      <span className="rack-plan__tier">{tier}</span>
      <div className="rack-plan__cells">
        {positions.map((p) => (
          <RackSlot
            key={p}
            p={p}
            box={level.slots[p]}
            selected={selected === p}
            pending={pending === p}
            lockedBy={lockOf(level.level, p)}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ minWidth: 0 }}>
      <div className="rack-plan-head">
        <h4>
          {code}-{level.level}{' '}
          <small>· ชั้น {level.level} · {filled}/{RACK_POSITIONS} ช่อง</small>
        </h4>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>มองจากด้านบน</span>
      </div>
      <div className="rack-plan" key={level.level}>
        <div>
          <div className="rack-plan__section-title">แถวหลัง</div>
          {row('บน', COLS.map((c) => c * 4))}
          {row('ล่าง', COLS.map((c) => c * 4 - 1))}
        </div>
        <div className="rack-plan__divider" />
        <div>
          <div className="rack-plan__section-title">แถวหน้า</div>
          {row('บน', COLS.map((c) => c * 4 - 2))}
          {row('ล่าง', COLS.map((c) => c * 4 - 3))}
        </div>
        <div className="rack-plan__front">
          <ArrowDown size={14} />
          ด้านหน้า rack
        </div>
      </div>
    </div>
  )
}
