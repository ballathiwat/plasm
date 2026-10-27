// frontend/src/components/common/DateInput.tsx
//
// Date input — ปฏิทินภาษาไทย, แสดงผล dd-MM-yyyy, ส่งค่า yyyy-mm-dd (ISO)
// CSS: src/assets/styles/common/date-input.css

import { useMemo, useRef, type CSSProperties } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import { th } from 'date-fns/locale'
import { Calendar } from 'lucide-react'
import 'react-datepicker/dist/react-datepicker.css'
import '../../assets/styles/components/date-input.css'

registerLocale('th', th)

/* ----------------------------------------------------------
   Types
---------------------------------------------------------- */
export interface DateInputProps {
  value: string
  onChange: (isoDate: string) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  min?: string
  max?: string
  className?: string
  style?: CSSProperties
}

/* ----------------------------------------------------------
   Helpers
---------------------------------------------------------- */
const parseISO = (iso: string): Date | null => {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

const toISO = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/* ----------------------------------------------------------
   Component
---------------------------------------------------------- */
export default function DateInput({
  value,
  onChange,
  label,
  placeholder = 'เลือกวันที่...',
  disabled = false,
  error,
  min,
  max,
  className = '',
  style,
}: DateInputProps) {
  const calRef = useRef<DatePicker>(null)
  const selected = useMemo(() => parseISO(value), [value])
  const minDate = useMemo(() => (min ? parseISO(min) : undefined), [min])
  const maxDate = useMemo(() => (max ? parseISO(max) : undefined), [max])

  const handleChange = (date: Date | null) => {
    onChange(date ? toISO(date) : '')
  }

  const wrapperClass = [
    'plasm-dp-wrap',
    error ? 'has-error' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapperClass} style={style}>
      {label && <label className="plasm-dp-label">{label}</label>}

      <div style={{ position: 'relative' }}>
        <DatePicker
          ref={calRef}
          locale="th"
          selected={selected}
          onChange={handleChange}
          dateFormat="dd-MM-yyyy"
          placeholderText={placeholder}
          disabled={disabled}
          minDate={minDate ?? undefined}
          maxDate={maxDate ?? undefined}
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          popperClassName="plasm-dp-popper"
          autoComplete="off"
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={() => calRef.current?.setOpen(true)}
          disabled={disabled}
          className="plasm-dp-icon"
        >
          <Calendar size={16} />
        </button>
      </div>

      {error && <p className="plasm-dp-error">{error}</p>}
    </div>
  )
}