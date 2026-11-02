// frontend/src/pages/report-daily/components/MovementFilters.tsx

import { Search, Info } from 'lucide-react'
import DateInput from '../../../components/common/DateInput'
import SelectDropdown, { type OptionType } from '../../../components/common/SelectDropdown'
import Button from '../../../components/common/Button'
import type { FilterDraft, PresetKey } from '../services/DailyReportType'
import type { ValidationError } from '../services/useDailyReport'

// ── Presets ──
const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'today', label: 'วันนี้' },
  { key: '7d', label: '7 วัน' },
  { key: '30d', label: '30 วัน' },
  { key: 'this-month', label: 'เดือนนี้' },
  { key: 'last-month', label: 'เดือนก่อน' },
  { key: 'this-year', label: 'ปีนี้' },
  { key: 'last-year', label: 'ปีก่อน' },
]

// ── Dropdown options ──
const TYPE_OPTS: OptionType[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'FFP', label: 'FFP' },
  { value: 'IFFP', label: 'IFFP' },
  { value: 'LPRC', label: 'LPRC' },
]

const GROUP_OPTS: OptionType[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'A', label: 'หมู่ A' },
  { value: 'B', label: 'หมู่ B' },
  { value: 'O', label: 'หมู่ O' },
  { value: 'AB', label: 'หมู่ AB' },
]

const findOpt = (opts: OptionType[], v: string) =>
  opts.find((o) => o.value === v) ?? null

const bkkToday = (): string =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })

interface Props {
  draft: FilterDraft
  loading: boolean
  isDirty: boolean
  validationError: ValidationError | null
  onPreset: (key: PresetKey) => void
  onFromChange: (v: string) => void
  onToChange: (v: string) => void
  onTypeChange: (v: string) => void
  onGroupChange: (v: string) => void
  onSearch: () => void
}

export default function MovementFilters({
  draft, loading, isDirty, validationError,
  onPreset, onFromChange, onToChange, onTypeChange, onGroupChange, onSearch,
}: Props) {
  const today = bkkToday()
  const hasError = !!validationError

  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)',
      padding: '16px 20px',
      marginBottom: 16,
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Preset buttons */}
      <div
        role="group"
        aria-label="ช่วงเวลาที่ใช้บ่อย"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}
      >
        {PRESETS.map((p) => {
          const active = draft.preset === p.key
          return (
            <button
              key={p.key}
              type="button"
              aria-pressed={active}
              onClick={() => onPreset(p.key)}
              style={{
                minHeight: 36,
                padding: '6px 14px',
                borderRadius: 'var(--radius-full, 99px)',
                border: active ? 'none' : '1px solid var(--border, #E4E4E7)',
                background: active ? 'var(--primary, #2563EB)' : 'var(--surface, #fff)',
                color: active ? '#fff' : 'var(--text-primary, #18181B)',
                fontWeight: active ? 600 : 400,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 12 }}>
        <div style={{ minWidth: 160 }}>
          <DateInput label="ตั้งแต่" value={draft.from} onChange={onFromChange} max={today} />
        </div>
        <div style={{ minWidth: 160 }}>
          <DateInput
            label="ถึง"
            value={draft.to}
            onChange={onToChange}
            max={today}
            error={validationError?.field === 'to' ? validationError.message : undefined}
          />
        </div>
        <div style={{ minWidth: 140 }}>
          <SelectDropdown
            label="ชนิด" placeholder="ชนิด"
            options={TYPE_OPTS}
            value={findOpt(TYPE_OPTS, draft.type)}
            onChange={(opt) => onTypeChange(opt?.value ?? 'all')}
            isClearable={false} isSearchable={false}
          />
        </div>
        <div style={{ minWidth: 140 }}>
          <SelectDropdown
            label="หมู่เลือด" placeholder="หมู่เลือด"
            options={GROUP_OPTS}
            value={findOpt(GROUP_OPTS, draft.group)}
            onChange={(opt) => onGroupChange(opt?.value ?? 'all')}
            isClearable={false} isSearchable={false}
          />
        </div>
        <Button
          variant="primary"
          icon={<Search size={14} />}
          onClick={onSearch}
          disabled={loading || hasError || !draft.from || !draft.to}
          loading={loading}
        >
          ค้นหา
        </Button>
      </div>

      {/* Dirty indicator */}
      {isDirty && !hasError && (
        <div role="status" style={{
          display: 'flex', alignItems: 'center', gap: 6, marginTop: 10,
          padding: '8px 12px',
          background: 'var(--warning-surface, #FFFBEB)',
          border: '1px solid #FDE68A',
          borderRadius: 'var(--radius-md, 8px)',
          fontSize: 13, color: 'var(--warning-ink, #92400E)',
        }}>
          <Info size={14} />
          <span>เปลี่ยนตัวกรองแล้ว — กด &quot;ค้นหา&quot; เพื่อแสดงผลใหม่</span>
        </div>
      )}
    </div>
  )
}
