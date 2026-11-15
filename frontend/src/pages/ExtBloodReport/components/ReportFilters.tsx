// frontend/src/pages/ExtBloodReport/components/ReportFilters.tsx
//
// แผงตัวกรองแบบ "กรอกก่อน แล้วกดค้นหา"
//   แถว 1: ช่วงวันที่รับ (segmented + วันที่กำหนดเอง)
//   แถว 2: dropdown + ปุ่มค้นหา
//   แถว 3: chip "กรองอยู่" (จากค่าที่ค้นหาแล้ว) + ล้างทั้งหมด

import { useId, useMemo, type KeyboardEvent } from 'react'
import { Calendar, Search, X } from 'lucide-react'
import Button from '../../../components/common/Button'
import SelectDropdown, { type OptionType } from '../../../components/common/SelectDropdown'
import DateInput from '../../../components/common/DateInput'
import PlasmaTypeSelect from '../../../components/common/PlasmaTypeSelect'
import BloodGroupSelect from '../../../components/common/BloodGroupSelect'
import { formatThaiRange } from '../services/reportHelpers'
import type { FilterOption, RangePreset, ReportFilters as Filters } from '../services/ReportType'

interface Props {
  /** ค่าที่กำลังเลือกในแผง (ยังไม่ได้ค้นหา) */
  draft: Filters
  /** ค่าที่ค้นหาแล้ว — ใช้สร้าง chip */
  filters: Filters
  rangeError: string | null
  sources: FilterOption[]
  products: (FilterOption & { code: string })[]
  isDirty: boolean
  isNonDefault: boolean
  onDraft: (patch: Partial<Filters>) => void
  onSearch: () => void
  onApplyNow: (patch: Partial<Filters>) => void
  onReset: () => void
}

const PRESET_OPTIONS: { value: RangePreset; label: string }[] = [
  { value: 'month', label: 'เดือนนี้' },
  { value: '3m', label: '3 เดือน' },
  { value: '6m', label: '6 เดือน' },
  { value: 'fy', label: 'ปีงบประมาณ' },
  { value: 'custom', label: 'กำหนดเอง' },
]

const STATUS_OPTIONS: OptionType[] = [
  { value: '', label: 'อนุมัติ/นำออกแล้ว' },
  { value: 'pending', label: 'รวมรออนุมัติ' },
]

const pick = (opts: OptionType[], v?: string) => opts.find((o) => o.value === (v ?? '')) ?? opts[0]

export default function ReportFilters({
  draft, filters, rangeError, sources, products, isDirty, isNonDefault,
  onDraft, onSearch, onApplyNow, onReset,
}: Props) {
  const rangeLabelId = useId()

  const sourceOpts = useMemo<OptionType[]>(
    () => [{ value: '', label: 'ทุกแหล่งที่มา' }, ...sources.map((s) => ({ value: s.id, label: s.label }))],
    [sources],
  )
  const productItems = useMemo(
    () => products.map((p) => ({ id: p.id, code: p.code, name: p.label })),
    [products],
  )

  // chip สร้างจากค่าที่ค้นหาแล้ว — กด x = กรองใหม่ทันที
  const chips: { key: string; label: string; onRemove: () => void }[] = []
  if (filters.sourceId) {
    const name = sources.find((s) => s.id === filters.sourceId)?.label ?? 'ที่เลือก'
    chips.push({ key: 'source', label: `แหล่งที่มา: ${name}`, onRemove: () => onApplyNow({ sourceId: undefined }) })
  }
  if (filters.productId) {
    const code = products.find((p) => p.id === filters.productId)?.code ?? 'ที่เลือก'
    chips.push({ key: 'product', label: `ชนิดเลือด: ${code}`, onRemove: () => onApplyNow({ productId: undefined }) })
  }
  if (filters.abo) {
    chips.push({ key: 'abo', label: `หมู่เลือด: ${filters.abo}`, onRemove: () => onApplyNow({ abo: undefined }) })
  }
  if (filters.includePending) {
    chips.push({ key: 'pending', label: 'รวมรออนุมัติ', onRemove: () => onApplyNow({ includePending: false }) })
  }

  // Enter ที่ใดก็ได้ในแผง = ค้นหา (ยกเว้นบนปุ่ม หรือ component ภายในจัดการ Enter ไปแล้ว เช่น เมนู dropdown ที่เปิดอยู่)
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== 'Enter' || e.defaultPrevented) return
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    onSearch()
  }

  return (
    <section className="rpt-filters" aria-label="ตัวกรองรายงาน" onKeyDown={onKeyDown}>
      <div className="rpt-filters__range">
        <div className="rpt-filters__field">
          <span id={rangeLabelId} className="rpt-filters__label">ช่วงวันที่รับ</span>
          <div className="rpt-seg" role="group" aria-labelledby={rangeLabelId}>
            {PRESET_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`rpt-seg__btn${draft.preset === o.value ? ' rpt-seg__btn--active' : ''}`}
                aria-pressed={draft.preset === o.value}
                onClick={() => onDraft({ preset: o.value })}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {draft.preset === 'custom' ? (
          <div className="rpt-filters__dates">
            <DateInput
              label="ตั้งแต่"
              value={draft.from}
              max={draft.to || undefined}
              onChange={(iso) => onDraft({ from: iso })}
            />
            <DateInput
              label="ถึง"
              value={draft.to}
              min={draft.from || undefined}
              onChange={(iso) => onDraft({ to: iso })}
            />
          </div>
        ) : (
          <span className="rpt-filters__hint">
            <Calendar size={14} aria-hidden="true" />
            {formatThaiRange(draft.from, draft.to)}
          </span>
        )}
      </div>

      {rangeError && <p className="rpt-filters__error" role="alert">{rangeError}</p>}

      <div className="rpt-filters__grid">
        <SelectDropdown
          label="แหล่งที่มา"
          options={sourceOpts}
          value={pick(sourceOpts, draft.sourceId)}
          onChange={(o) => onDraft({ sourceId: o?.value || undefined })}
          isClearable={false}
        />
        <PlasmaTypeSelect
          label="ชนิดเลือด"
          allLabel="ทุกชนิดเลือด"
          value={products.find((p) => p.id === draft.productId)?.code ?? ''}
          products={productItems}
          onChange={(_code, productId) => onDraft({ productId: productId || undefined })}
        />
        <BloodGroupSelect
          label="หมู่เลือด"
          allLabel="ทุกหมู่เลือด"
          value={draft.abo ?? ''}
          onChange={(v) => onDraft({ abo: v || undefined })}
        />
        <SelectDropdown
          label="สถานะ"
          options={STATUS_OPTIONS}
          value={pick(STATUS_OPTIONS, draft.includePending ? 'pending' : '')}
          onChange={(o) => onDraft({ includePending: o?.value === 'pending' })}
          isClearable={false}
          isSearchable={false}
        />
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

      {isNonDefault && (
        <div className="rpt-chips">
          {chips.length > 0 && <span className="rpt-chips__label">กรองอยู่</span>}
          {chips.map((c) => (
            <span key={c.key} className="rpt-chip">
              {c.label}
              <button type="button" className="rpt-chip__x" onClick={c.onRemove} aria-label={`ลบตัวกรอง ${c.label}`}>
                <X size={12} />
              </button>
            </span>
          ))}
          <button
            type="button"
            className={`rpt-chips__clear${chips.length === 0 ? ' rpt-chips__clear--alone' : ''}`}
            onClick={onReset}
          >
            ล้างทั้งหมด
          </button>
        </div>
      )}
    </section>
  )
}
