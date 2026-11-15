// ============================================================
//  src/pages/map/components/MapFilterBar.tsx
//  ตัวกรองของแท็บ "เก่าสุด / ใหม่สุด" — คลัง (ภายใน/ภายนอก) + หมู่เลือด + ชนิด
//  ไม่มีผลกับแท็บ "แผนผัง" และการ์ดสรุป
//  เปลี่ยนค่าในฟอร์มยังไม่ค้นหา — ค้นหาเมื่อกดปุ่ม "ค้นหา" เท่านั้น
// ============================================================

import type { FormEvent } from 'react'
import { Info, RotateCcw, Search } from 'lucide-react'
import BloodGroupSelect from '../../../components/common/BloodGroupSelect'
import PlasmaTypeSelect from '../../../components/common/PlasmaTypeSelect'
import Button from '../../../components/common/Button'
import MapSourceToggle from './MapSourceToggle'
import { SOURCE_DATE_LABEL } from '../services/mapAgeHelpers'
import type { MapFilters, MapSource } from '../services/MapType'

interface Props {
  source: MapSource
  /** ค่าที่เลือกอยู่ในฟอร์ม (ยังไม่ได้ค้นหา) */
  draft: MapFilters
  /** ฟอร์มต่างจากผลลัพธ์ที่แสดงอยู่ */
  isDirty: boolean
  canClear: boolean
  busy: boolean
  onSourceChange: (source: MapSource) => void
  onBloodChange: (blood: string) => void
  onTypeChange: (type: string) => void
  onSearch: () => void
  onClear: () => void
}

// ชนิดเลือดของทั้งสองคลังมาจาก master_plasma_types ตารางเดียวกัน — ต่างกันที่ป้ายกำกับ
const TYPE_LABEL: Record<MapSource, string> = { in: 'ชนิดพลาสมา', ex: 'ชนิดเลือด' }

export default function MapFilterBar({
  source,
  draft,
  isDirty,
  canClear,
  busy,
  onSourceChange,
  onBloodChange,
  onTypeChange,
  onSearch,
  onClear,
}: Props) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!busy) onSearch()
  }

  const status = busy
    ? 'กำลังโหลด...'
    : isDirty
      ? 'เปลี่ยนตัวกรองแล้ว — กด "ค้นหา" เพื่อแสดงผล'
      : `เรียงตาม${SOURCE_DATE_LABEL[source]} — ใช้กล่อง "เก่าสุด" ก่อน`

  return (
    <form
      className="plasm-filter map-filter"
      role="search"
      aria-label="กรองกล่องเก่าสุด / ใหม่สุด"
      onSubmit={handleSubmit}
    >
      <div className="plasm-filter__item--fixed">
        <MapSourceToggle value={source} onChange={onSourceChange} />
      </div>
      <div className="plasm-filter__item">
        <BloodGroupSelect
          value={draft.blood}
          onChange={onBloodChange}
          allLabel="ทุกหมู่เลือด"
          disabled={busy}
        />
      </div>
      <div className="plasm-filter__item">
        <PlasmaTypeSelect
          key={source}
          label={TYPE_LABEL[source]}
          value={draft.type}
          onChange={(code) => onTypeChange(code)}
          allLabel="ทุกชนิด"
          disabled={busy}
        />
      </div>
      <div className="plasm-filter__item--fixed map-filter__actions">
        <Button type="submit" variant="primary" icon={<Search size={14} />} loading={busy}>
          ค้นหา
        </Button>
        <Button
          type="button"
          variant="ghost"
          icon={<RotateCcw size={14} />}
          onClick={onClear}
          disabled={!canClear || busy}
        >
          ล้างค่า
        </Button>
      </div>
      <div className="map-filter__status" aria-live="polite">
        <Info size={14} aria-hidden="true" />
        <span>{status}</span>
      </div>
    </form>
  )
}
