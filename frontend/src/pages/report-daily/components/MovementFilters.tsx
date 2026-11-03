// frontend/src/pages/report-daily/components/MovementFilters.tsx

import { Search, Info, Check } from 'lucide-react'
import DateInput from '../../../components/common/DateInput'
import SelectDropdown, { type OptionType } from '../../../components/common/SelectDropdown'
import Button from '../../../components/common/Button'
import { plasmaChartColor } from '../../../helpers/blood'
import type { FilterDraft, PresetKey } from '../services/DailyReportType'
import type { ValidationError } from '../services/useDailyReport'

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'today', label: 'วันนี้' },
  { key: '7d', label: '7 วัน' },
  { key: '30d', label: '30 วัน' },
  { key: 'this-month', label: 'เดือนนี้' },
  { key: 'last-month', label: 'เดือนก่อน' },
  { key: 'this-year', label: 'ปีนี้' },
  { key: 'last-year', label: 'ปีก่อน' },
]

const GROUP_OPTS: OptionType[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'A', label: 'หมู่ A' },
  { value: 'B', label: 'หมู่ B' },
  { value: 'O', label: 'หมู่ O' },
  { value: 'AB', label: 'หมู่ AB' },
]

const findOpt = (opts: OptionType[], v: string) => opts.find((o) => o.value === v) ?? null
const bkkToday = (): string => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })

// ── TypeToggle button ──
function TypeToggle({ code, on, last, onToggle }: {
  code: string; on: boolean; last: boolean; onToggle: () => void
}) {
  const typeColor = plasmaChartColor(code)

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      aria-disabled={last || undefined}
      title={last ? 'ต้องเลือกอย่างน้อย 1 ชนิด' : undefined}
      onClick={onToggle}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px 6px 10px',
        minHeight: 36,
        borderRadius: 'var(--radius-full, 99px)',
        fontSize: 13,
        fontWeight: on ? 600 : 500,
        fontFamily: 'inherit',
        cursor: last ? 'not-allowed' : 'pointer',
        transition: 'background .15s, border-color .15s',
        // on vs off border/background — use each type's own color
        border: on
          ? `2px solid ${typeColor}`
          : '1px dashed var(--border-strong, #A1A1AA)',
        margin: on ? 0 : 1,
        background: on
          ? `color-mix(in srgb, ${typeColor} 12%, var(--surface, #fff))`
          : 'transparent',
        color: on
          ? typeColor
          : 'var(--text-secondary, #71717A)',
      }}
    >
      {/* Checkbox indicator */}
      <span
        aria-hidden="true"
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: on ? typeColor : 'var(--surface, #fff)',
          border: on ? 'none' : '1.5px solid var(--text-disabled, #A1A1AA)',
        }}
      >
        {on && <Check size={13} strokeWidth={3} color="#fff" />}
      </span>

      {/* Type color square */}
      <span
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: 2,
          background: typeColor || 'var(--text-disabled)',
          opacity: on ? 1 : 0.45,
          flexShrink: 0,
        }}
      />

      {/* Label */}
      <span style={{
        textDecoration: on ? 'none' : 'line-through',
        textDecorationColor: on ? undefined : 'var(--text-disabled, #A1A1AA)',
      }}>
        {code}
      </span>
    </button>
  )
}

// ── Main ──
interface Props {
  draft: FilterDraft
  masterTypes: string[]
  loading: boolean
  isDirty: boolean
  validationError: ValidationError | null
  onPreset: (key: PresetKey) => void
  onFromChange: (v: string) => void
  onToChange: (v: string) => void
  onGroupChange: (v: string) => void
  onToggleType: (code: string) => void
  onSelectAllTypes: () => void
  onSearch: () => void
}

export default function MovementFilters({
  draft, masterTypes, loading, isDirty, validationError,
  onPreset, onFromChange, onToChange, onGroupChange,
  onToggleType, onSelectAllTypes, onSearch,
}: Props) {
  const today = bkkToday()
  const hasError = !!validationError
  const selectedCount = draft.types.length
  const allCount = masterTypes.length

  return (
    <div style={{
      background: 'var(--surface, #fff)', border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)', padding: '16px 20px',
      marginBottom: 16, boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Preset buttons */}
      <div role="group" aria-label="ช่วงเวลาที่ใช้บ่อย"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {PRESETS.map((p) => {
          const active = draft.preset === p.key
          return (
            <button key={p.key} type="button" aria-pressed={active}
              onClick={() => onPreset(p.key)}
              style={{
                minHeight: 36, padding: '6px 14px', borderRadius: 'var(--radius-full, 99px)',
                border: active ? 'none' : '1px solid var(--border, #E4E4E7)',
                background: active ? 'var(--primary, #2563EB)' : 'var(--surface, #fff)',
                color: active ? '#fff' : 'var(--text-primary, #18181B)',
                fontWeight: active ? 600 : 400, fontSize: 13,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}>
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
          <DateInput label="ถึง" value={draft.to} onChange={onToChange} max={today}
            error={validationError?.field === 'to' ? validationError.message : undefined} />
        </div>
        <div style={{ minWidth: 140 }}>
          <SelectDropdown label="หมู่เลือด" placeholder="หมู่เลือด"
            options={GROUP_OPTS} value={findOpt(GROUP_OPTS, draft.group)}
            onChange={(opt) => onGroupChange(opt?.value ?? 'all')}
            isClearable={false} isSearchable={false} />
        </div>
        <Button variant="primary" icon={<Search size={14} />} onClick={onSearch}
          disabled={loading || hasError || !draft.from || !draft.to} loading={loading}>
          ค้นหา
        </Button>
      </div>

      {/* Type toggles row */}
      {masterTypes.length > 0 && (
        <div
          role="group"
          aria-label="ชนิด"
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 12 }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginRight: 4 }}>
            ชนิด
          </span>

          {masterTypes.map((code) => {
            const on = draft.types.includes(code)
            const last = on && selectedCount === 1
            return (
              <TypeToggle
                key={code}
                code={code}
                on={on}
                last={last}
                onToggle={() => onToggleType(code)}
              />
            )
          })}

          <span aria-live="polite" style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 4 }}>
            {selectedCount === allCount
              ? 'เลือกครบทุกชนิด'
              : `เลือก ${selectedCount} จาก ${allCount} ชนิด`}
          </span>

          {selectedCount !== allCount && (
            <button
              type="button"
              onClick={onSelectAllTypes}
              style={{
                minHeight: 36,
                padding: '0 4px',
                border: 'none',
                background: 'none',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--primary, #2563EB)',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              เลือกทั้งหมด
            </button>
          )}
        </div>
      )}

      {/* Dirty indicator */}
      {isDirty && !hasError && (
        <div role="status" style={{
          display: 'flex', alignItems: 'center', gap: 6, marginTop: 10,
          padding: '8px 12px', background: 'var(--warning-surface, #FFFBEB)',
          border: '1px solid #FDE68A', borderRadius: 'var(--radius-md, 8px)',
          fontSize: 13, color: 'var(--warning-ink, #92400E)',
        }}>
          <Info size={14} />
          <span>เปลี่ยนตัวกรองแล้ว — กด &quot;ค้นหา&quot; เพื่อแสดงผลใหม่</span>
        </div>
      )}
    </div>
  )
}
