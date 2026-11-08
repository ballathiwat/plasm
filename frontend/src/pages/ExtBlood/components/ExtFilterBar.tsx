// frontend/src/pages/ExtBlood/components/ExtFilterBar.tsx
import { useMemo, useState } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import FormInput from '../../../components/common/FormInput'
import SelectDropdown, { type OptionType } from '../../../components/common/SelectDropdown'
import DateInput from '../../../components/common/DateInput'
import Button from '../../../components/common/Button'
import type { ExtListFilter, ExtSource, ExtBloodProduct } from '../services/ExtBloodType'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
const find = (opts: OptionType[], v?: string) => opts.find((o) => o.value === (v || '')) ?? null
const CLEAR = { dateFrom: undefined, dateTo: undefined, sourceId: undefined, bloodProductId: undefined, bloodGroup: undefined, search: undefined }

interface Props { filter: ExtListFilter; sources: ExtSource[]; bloodProducts: ExtBloodProduct[]; onFilter: (f: Partial<ExtListFilter>) => void }

export default function ExtFilterBar({ filter, sources, bloodProducts, onFilter }: Props) {
  const [open, setOpen] = useState(false)
  const srcO = useMemo<OptionType[]>(() => [{ value: '', label: 'สถานที่ทั้งหมด' }, ...sources.map((s) => ({ value: s.id, label: s.name }))], [sources])
  const prodO = useMemo<OptionType[]>(() => [{ value: '', label: 'ชนิดเลือดทั้งหมด' }, ...bloodProducts.map((b) => ({ value: b.id, label: `${b.code}${b.name ? ` (${b.name})` : ''}` }))], [bloodProducts])
  const grpO = useMemo<OptionType[]>(() => [{ value: '', label: 'หมู่เลือดทั้งหมด' }, ...BLOOD_GROUPS.map((g) => ({ value: g, label: g }))], [])
  const n = [filter.dateFrom || filter.dateTo, filter.sourceId, filter.bloodProductId, filter.bloodGroup].filter(Boolean).length
  const any = n > 0 || !!filter.search

  return (
    <>
      <div className="ext-filter-row">
        <div className="ext-filter-search">
          <FormInput placeholder="ค้นหาเลขเอกสาร หรือเลขถุงเลือด..." value={filter.search || ''} onChange={(v) => onFilter({ search: v || undefined })} icon={<Search size={14} />} />
        </div>
        <Button variant={open || n ? 'outline' : 'secondary'} icon={<SlidersHorizontal size={16} />} onClick={() => setOpen(!open)} aria-expanded={open}>
          ตัวกรอง{n ? ` (${n})` : ''}
        </Button>
        {any && <Button variant="ghost" icon={<X size={16} />} onClick={() => onFilter(CLEAR)}>ล้างทั้งหมด</Button>}
      </div>
      {open && (
        <div className="ext-filter-panel">
          <div className="ext-filter-panel__dates">
            <div className="ext-form-label">ช่วงวันที่รับ</div>
            <div className="ext-filter-panel__range">
              <DateInput value={filter.dateFrom || ''} onChange={(iso) => onFilter({ dateFrom: iso || undefined })} max={filter.dateTo} placeholder="ตั้งแต่" />
              <span>ถึง</span>
              <DateInput value={filter.dateTo || ''} onChange={(iso) => onFilter({ dateTo: iso || undefined })} min={filter.dateFrom} placeholder="ถึงวันที่" />
            </div>
          </div>
          <SelectDropdown label="สถานที่ส่ง" options={srcO} value={find(srcO, filter.sourceId)} onChange={(o) => onFilter({ sourceId: o?.value || undefined })} isClearable={false} isSearchable={false} />
          <SelectDropdown label="ชนิดเลือด" options={prodO} value={find(prodO, filter.bloodProductId)} onChange={(o) => onFilter({ bloodProductId: o?.value || undefined })} isClearable={false} isSearchable={false} />
          <SelectDropdown label="หมู่เลือด" options={grpO} value={find(grpO, filter.bloodGroup)} onChange={(o) => onFilter({ bloodGroup: o?.value || undefined })} isClearable={false} isSearchable={false} />
        </div>
      )}
    </>
  )
}
