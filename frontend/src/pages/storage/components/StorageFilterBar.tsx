// ============================================================
//  frontend/src/pages/storage/components/StorageFilterBar.tsx
//  ค้นหา + panel ตัวกรอง (pattern เดียวกับ ExtFilterBar)
// ============================================================

import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import FormInput from '../../../components/common/FormInput'
import SelectDropdown, { type OptionType } from '../../../components/common/SelectDropdown'
import DateInput from '../../../components/common/DateInput'
import Button from '../../../components/common/Button'
import type { StorageListFilter } from '../services/StorageType'
import type { StorageListMaster } from '../services/useStorageList'

const find = (opts: OptionType[], v?: string) => opts.find((o) => o.value === (v || '')) ?? null

interface Props {
  filter: StorageListFilter
  searchInput: string
  master: StorageListMaster
  onSearchInput: (v: string) => void
  onFilter: (patch: Partial<StorageListFilter>) => void
  onClear: () => void
}

export default function StorageFilterBar({ filter, searchInput, master, onSearchInput, onFilter, onClear }: Props) {
  const [open, setOpen] = useState(false)

  const zoneO = useMemo<OptionType[]>(
    () => [{ value: '', label: 'ห้อง/ตู้ทั้งหมด' }, ...master.zones.map((z) => ({ value: z.id, label: z.name }))],
    [master.zones],
  )
  const typeO = useMemo<OptionType[]>(
    () => [{ value: '', label: 'ชนิดเลือดทั้งหมด' }, ...master.plasmaTypes.map((t) => ({ value: t.code, label: t.code }))],
    [master.plasmaTypes],
  )
  const bloodO = useMemo<OptionType[]>(
    () => [{ value: '', label: 'หมู่เลือดทั้งหมด' }, ...master.bloodTypes.map((b) => ({ value: b.code, label: b.code }))],
    [master.bloodTypes],
  )

  const n = [filter.dateFrom || filter.dateTo, filter.zoneId, filter.type, filter.blood].filter(Boolean).length
  const any = n > 0 || !!searchInput

  return (
    <>
      <div className="ext-filter-row">
        <div className="ext-filter-search">
          <FormInput
            type="search"
            aria-label="ค้นหากล่อง"
            placeholder="ค้นหาหมายเลขกล่อง ชื่อกล่อง หรือเลข unit..."
            value={searchInput}
            onChange={onSearchInput}
            icon={<Search size={14} />}
          />
        </div>
        <Button
          variant={open || n ? 'outline' : 'secondary'}
          icon={<SlidersHorizontal size={16} />}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          ตัวกรอง{n ? ` (${n})` : ''}
        </Button>
        {any && <Button variant="ghost" icon={<X size={16} />} onClick={onClear}>ล้างทั้งหมด</Button>}
      </div>

      {open && (
        <div className="ext-filter-panel">
          <div className="ext-filter-panel__dates">
            <div className="sto-label">ช่วงวันที่เก็บ</div>
            <div className="ext-filter-panel__range">
              <DateInput value={filter.dateFrom || ''} onChange={(iso) => onFilter({ dateFrom: iso || undefined })} max={filter.dateTo} placeholder="ตั้งแต่" />
              <span>ถึง</span>
              <DateInput value={filter.dateTo || ''} onChange={(iso) => onFilter({ dateTo: iso || undefined })} min={filter.dateFrom} placeholder="ถึงวันที่" />
            </div>
          </div>
          <SelectDropdown label="ห้อง/ตู้" options={zoneO} value={find(zoneO, filter.zoneId)} onChange={(o) => onFilter({ zoneId: o?.value || undefined })} isClearable={false} isSearchable={false} />
          <SelectDropdown label="ชนิดเลือด" options={typeO} value={find(typeO, filter.type)} onChange={(o) => onFilter({ type: o?.value || undefined })} isClearable={false} isSearchable={false} />
          <SelectDropdown label="หมู่เลือด" options={bloodO} value={find(bloodO, filter.blood)} onChange={(o) => onFilter({ blood: o?.value || undefined })} isClearable={false} isSearchable={false} />
        </div>
      )}
    </>
  )
}
