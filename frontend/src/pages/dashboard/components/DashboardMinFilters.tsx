// frontend/src/pages/dashboard/components/DashboardMinFilters.tsx
// ตัวกรองของการ์ด "สต็อกเทียบขั้นต่ำ" — pattern เดียวกับหน้ารายงานรับเลือดจากภายนอก:
//   เลือกก่อน (draft) แล้วกด "ค้นหา" จึงมีผล · chip "กรองอยู่:" สร้างจากค่าที่ค้นหาแล้ว (กด × = มีผลทันที)
import { useMemo, type KeyboardEvent } from 'react'
import { Search, X } from 'lucide-react'
import Button from '../../../components/common/Button'
import SelectDropdown, { type OptionType } from '../../../components/common/SelectDropdown'
import { aboOf, type MinStockType } from '../../../helpers/minStock'
import type { MinFilters } from '../services/useDashboard'

interface Props {
  types: MinStockType[]
  groups: string[]
  /** ค่าที่กำลังเลือก (ยังไม่ได้ค้นหา) */
  draft: MinFilters
  /** ค่าที่ค้นหาแล้ว — ใช้สร้าง chip */
  filters: MinFilters
  isDirty: boolean
  onDraft: (p: Partial<MinFilters>) => void
  onSearch: () => void
  onApplyNow: (p: Partial<MinFilters>) => void
  onReset: () => void
}

const pick = (opts: OptionType[], v: string) => opts.find((o) => o.value === v) ?? opts[0]

export default function DashboardMinFilters({
  types, groups, draft, filters, isDirty, onDraft, onSearch, onApplyNow, onReset,
}: Props) {
  const typeOpts = useMemo<OptionType[]>(
    () => [{ value: '', label: 'ทุกชนิดเลือด' }, ...types.map((t) => ({ value: t.code, label: t.code }))],
    [types],
  )
  // หมู่ที่ไม่ระบุ Rh (เช่น "A") = รวมทุก Rh ของหมู่นั้น — บอกไว้ในตัวเลือกเมื่อมีหมู่ย่อย
  const groupOpts = useMemo<OptionType[]>(() => [
    { value: '', label: 'ทุกหมู่เลือด' },
    ...groups.map((g) => {
      const subs = aboOf(g) === g ? groups.filter((x) => x !== g && aboOf(x) === g) : []
      return { value: g, label: subs.length ? `${g} (รวม ${subs.join(', ')})` : g }
    }),
  ], [groups])

  const chips: { key: string; label: string; onRemove: () => void }[] = []
  if (filters.type) chips.push({ key: 'type', label: `ชนิดเลือด: ${filters.type}`, onRemove: () => onApplyNow({ type: '' }) })
  if (filters.group) chips.push({ key: 'group', label: `หมู่เลือด: ${filters.group}`, onRemove: () => onApplyNow({ group: '' }) })
  if (filters.onlyDanger) chips.push({ key: 'danger', label: 'เฉพาะต่ำกว่าขั้นต่ำ', onRemove: () => onApplyNow({ onlyDanger: false }) })

  // Enter ที่ใดก็ได้ในแถวตัวกรอง = ค้นหา (ยกเว้นบนปุ่ม หรือ dropdown ที่จัดการ Enter ไปแล้ว)
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== 'Enter' || e.defaultPrevented) return
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    onSearch()
  }

  return (
    <div className="dms-filters" role="search" aria-label="ตัวกรองสต็อกเทียบขั้นต่ำ" onKeyDown={onKeyDown}>
      <div className="dms-filters__row">
        <SelectDropdown
          className="dms-filters__select"
          label="ชนิดเลือด"
          options={typeOpts}
          value={pick(typeOpts, draft.type)}
          onChange={(o) => onDraft({ type: o?.value ?? '' })}
          isClearable={false}
        />
        <SelectDropdown
          className="dms-filters__select"
          label="หมู่เลือด"
          options={groupOpts}
          value={pick(groupOpts, draft.group)}
          onChange={(o) => onDraft({ group: o?.value ?? '' })}
          isClearable={false}
          isSearchable={false}
        />
        <label className="dms-filters__check">
          <input
            type="checkbox"
            checked={draft.onlyDanger}
            onChange={(e) => onDraft({ onlyDanger: e.target.checked })}
          />
          เฉพาะต่ำกว่าขั้นต่ำ
        </label>
        <span className="rpt-filters__search">
          <Button
            variant="primary"
            icon={<Search size={14} />}
            onClick={onSearch}
            aria-label={isDirty ? 'ค้นหา (มีตัวกรองที่ยังไม่ได้ค้นหา)' : undefined}
          >
            ค้นหา
          </Button>
          {isDirty && <span className="rpt-filters__dot" aria-hidden="true" />}
        </span>
      </div>

      {chips.length > 0 && (
        <div className="rpt-chips dms-chips">
          <span className="rpt-chips__label">กรองอยู่:</span>
          {chips.map((c) => (
            <span key={c.key} className="rpt-chip">
              {c.label}
              <button type="button" className="rpt-chip__x" onClick={c.onRemove} aria-label={`ลบตัวกรอง ${c.label}`}>
                <X size={12} />
              </button>
            </span>
          ))}
          <button type="button" className="rpt-chips__clear" onClick={onReset}>ล้างทั้งหมด</button>
        </div>
      )}
    </div>
  )
}
