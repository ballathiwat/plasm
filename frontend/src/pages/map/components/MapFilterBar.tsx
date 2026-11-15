// ============================================================
//  src/pages/map/components/MapFilterBar.tsx
//  ตัวกรองของแท็บ "เก่าสุด / ใหม่สุด" — หมู่เลือด + ชนิดเลือด
//  ไม่มีผลกับแท็บ "แผนผัง" และการ์ดสรุป
//  เปลี่ยนค่าในฟอร์มยังไม่ค้นหา — ค้นหาเมื่อกดปุ่ม "ค้นหา" เท่านั้น
// ============================================================

import type { FormEvent } from 'react'
import { RotateCcw, Search } from 'lucide-react'
import BloodGroupSelect from '../../../components/common/BloodGroupSelect'
import PlasmaTypeSelect from '../../../components/common/PlasmaTypeSelect'
import Button from '../../../components/common/Button'
import type { MapFilters } from '../services/MapType'

interface Props {
  /** ค่าที่เลือกอยู่ในฟอร์ม (ยังไม่ได้ค้นหา) */
  draft: MapFilters
  /** ฟอร์มต่างจากผลลัพธ์ที่แสดงอยู่ */
  isDirty: boolean
  canClear: boolean
  filtering: boolean
  onBloodChange: (blood: string) => void
  onTypeChange: (type: string) => void
  onSearch: () => void
  onClear: () => void
}

export default function MapFilterBar({
  draft,
  isDirty,
  canClear,
  filtering,
  onBloodChange,
  onTypeChange,
  onSearch,
  onClear,
}: Props) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!filtering) onSearch()
  }

  const status = filtering
    ? 'กำลังโหลด...'
    : isDirty
      ? 'เปลี่ยนตัวกรองแล้ว — กด "ค้นหา" เพื่อแสดงผล'
      : ''

  return (
    <form
      className="plasm-filter"
      role="search"
      aria-label="กรองกล่องเก่าสุด / ใหม่สุด"
      onSubmit={handleSubmit}
    >
      <div className="plasm-filter__item">
        <BloodGroupSelect
          value={draft.blood}
          onChange={onBloodChange}
          allLabel="ทุกหมู่เลือด"
          disabled={filtering}
        />
      </div>
      <div className="plasm-filter__item">
        <PlasmaTypeSelect
          value={draft.type}
          onChange={(code) => onTypeChange(code)}
          allLabel="ทุกชนิด"
          disabled={filtering}
        />
      </div>
      <div className="plasm-filter__item--fixed map-filter__actions">
        <Button
          type="submit"
          variant="primary"
          icon={<Search size={14} />}
          loading={filtering}
        >
          ค้นหา
        </Button>
        <Button
          type="button"
          variant="ghost"
          icon={<RotateCcw size={14} />}
          onClick={onClear}
          disabled={!canClear || filtering}
        >
          ล้างค่า
        </Button>
      </div>
      <div className="map-filter__status" aria-live="polite">
        {status}
      </div>
    </form>
  )
}
