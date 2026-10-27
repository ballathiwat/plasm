// ============================================================
//  src/pages/report/components/ReportFilters.tsx
// ============================================================

import { useMemo } from 'react'
import { Search } from 'lucide-react'
import SelectDropdown, {
  type OptionType,
} from '../../../components/common/SelectDropdown'
import DateInput from '../../../components/common/DateInput'
import Button from '../../../components/common/Button'
import type { ReportFilters as Filters } from '../services/ReportType'

interface Props {
  filters: Filters
  plasmaTypes: string[]
  loading: boolean
  onChange: (key: keyof Filters, value: string) => void
  onSearch: () => void
}

/* ── Helpers ── */
const toOption = (value: string): OptionType => ({ value, label: value })
const findOption = (options: OptionType[], value: string): OptionType | null =>
  options.find((o) => o.value === value) ?? null

export default function ReportFilters({
  filters, plasmaTypes, loading, onChange, onSearch,
}: Props) {
  const typeOptions = useMemo<OptionType[]>(
    () => plasmaTypes.map(toOption),
    [plasmaTypes],
  )

  const handleTypeChange = (opt: OptionType | null) => {
    onChange('type', opt?.value ?? '')
  }

  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)',
      padding: '16px 20px',
      marginBottom: 16,
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'flex-end',
      gap: 12,
    }}>
      {/* ชนิดพลาสมา */}
      <div style={{ minWidth: 160 }}>
        <SelectDropdown
          label="ชนิด"
          placeholder="เลือกชนิด..."
          options={typeOptions}
          value={findOption(typeOptions, filters.type)}
          onChange={handleTypeChange}
          isClearable={false}
          isSearchable={false}
        />
      </div>

      {/* วันที่เริ่มต้น */}
      <div style={{ minWidth: 160 }}>
        <DateInput
          label="ตั้งแต่"
          value={filters.from}
          onChange={(iso) => onChange('from', iso)}
          max={filters.to}
        />
      </div>

      {/* วันที่สิ้นสุด */}
      <div style={{ minWidth: 160 }}>
        <DateInput
          label="ถึง"
          value={filters.to}
          onChange={(iso) => onChange('to', iso)}
          min={filters.from}
        />
      </div>

      {/* ปุ่มค้นหา */}
      <div style={{ marginLeft: 'auto' }}>
        <Button
          variant="primary"
          icon={<Search size={14} />}
          onClick={onSearch}
          disabled={loading || !filters.type}
          loading={loading}
        >
          ค้นหา
        </Button>
      </div>
    </div>
  )
}