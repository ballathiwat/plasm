// frontend/src/pages/dashboard/components/DashboardMinMatrix.tsx
// การ์ด "สต็อกเทียบขั้นต่ำ" — heatmap ชนิดเลือด × หมู่เลือด + ตัวกรอง (กรองทันที)
import { useMemo, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { Settings2 } from 'lucide-react'
import SelectDropdown, { type OptionType } from '../../../components/common/SelectDropdown'
import BloodGroupSelect from '../../../components/common/BloodGroupSelect'
import MinStatusPill from '../../../components/common/MinStatusPill'
import {
  cellKey, pctLabel, MIN_STATUS, SETTINGS_MIN_STOCK_PATH,
  type MinStatus, type MinStockStatusItem, type MinStockType,
} from '../../../helpers/minStock'
import type { MatrixRow } from '../services/useDashboard'

interface Props {
  boxRef: RefObject<HTMLDivElement | null>
  types: MinStockType[]
  rows: MatrixRow[]
  columns: string[]
  passes: (i: MinStockStatusItem) => boolean
  anyVisible: boolean
  noneCount: number
  highlight: string | null
  isAdmin: boolean
  typeFilter: string
  groupFilter: string
  onlyDanger: boolean
  onTypeFilter: (v: string) => void
  onGroupFilter: (v: string) => void
  onOnlyDanger: (v: boolean) => void
  onOpen: (i: MinStockStatusItem) => void
}

const LEGEND: MinStatus[] = ['danger', 'warning', 'normal', 'none']
/** สเกลแถบ 0–150% — เส้นขั้นต่ำอยู่ที่ 100% */
export const barWidth = (pct: number | null) => `${(Math.min(Math.max(pct ?? 0, 0), 1.5) / 1.5) * 100}%`

const cellLabel = (i: MinStockStatusItem) =>
  i.minUnits == null
    ? `${i.type} หมู่ ${i.group} — ${MIN_STATUS.none.label} คงเหลือ ${i.stock} unit`
    : `${i.type} หมู่ ${i.group} — ${MIN_STATUS[i.status].label} คงเหลือ ${i.stock} จากขั้นต่ำ ${i.minUnits} unit (${pctLabel(i.pct)} ของขั้นต่ำ)`

export default function DashboardMinMatrix({
  boxRef, types, rows, columns, passes, anyVisible, noneCount, highlight, isAdmin,
  typeFilter, groupFilter, onlyDanger, onTypeFilter, onGroupFilter, onOnlyDanger, onOpen,
}: Props) {
  const typeOptions = useMemo<OptionType[]>(
    () => [{ value: '', label: 'ทุกชนิด' }, ...types.map((t) => ({ value: t.code, label: t.code }))],
    [types],
  )

  return (
    <section ref={boxRef} className="dms-card" aria-labelledby="dms-matrix-title">
      <header className="dms-card__head">
        <h3 id="dms-matrix-title" className="dms-card__title">สต็อกเทียบขั้นต่ำ</h3>
        {isAdmin && (
          <Link to={SETTINGS_MIN_STOCK_PATH} className="dms-link">
            <Settings2 size={14} aria-hidden="true" />ตั้งค่าขั้นต่ำ
          </Link>
        )}
      </header>

      <div className="dms-filters">
        <SelectDropdown
          className="dms-filters__select"
          label="ชนิดเลือด"
          options={typeOptions}
          value={typeOptions.find((o) => o.value === typeFilter) ?? typeOptions[0]}
          onChange={(o) => onTypeFilter(o?.value ?? '')}
          isClearable={false}
        />
        <BloodGroupSelect className="dms-filters__select" value={groupFilter} onChange={onGroupFilter} />
        <label className="dms-filters__check">
          <input type="checkbox" checked={onlyDanger} onChange={(e) => onOnlyDanger(e.target.checked)} />
          แสดงเฉพาะที่ต่ำกว่าขั้นต่ำ
        </label>
      </div>

      {!anyVisible ? (
        <p className="dms-none" role="status">
          {onlyDanger ? 'ไม่มีรายการที่ต่ำกว่าขั้นต่ำ' : 'ไม่มีรายการที่ตรงกับตัวกรอง'}
        </p>
      ) : (
        <div className="dms-matrix__scroll">
          <table className="dms-matrix">
            <thead>
              <tr>
                <th scope="col" className="dms-matrix__type">ชนิดเลือด</th>
                {columns.map((g) => <th key={g} scope="col">หมู่ {g}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.type.code}>
                  <th scope="row" className="dms-matrix__type" title={r.type.name ?? undefined}>{r.type.code}</th>
                  {columns.map((g) => {
                    const i = r.cells.find((c) => c.group === g)
                    if (!i || !passes(i)) return <td key={g}><div className="dms-cell dms-cell--off" aria-hidden="true" /></td>
                    const key = cellKey(i.type, i.group)
                    return (
                      <td key={g}>
                        <button
                          type="button"
                          data-cell={key}
                          className={`dms-cell ms-status--${i.status}${highlight === key ? ' is-highlight' : ''}`}
                          aria-label={cellLabel(i)}
                          onClick={() => onOpen(i)}
                        >
                          <MinStatusPill status={i.status} size="sm" />
                          <span className="dms-cell__nums">
                            <strong>{i.stock.toLocaleString()}</strong> / {i.minUnits == null ? '—' : i.minUnits.toLocaleString()}
                          </span>
                          {i.minUnits != null && (
                            <>
                              <span className="plasm-ms-bar" aria-hidden="true">
                                <span className="plasm-ms-bar__fill" style={{ display: 'block', width: barWidth(i.pct) }} />
                                <span className="plasm-ms-bar__min" />
                              </span>
                              <span className="dms-cell__pct">{pctLabel(i.pct)} ของขั้นต่ำ</span>
                            </>
                          )}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer className="dms-card__foot">
        {LEGEND.map((s) => <MinStatusPill key={s} status={s} size="sm" />)}
        <span className="dms-legend-line"><span className="plasm-ms-minline" aria-hidden="true" /> เส้นขั้นต่ำ (100%)</span>
        {noneCount > 0 && (
          isAdmin
            ? <Link to={SETTINGS_MIN_STOCK_PATH} className="dms-link dms-link--push">ยังไม่ได้ตั้งค่า {noneCount} รายการ</Link>
            : <span className="dms-legend-line dms-link--push">ยังไม่ได้ตั้งค่า {noneCount} รายการ</span>
        )}
      </footer>
    </section>
  )
}
