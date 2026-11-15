// ============================================================
//  frontend/src/pages/storage/components/StorageUnitScanner.tsx
//  ส่วน "สแกนถุง" ของฟอร์มจัดเก็บ: ช่องสแกน + ช่องถุง 1–12 (หน้า → หลัง)
// ============================================================

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { CircleCheck, Plus, ScanBarcode, X } from 'lucide-react'
import FormInput from '../../../components/common/FormInput'
import Button from '../../../components/common/Button'
import { BOX_CAPACITY } from '../../../helpers/rack'

interface Props {
  units: string[]
  input: string
  /** ข้อความ error ใต้ช่องสแกน (รูปแบบผิด / ซ้ำ / ยังไม่ได้สแกน) */
  error?: string
  checking: boolean
  disabled?: boolean
  onInputChange: (v: string) => void
  onAdd: () => void
  onKeyDown: (e: KeyboardEvent) => void
  onRemove: (unit: string) => void
}

const SLOTS = Array.from({ length: BOX_CAPACITY }, (_, i) => i + 1)

export default function StorageUnitScanner({
  units, input, error, checking, disabled = false, onInputChange, onAdd, onKeyDown, onRemove,
}: Props) {
  const full = units.length >= BOX_CAPACITY
  const scanRef = useRef<HTMLDivElement>(null)

  // เพิ่ม/ลบถุงแล้ว → กลับไปที่ช่องสแกน · ถุงที่เพิ่งสแกน flash เขียว 1.2 วิ
  const [flash, setFlash] = useState<string | null>(null)
  const prev = useRef(units.length)
  useEffect(() => {
    const grew = units.length > prev.current
    const changed = units.length !== prev.current
    prev.current = units.length
    if (changed) scanRef.current?.querySelector('input')?.focus()
    if (!grew) return
    setFlash(units[units.length - 1])
    const t = window.setTimeout(() => setFlash(null), 1200)
    return () => window.clearTimeout(t)
  }, [units])

  return (
    <div className="ext-bags">
      <div
        className={`sto-progress ${full ? 'is-full' : ''}`}
        role="progressbar"
        aria-label="จำนวนถุงในกล่อง"
        aria-valuemin={0}
        aria-valuemax={BOX_CAPACITY}
        aria-valuenow={units.length}
      >
        <span style={{ width: `${(units.length / BOX_CAPACITY) * 100}%` }} />
      </div>

      {full && (
        <p className="sto-banner sto-banner--success sto-banner--inline" role="status">
          <CircleCheck size={16} aria-hidden="true" /> กล่องเต็ม {BOX_CAPACITY} ถุง — พร้อมบันทึก
        </p>
      )}

      <div className="ext-bags__input" ref={scanRef}>
        <div className="sto-scan__field">
          <FormInput
            label="เลข Unit"
            mono
            icon={<ScanBarcode size={14} />}
            placeholder={full ? `กล่องเต็ม ${BOX_CAPACITY} ถุงแล้ว` : `สแกนเลขถุงที่ ${units.length + 1} แล้วกด Enter`}
            value={input}
            onChange={(v) => onInputChange(v.toUpperCase())}
            onKeyDown={onKeyDown}
            disabled={full || disabled}
            error={error || undefined}
          />
        </div>
        <div className="ext-bags__add">
          <Button variant="primary" icon={<Plus size={14} />} onClick={onAdd} disabled={full || disabled || !input.trim()} loading={checking}>
            เพิ่ม
          </Button>
        </div>
      </div>

      <div className="sto-scan__order" aria-hidden="true">→ หน้า (ฝาเปิด) → หลัง</div>
      <ol className="ext-bags__grid sto-scan__grid" aria-label="ลำดับถุงในกล่อง จากหน้าไปหลัง">
        {SLOTS.map((n) => {
          const unit = units[n - 1]
          const next = !unit && n === units.length + 1
          return (
            <li key={n} className={`ext-bag${unit ? ' is-filled' : ''}${next ? ' is-next' : ''}${unit && unit === flash ? ' is-hot' : ''}`}>
              <span className="ext-bag__no">ถุงที่ {n}</span>
              {unit
                ? <span className="ext-bag__unit">{unit}</span>
                : <span className="ext-bag__empty">{next ? 'สแกนถัดไป' : 'ว่าง'}</span>}
              {unit && (
                <button type="button" className="ext-bag__x" aria-label={`ลบถุง ${unit}`} disabled={disabled} onClick={() => onRemove(unit)}>
                  <X size={16} />
                </button>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
