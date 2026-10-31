// ============================================================
//  src/pages/rack/components/BagStack.tsx
//  ลำดับถุงในกล่อง แสดงจากหลัง (10) ลงมาหน้า (1 = ฝาเปิด)
// ============================================================

import { X } from 'lucide-react'
import { groupInk, groupSurface } from '../../../helpers/blood'
import { BOX_CAPACITY } from '../../../helpers/rack'

interface Props {
  blood: string
  /** index 0 = ถุงที่ 1 (หน้า) */
  units: string[]
  /** unit ที่ค้นเจอ → กรอบ primary + pulse */
  highlight?: string | null
  /** โหมดกรอก: ช่องถัดไปเป็น "สแกนถัดไป" + ปุ่มลบถุงล่าสุด */
  fill?: boolean
  onRemoveLast?: () => void
}

export default function BagStack({ blood, units, highlight, fill, onRemoveLast }: Props) {
  const rows = Array.from({ length: BOX_CAPACITY }, (_, i) => BOX_CAPACITY - i)
  const ink = groupInk(blood)
  const surface = groupSurface(blood)

  return (
    <div>
      <div className="bag-stack__ends" aria-hidden="true">
        <span>หลัง</span>
        <span>ถุงที่</span>
      </div>
      <ol className="bag-stack" aria-label="ลำดับถุงในกล่อง จากหลังลงมาหน้า">
        {rows.map((n) => {
          const u = units[n - 1]
          const next = fill && n === units.length + 1
          const hl = !!u && u === highlight
          const cls = ['bag', u && 'bag--filled', next && 'bag--next', hl && 'bag--hl']
            .filter(Boolean)
            .join(' ')
          return (
            <li
              key={n}
              className={cls}
              aria-current={hl ? 'true' : undefined}
              style={u ? { background: surface } : undefined}
            >
              <span className="bag__no">{n}</span>
              {u ? (
                <span className="bag__unit" style={{ color: ink }}>{u}</span>
              ) : (
                <span className="bag__empty">{next ? 'สแกนถัดไป' : 'ว่าง'}</span>
              )}
              {fill && u && n === units.length && onRemoveLast && (
                <button type="button" className="bag__x" aria-label={`ลบถุงที่ ${n} (${u})`} onClick={onRemoveLast}>
                  <X size={13} />
                </button>
              )}
            </li>
          )
        })}
      </ol>
      <div className="bag-stack__foot">หน้า (เปิดฝา){fill ? ` · สแกน 1 → ${BOX_CAPACITY}` : ''}</div>
    </div>
  )
}
