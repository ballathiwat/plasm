// frontend/src/pages/ExtBloodReport/components/ReportFilters.tsx
//
// แผงตัวกรอง: ช่วงวันที่ (segmented) + dropdown + แถว chip "กรองอยู่"

import { useMemo } from 'react'
import { X } from 'lucide-react'
import SelectDropdown, { type OptionType } from '../../../components/common/SelectDropdown'
import DateInput from '../../../components/common/DateInput'
import PlasmaTypeSelect from '../../../components/common/PlasmaTypeSelect'
import BloodGroupSelect from '../../../components/common/BloodGroupSelect'
import type { DimKey, FilterOption, RangePreset, ReportFilters as Filters } from '../services/ReportType'

interface Props {
  filters: Filters
  rangeError: string | null
  sources: FilterOption[]
  products: (FilterOption & { code: string })[]
  hasDimFilter: boolean
  onPreset: (p: RangePreset) => void
  onCustomDate: (key: 'from' | 'to', iso: string) => void
  onDim: (key: DimKey, value: string | undefined) => void
  onIncludePending: (on: boolean) => void
  onClear: () => void
}

const PRESET_OPTIONS: { value: RangePreset; label: string }[] = [
  { value: 'month', label: 'เดือนนี้' },
  { value: '3m', label: '3 เดือน' },
  { value: '6m', label: '6 เดือน' },
  { value: 'fy', label: 'ปีงบประมาณ' },
  { value: 'custom', label: 'กำหนดเอง' },
]

const STATUS_OPTIONS: OptionType[] = [
  { value: '', label: 'อนุมัติแล้ว' },
  { value: 'pending', label: 'รวมรออนุมัติ' },
]

const pick = (opts: OptionType[], v?: string) => opts.find((o) => o.value === (v ?? '')) ?? opts[0]

export default function ReportFilters({
  filters, rangeError, sources, products, hasDimFilter,
  onPreset, onCustomDate, onDim, onIncludePending, onClear,
}: Props) {
  const sourceOpts = useMemo<OptionType[]>(
    () => [{ value: '', label: 'ทุกแหล่งที่มา' }, ...sources.map((s) => ({ value: s.id, label: s.label }))],
    [sources],
  )
  const productItems = useMemo(
    () => products.map((p) => ({ id: p.id, code: p.code, name: p.label })),
    [products],
  )

  const chips: { key: string; label: string; onRemove: () => void }[] = []
  if (filters.sourceId) {
    const name = sources.find((s) => s.id === filters.sourceId)?.label ?? 'ที่เลือก'
    chips.push({ key: 'source', label: `แหล่งที่มา: ${name}`, onRemove: () => onDim('sourceId', undefined) })
  }
  if (filters.productId) {
    const code = products.find((p) => p.id === filters.productId)?.code ?? 'ที่เลือก'
    chips.push({ key: 'product', label: `ชนิดเลือด: ${code}`, onRemove: () => onDim('productId', undefined) })
  }
  if (filters.abo) {
    chips.push({ key: 'abo', label: `หมู่เลือด: ${filters.abo}`, onRemove: () => onDim('abo', undefined) })
  }
  if (filters.includePending) {
    chips.push({ key: 'pending', label: 'รวมรออนุมัติ', onRemove: () => onIncludePending(false) })
  }

  return (
    <section className="rpt-filters" aria-label="ตัวกรองรายงาน">
      <div className="rpt-filters__range">
        <div className="rpt-seg" role="group" aria-label="ช่วงวันที่">
          {PRESET_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`rpt-seg__btn${filters.preset === o.value ? ' rpt-seg__btn--active' : ''}`}
              aria-pressed={filters.preset === o.value}
              onClick={() => onPreset(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>

        {filters.preset === 'custom' && (
          <div className="rpt-filters__dates">
            <DateInput
              label="ตั้งแต่"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(iso) => onCustomDate('from', iso)}
            />
            <DateInput
              label="ถึง"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(iso) => onCustomDate('to', iso)}
            />
          </div>
        )}
      </div>

      {rangeError && <p className="rpt-filters__error" role="alert">{rangeError}</p>}

      <div className="rpt-filters__grid">
        <SelectDropdown
          label="แหล่งที่มา"
          options={sourceOpts}
          value={pick(sourceOpts, filters.sourceId)}
          onChange={(o) => onDim('sourceId', o?.value || undefined)}
          isClearable={false}
        />
        <PlasmaTypeSelect
          label="ชนิดเลือด"
          allLabel="ทุกชนิดเลือด"
          value={products.find((p) => p.id === filters.productId)?.code ?? ''}
          products={productItems}
          onChange={(_code, productId) => onDim('productId', productId || undefined)}
        />
        <BloodGroupSelect
          label="หมู่เลือด"
          allLabel="ทุกหมู่เลือด"
          value={filters.abo ?? ''}
          onChange={(v) => onDim('abo', v || undefined)}
        />
        <SelectDropdown
          label="สถานะ"
          options={STATUS_OPTIONS}
          value={pick(STATUS_OPTIONS, filters.includePending ? 'pending' : '')}
          onChange={(o) => onIncludePending(o?.value === 'pending')}
          isClearable={false}
          isSearchable={false}
        />
      </div>

      {hasDimFilter && (
        <div className="rpt-chips">
          <span className="rpt-chips__label">กรองอยู่</span>
          {chips.map((c) => (
            <span key={c.key} className="rpt-chip">
              {c.label}
              <button type="button" className="rpt-chip__x" onClick={c.onRemove} aria-label={`ลบตัวกรอง ${c.label}`}>
                <X size={12} />
              </button>
            </span>
          ))}
          <button type="button" className="rpt-chips__clear" onClick={onClear}>
            ล้างทั้งหมด
          </button>
        </div>
      )}
    </section>
  )
}
