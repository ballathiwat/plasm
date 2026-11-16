// frontend/src/pages/report-daily/components/MovementFilters.tsx
//
// แผงตัวกรองแบบ "กรอกก่อน แล้วกดค้นหา"
//   แถว 1: ช่วงวันที่ (segmented preset + วันที่กำหนดเอง / hint)
//   แถว 2: ชนิดเลือด (multi) + หมู่เลือด + ปุ่มค้นหา
//   แถว 3: chip "กรองอยู่" (จากค่าที่ค้นหาแล้ว) + ล้างทั้งหมด

import { useId, type KeyboardEvent } from 'react'
import { Calendar, Search, X } from 'lucide-react'
import Button from '../../../components/common/Button'
import SelectDropdown, { type OptionType } from '../../../components/common/SelectDropdown'
import DateInput from '../../../components/common/DateInput'
import BloodGroupSelect from '../../../components/common/BloodGroupSelect'
import { formatThaiRange } from '../services/useDailyReport'
import type { FilterDraft, PresetKey } from '../services/DailyReportType'
import '../../../assets/styles/report-filters.css'

interface Props {
  /** ค่าที่กำลังเลือกในแผง (ยังไม่ได้ค้นหา) */
  draft: FilterDraft
  /** ค่าที่ค้นหาแล้ว — ใช้สร้าง chip */
  applied: FilterDraft
  masterTypes: string[]
  loading: boolean
  isDirty: boolean
  isNonDefault: boolean
  rangeError: string | null
  onDraft: (patch: Partial<FilterDraft>) => void
  onSearch: () => void
  onApplyNow: (patch: Partial<FilterDraft>) => void
  onReset: () => void
  onToggleTypeNow: (code: string) => void
}

const PRESET_OPTIONS: { value: PresetKey; label: string }[] = [
  { value: 'today', label: 'วันนี้' },
  { value: '7d', label: '7 วัน' },
  { value: '30d', label: '30 วัน' },
  { value: 'this-month', label: 'เดือนนี้' },
  { value: 'last-month', label: 'เดือนก่อน' },
  { value: 'this-year', label: 'ปีนี้' },
  { value: 'custom', label: 'กำหนดเอง' },
]

export default function MovementFilters({
  draft, applied, masterTypes, loading, isDirty, isNonDefault, rangeError,
  onDraft, onSearch, onApplyNow, onReset, onToggleTypeNow,
}: Props) {
  const rangeLabelId = useId()

  // Multi-select options for plasma types
  const typeOptions = masterTypes.map((c) => ({ label: c, value: c }))
  const typeValue = draft.types.map((c) => ({ label: c, value: c }))

  // Chip จากค่าที่ค้นหาแล้ว — กด x = กรองใหม่ทันที
  const chips: { key: string; label: string; onRemove: () => void }[] = []

  // Preset chip (ถ้าไม่ใช่ 7d default)
  if (applied.preset !== '7d') {
    const presetLabel = PRESET_OPTIONS.find((o) => o.value === applied.preset)?.label ?? applied.preset
    if (applied.preset === 'custom') {
      chips.push({
        key: 'range',
        label: `ช่วงวัน: ${formatThaiRange(applied.from, applied.to)}`,
        onRemove: () => onApplyNow({ preset: '7d' }),
      })
    } else {
      chips.push({
        key: 'preset',
        label: `ช่วง: ${presetLabel}`,
        onRemove: () => onApplyNow({ preset: '7d' }),
      })
    }
  }

  // Type chips
  for (const code of applied.types) {
    chips.push({
      key: `type-${code}`,
      label: `ชนิด: ${code}`,
      onRemove: () => onToggleTypeNow(code),
    })
  }

  // Blood group chip
  if (applied.blood) {
    chips.push({
      key: 'blood',
      label: `หมู่เลือด: ${applied.blood}`,
      onRemove: () => onApplyNow({ blood: '' }),
    })
  }

  // Enter ที่ใดก็ได้ในแผง = ค้นหา (ยกเว้นบนปุ่ม หรือ component จัดการ Enter ไปแล้ว)
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== 'Enter' || e.defaultPrevented) return
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    onSearch()
  }

  return (
    <section className="rpt-filters" aria-label="ตัวกรองรายงาน" onKeyDown={onKeyDown}>
      {/* แถว 1: segmented preset + date */}
      <div className="rpt-filters__range">
        <div className="rpt-filters__field">
          <span id={rangeLabelId} className="rpt-filters__label">ช่วงเวลา</span>
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

      {/* แถว 2: ชนิดเลือด (multi) + หมู่เลือด + ค้นหา */}
      <div className="rpt-filters__grid">
        <SelectDropdown
          label="ชนิดเลือด"
          options={typeOptions}
          value={typeValue}
          onChange={(selected: OptionType[]) => {
            onDraft({ types: selected.map((o) => o.value) })
          }}
          isMulti
          isClearable
          isSearchable
          placeholder="ทุกชนิด"
        />
        <BloodGroupSelect
          label="หมู่เลือด"
          allLabel="ทุกหมู่เลือด"
          value={draft.blood}
          onChange={(v) => onDraft({ blood: v || '' })}
        />
        <span className="rpt-filters__search">
          <Button
            variant="primary"
            icon={<Search size={14} />}
            onClick={onSearch}
            loading={loading}
            aria-label={isDirty ? 'ค้นหา (มีตัวกรองที่ยังไม่ได้ค้นหา)' : undefined}
          >
            ค้นหา
          </Button>
          {isDirty && <span className="rpt-filters__dot" aria-hidden="true" />}
        </span>
      </div>

      {/* แถว 3: chip row */}
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
