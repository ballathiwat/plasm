// frontend/src/components/common/DateInput.tsx
//
// Date input — ปฏิทินภาษาไทย, แสดงผล "27 ต.ค. 2026", ส่งค่า yyyy-mm-dd (ISO)
// Dependencies: react-datepicker, date-fns
//
// Usage:
//   <DateInput value="2026-10-27" onChange={(iso) => setDate(iso)} />
//   <DateInput label="วันที่เก็บ" value={form.date} onChange={handleDate} />

import { useMemo, useRef, type CSSProperties } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import { th } from 'date-fns/locale'
import { Calendar } from 'lucide-react'
import 'react-datepicker/dist/react-datepicker.css'

// Register Thai locale once
registerLocale('th', th)

/* ----------------------------------------------------------
   Types
---------------------------------------------------------- */
export interface DateInputProps {
  /** ISO string yyyy-mm-dd */
  value: string
  /** Callback — returns yyyy-mm-dd string */
  onChange: (isoDate: string) => void
  /** Field label */
  label?: string
  /** Placeholder (shown when empty) */
  placeholder?: string
  /** Disabled */
  disabled?: boolean
  /** Error message */
  error?: string
  /** Min date (yyyy-mm-dd) */
  min?: string
  /** Max date (yyyy-mm-dd) */
  max?: string
  /** Container className */
  className?: string
  /** Container style */
  style?: CSSProperties
}

/* ----------------------------------------------------------
   Helpers
---------------------------------------------------------- */
/** yyyy-mm-dd → Date object (or null) */
const parseISO = (iso: string): Date | null => {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

/** Date object → yyyy-mm-dd */
const toISO = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/* ----------------------------------------------------------
   Design tokens (Plasm)
---------------------------------------------------------- */
const TOKENS = {
  primary: '#2563eb',
  primaryLight: '#dbeafe',
  border: '#DDE3EA',
  borderFocus: '#2563eb',
  borderError: '#ef4444',
  bg: '#ffffff',
  text: '#1a2332',
  textMuted: '#5A6A7E',
  radius: '8px',
  font: "'Segoe UI', system-ui, -apple-system, sans-serif",
} as const

/* ----------------------------------------------------------
   Inject custom CSS once
---------------------------------------------------------- */
const STYLE_ID = 'dateinput-plasm-styles'

function ensureStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return

  const css = `
    /* ── Plasm DatePicker overrides ── */
    .plasm-dp-wrap { width: 100%; }
    .plasm-dp-wrap .react-datepicker-wrapper,
    .plasm-dp-wrap .react-datepicker__input-container { width: 100%; }

    .plasm-dp-wrap .react-datepicker__input-container input {
      width: 100%;
      padding: 10px 40px 10px 14px;
      border: 1px solid ${TOKENS.border};
      border-radius: ${TOKENS.radius};
      font-size: 14px;
      font-family: ${TOKENS.font};
      color: ${TOKENS.text};
      background: ${TOKENS.bg};
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      box-sizing: border-box;
    }
    .plasm-dp-wrap .react-datepicker__input-container input:focus {
      border-color: ${TOKENS.borderFocus};
      box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
    }
    .plasm-dp-wrap .react-datepicker__input-container input:disabled {
      background: #f1f5f9; cursor: not-allowed;
    }
    .plasm-dp-wrap.has-error .react-datepicker__input-container input {
      border-color: ${TOKENS.borderError};
    }
    .plasm-dp-wrap.has-error .react-datepicker__input-container input:focus {
      box-shadow: 0 0 0 3px rgba(239,68,68,0.15);
    }

    /* Calendar popup */
    .plasm-dp-popper .react-datepicker {
      font-family: ${TOKENS.font};
      border: 1px solid ${TOKENS.border};
      border-radius: 10px;
      box-shadow: 0 4px 16px rgba(26,35,50,0.12);
      overflow: hidden;
    }
    .plasm-dp-popper .react-datepicker__header {
      background: #f8fafc;
      border-bottom: 1px solid ${TOKENS.border};
      padding-top: 12px;
    }
    .plasm-dp-popper .react-datepicker__current-month {
      font-size: 14px; font-weight: 600;
      color: ${TOKENS.text}; margin-bottom: 8px;
    }
    .plasm-dp-popper .react-datepicker__day-name {
      font-size: 12px; color: ${TOKENS.textMuted};
      font-weight: 500; width: 36px; line-height: 36px;
    }
    .plasm-dp-popper .react-datepicker__day {
      width: 36px; line-height: 36px; border-radius: 8px;
      font-size: 13px; color: ${TOKENS.text}; transition: background 0.1s;
    }
    .plasm-dp-popper .react-datepicker__day:hover {
      background: ${TOKENS.primaryLight};
    }
    .plasm-dp-popper .react-datepicker__day--selected,
    .plasm-dp-popper .react-datepicker__day--keyboard-selected {
      background: ${TOKENS.primary} !important;
      color: #fff !important; font-weight: 600;
    }
    .plasm-dp-popper .react-datepicker__day--today { font-weight: 700; }
    .plasm-dp-popper .react-datepicker__day--outside-month { color: #cbd5e1; }
    .plasm-dp-popper .react-datepicker__navigation { top: 12px; }

    /* Month/Year dropdown selects */
    .plasm-dp-popper .react-datepicker__month-select,
    .plasm-dp-popper .react-datepicker__year-select {
      padding: 2px 4px; border: 1px solid ${TOKENS.border};
      border-radius: 4px; font-size: 13px;
      font-family: ${TOKENS.font}; color: ${TOKENS.text}; cursor: pointer;
    }
  `

  const el = document.createElement('style')
  el.id = STYLE_ID
  el.textContent = css
  document.head.appendChild(el)
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
  ensureStyles()

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
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 500,
            color: TOKENS.text,
            marginBottom: 6,
            fontFamily: TOKENS.font,
          }}
        >
          {label}
        </label>
      )}

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

        {/* Calendar icon */}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => calRef.current?.setOpen(true)}
          disabled={disabled}
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            color: TOKENS.textMuted,
            zIndex: 1,
          }}
        >
          <Calendar size={16} />
        </button>
      </div>

      {error && (
        <p
          style={{
            fontSize: 12,
            color: TOKENS.borderError,
            marginTop: 4,
            fontFamily: TOKENS.font,
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}