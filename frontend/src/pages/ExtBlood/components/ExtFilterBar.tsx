// frontend/src/pages/ExtBlood/components/ExtFilterBar.tsx

import { useMemo } from 'react'
import { Search, X } from 'lucide-react'
import FormInput from '../../../components/common/FormInput'
import SelectDropdown, { type OptionType } from '../../../components/common/SelectDropdown'
import DateInput from '../../../components/common/DateInput'
import Button from '../../../components/common/Button'
import type { ExtListFilter, ExtSource, ExtBloodProduct } from '../services/ExtBloodType'

const BLOOD_GROUPS = ['A+','A-','B+','B-','O+','O-','AB+','AB-']

const toOption = (value: string, label: string): OptionType => ({ value, label })
const findOption = (opts: OptionType[], val?: string) =>
  opts.find(o => o.value === val) ?? null

interface Props {
  filter: ExtListFilter
  sources: ExtSource[]
  bloodProducts: ExtBloodProduct[]
  onFilter: (f: Partial<ExtListFilter>) => void
}

export default function ExtFilterBar({ filter, sources, bloodProducts, onFilter }: Props) {
  const sourceOpts = useMemo<OptionType[]>(
    () => [
      { value: '', label: 'สถานที่ทั้งหมด' },
      ...sources.map(s => toOption(s.id, s.name)),
    ],
    [sources],
  )
  const productOpts = useMemo<OptionType[]>(
    () => [
      { value: '', label: 'ชนิดเลือดทั้งหมด' },
      ...bloodProducts.map(b => toOption(b.id, `${b.code}${b.name ? ` (${b.name})` : ''}`)),
    ],
    [bloodProducts],
  )
  const bloodOpts = useMemo<OptionType[]>(
    () => [
      { value: '', label: 'หมู่เลือดทั้งหมด' },
      ...BLOOD_GROUPS.map(g => toOption(g, g)),
    ],
    [],
  )

  const hasFilter = filter.dateFrom || filter.dateTo || filter.sourceId || filter.bloodProductId || filter.bloodGroup || filter.search

  return (
    <div className="ext-filter-bar">
      <div className="ext-filter-search" style={{ minWidth: 220 }}>
        <FormInput
          placeholder="ค้นหาเลขเอกสาร, เลขถุงเลือด..."
          value={filter.search || ''}
          onChange={val => onFilter({ search: val })}
          icon={<Search size={14} />}
          size="sm"
        />
      </div>

      <div style={{ minWidth: 140 }}>
        <DateInput
          value={filter.dateFrom || ''}
          onChange={iso => onFilter({ dateFrom: iso || undefined })}
          max={filter.dateTo}
        />
      </div>
      <span className="ext-filter-dash">–</span>
      <div style={{ minWidth: 140 }}>
        <DateInput
          value={filter.dateTo || ''}
          onChange={iso => onFilter({ dateTo: iso || undefined })}
          min={filter.dateFrom}
        />
      </div>

      <div style={{ minWidth: 160 }}>
        <SelectDropdown
          placeholder="สถานที่ทั้งหมด"
          options={sourceOpts}
          value={findOption(sourceOpts, filter.sourceId || '')}
          onChange={opt => onFilter({ sourceId: opt?.value || undefined })}
          isClearable={false}
          isSearchable={false}
        />
      </div>

      <div style={{ minWidth: 160 }}>
        <SelectDropdown
          placeholder="ชนิดเลือดทั้งหมด"
          options={productOpts}
          value={findOption(productOpts, filter.bloodProductId || '')}
          onChange={opt => onFilter({ bloodProductId: opt?.value || undefined })}
          isClearable={false}
          isSearchable={false}
        />
      </div>

      <div style={{ minWidth: 140 }}>
        <SelectDropdown
          placeholder="หมู่เลือดทั้งหมด"
          options={bloodOpts}
          value={findOption(bloodOpts, filter.bloodGroup || '')}
          onChange={opt => onFilter({ bloodGroup: opt?.value || undefined })}
          isClearable={false}
          isSearchable={false}
        />
      </div>

      {hasFilter && (
        <Button
          variant="ghost"
          size="sm"
          icon={<X size={14} />}
          onClick={() => onFilter({
            dateFrom: undefined, dateTo: undefined,
            sourceId: undefined, bloodProductId: undefined,
            bloodGroup: undefined, search: undefined,
          })}
        >
          ล้าง
        </Button>
      )}
    </div>
  )
}
