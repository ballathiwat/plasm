// ============================================================
//  src/pages/map/components/MapFilterBar.tsx
//  ตัวกรองของแท็บ "เก่าสุด / ใหม่สุด" — หมู่เลือด + ชนิดเลือด
//  ไม่มีผลกับแท็บ "แผนผัง" และการ์ดสรุป
// ============================================================

import { X } from 'lucide-react'
import BloodGroupSelect from '../../../components/common/BloodGroupSelect'
import PlasmaTypeSelect from '../../../components/common/PlasmaTypeSelect'
import Button from '../../../components/common/Button'
import type { MapFilters } from '../services/MapType'

interface Props {
  filters: MapFilters
  hasFilter: boolean
  filtering: boolean
  onBloodChange: (blood: string) => void
  onTypeChange: (type: string) => void
  onClear: () => void
}

export default function MapFilterBar({
  filters,
  hasFilter,
  filtering,
  onBloodChange,
  onTypeChange,
  onClear,
}: Props) {
  return (
    <div className="plasm-filter" role="search" aria-label="กรองกล่องเก่าสุด / ใหม่สุด">
      <div className="plasm-filter__item">
        <BloodGroupSelect
          value={filters.blood}
          onChange={onBloodChange}
          allLabel="ทุกหมู่เลือด"
        />
      </div>
      <div className="plasm-filter__item">
        <PlasmaTypeSelect
          value={filters.type}
          onChange={(code) => onTypeChange(code)}
          allLabel="ทุกชนิด"
        />
      </div>
      <div className="plasm-filter__item--fixed">
        <Button
          variant="ghost"
          icon={<X size={14} />}
          onClick={onClear}
          disabled={!hasFilter}
        >
          ล้างตัวกรอง
        </Button>
      </div>
      <div className="map-filter__status" aria-live="polite">
        {filtering ? 'กำลังโหลด...' : ''}
      </div>
    </div>
  )
}
