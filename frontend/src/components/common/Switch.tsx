// ============================================================
//  src/components/common/Switch.tsx
//
//  Reusable toggle switch — size, color, label, a11y
//  CSS: src/assets/styles/components/switch.css
//
//  Usage:
//    <Switch checked={on} onChange={setOn} label="เปิดใช้งาน" />
//    <Switch checked={on} onChange={setOn} label="ลายน้ำ" size="sm" />
//    <Switch checked={on} onChange={setOn} label="ลบข้อมูล" color="danger" />
//    <Switch checked={on} onChange={setOn} helper="แจ้งเตือนเมื่อมีการเปลี่ยนแปลง" />
// ============================================================

import { useCallback, type CSSProperties } from 'react'
import '../../assets/styles/components/switch.css'

/* ----------------------------------------------------------
   Types
---------------------------------------------------------- */
export type SwitchSize  = 'sm' | 'md' | 'lg'
export type SwitchColor = 'primary' | 'success' | 'danger' | 'warning'

export interface SwitchProps {
  /** สถานะเปิด/ปิด */
  checked: boolean
  /** callback เมื่อสลับ */
  onChange: (checked: boolean) => void
  /** ข้อความ label ข้างสวิตช์ */
  label?: string
  /** ข้อความอธิบายเพิ่มเติมใต้ label */
  helper?: string
  /** ขนาด (default: sm) */
  size?: SwitchSize
  /** สี track ตอนเปิด (default: primary) */
  color?: SwitchColor
  /** ปิดใช้งาน */
  disabled?: boolean
  /** label อยู่ซ้าย switch อยู่ขวา */
  reverse?: boolean
  /** className เพิ่มเติม */
  className?: string
  /** inline style */
  style?: CSSProperties
}

/* ----------------------------------------------------------
   Component
---------------------------------------------------------- */
export default function Switch({
  checked,
  onChange,
  label,
  helper,
  size = 'sm',
  color = 'primary',
  disabled = false,
  reverse = false,
  className = '',
  style,
}: SwitchProps) {
  const toggle = useCallback(() => {
    if (!disabled) onChange(!checked)
  }, [checked, disabled, onChange])

  const onKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        toggle()
      }
    },
    [toggle],
  )

  const cls = [
    'plasm-switch',
    `plasm-switch--${size}`,
    color !== 'primary' && `plasm-switch--${color}`,
    checked && 'plasm-switch--on',
    disabled && 'plasm-switch--disabled',
    reverse && 'plasm-switch--reverse',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      aria-label={label}
      tabIndex={disabled ? -1 : 0}
      className={cls}
      style={style}
      onClick={toggle}
      onKeyDown={onKey}
    >
      <span className="plasm-switch__track">
        <span className="plasm-switch__thumb" />
      </span>

      {(label || helper) && (
        <span>
          {label && <span className="plasm-switch__label">{label}</span>}
          {helper && <div className="plasm-switch__helper">{helper}</div>}
        </span>
      )}
    </div>
  )
}
