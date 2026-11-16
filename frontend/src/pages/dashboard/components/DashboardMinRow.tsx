// frontend/src/pages/dashboard/components/DashboardMinRow.tsx
// 1 แถวของ accordion "สต็อกเทียบขั้นต่ำ" = 1 ชนิดเลือด
//   หัวแถว: chevron · รหัสชนิด · ป้ายสถานะ · คงเหลือรวม
//   เมื่อกาง: หมู่เลือดจัดเป็นกลุ่ม ABO (A · A+ · A−) — wrap ทีละกลุ่ม ไม่ตัดกลางกลุ่ม ไม่เลื่อนแนวนอน
import type { CSSProperties } from 'react'
import { ChevronRight, CircleCheck, CircleDashed } from 'lucide-react'
import MinStatusPill from '../../../components/common/MinStatusPill'
import { cellKey, pctLabel, MIN_STATUS, type MinStockStatusItem } from '../../../helpers/minStock'
import type { MinRow } from '../services/useDashboard'

interface Props {
  row: MinRow
  open: boolean
  passes: (i: MinStockStatusItem) => boolean
  highlight: string | null
  onToggle: () => void
  onOpen: (i: MinStockStatusItem) => void
}

/** เช่น "FFP หมู่ O−: คงเหลือ 12 จากขั้นต่ำ 20 (60%) — ต่ำกว่าขั้นต่ำ" */
const cellLabel = (i: MinStockStatusItem) =>
  i.minUnits == null
    ? `${i.type} หมู่ ${i.group}: คงเหลือ ${i.stock.toLocaleString()} — ยังไม่ได้ตั้งค่าขั้นต่ำ`
    : `${i.type} หมู่ ${i.group}: คงเหลือ ${i.stock.toLocaleString()} จากขั้นต่ำ ${i.minUnits.toLocaleString()} (${pctLabel(i.pct)}) — ${MIN_STATUS[i.status].label}`

function Cell({ item, highlight, onOpen }: { item: MinStockStatusItem; highlight: boolean; onOpen: () => void }) {
  const { status, stock, minUnits, pct } = item
  const problem = status === 'danger' || status === 'warning'
  const Icon = MIN_STATUS[status].icon
  const nums = minUnits == null ? stock.toLocaleString() : `${stock.toLocaleString()}/${minUnits.toLocaleString()}`
  const label = cellLabel(item)
  return (
    <button
      type="button"
      data-cell={cellKey(item.type, item.group)}
      className={`dms-cell dms-cell--${status} ms-status--${status}${highlight ? ' is-highlight' : ''}`}
      title={label}
      aria-label={label}
      onClick={onOpen}
    >
      <span className={`dms-cell__nums${nums.length > 9 ? ' dms-cell__nums--long' : ''}`}>{nums}</span>
      {problem && (
        <span className="dms-cell__pct">
          <Icon size={12} aria-hidden="true" />{pctLabel(pct)}
        </span>
      )}
    </button>
  )
}

export default function DashboardMinRow({ row, open, passes, highlight, onToggle, onOpen }: Props) {
  const { type, groups, danger, warning, total, unset } = row
  const bodyId = `dms-row-${type.code.replace(/[^\w-]/g, '_')}`

  return (
    <li className={`dms-row${danger + warning > 0 ? ' dms-row--problem' : ''}`}>
      <button
        type="button"
        className="dms-row__head"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={onToggle}
      >
        <ChevronRight size={16} className="dms-row__chev" aria-hidden="true" />
        <span className="dms-row__code" title={type.name ?? undefined}>{type.code}</span>
        <span className="dms-row__tags">
          {danger > 0 && <MinStatusPill status="danger" size="sm" label={`${MIN_STATUS.danger.label} ${danger}`} />}
          {warning > 0 && <MinStatusPill status="warning" size="sm" label={`${MIN_STATUS.warning.label} ${warning}`} />}
          {danger + warning === 0 && (unset
            ? <span className="dms-row__state ms-status--none"><CircleDashed size={14} aria-hidden="true" />ยังไม่ได้ตั้งค่า</span>
            : <span className="dms-row__state ms-status--normal"><CircleCheck size={14} aria-hidden="true" />ปกติทั้งหมด</span>)}
        </span>
        <span className="dms-row__total">คงเหลือรวม <strong>{total.toLocaleString()}</strong></span>
      </button>

      {open && (
        <div id={bodyId} className="dms-row__body">
          {groups.map((g) => (
            <div
              key={g.abo}
              className="dms-group"
              role="group"
              aria-label={`หมู่ ${g.abo}`}
              style={{ '--dms-cols': Math.min(g.cells.length, 3) } as CSSProperties}
            >
              {g.cells.map((c) => (
                <div key={c.group} className="dms-group__col">
                  <span className="dms-group__label" aria-hidden="true">{c.group}</span>
                  {passes(c)
                    ? <Cell item={c} highlight={highlight === cellKey(c.type, c.group)} onOpen={() => onOpen(c)} />
                    // ช่องที่ไม่ผ่านตัวกรอง — คงตำแหน่งไว้ให้กลุ่มไม่ขยับ
                    : <span className="dms-cell dms-cell--off" aria-hidden="true" />}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </li>
  )
}
