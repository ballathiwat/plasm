// frontend/src/components/common/Button.tsx
//
// Reusable Button — รองรับ variant, size, icon, loading
//
// Usage:
//   <Button onClick={save}>บันทึก</Button>
//   <Button variant="secondary" onClick={cancel}>ยกเลิก</Button>
//   <Button variant="danger" icon={<Trash size={14} />}>ลบ</Button>
//   <Button loading>กำลังบันทึก...</Button>
//   <Button size="sm" variant="ghost" icon={<RotateCcw size={12} />}>ล้าง</Button>

import { type ReactNode, type CSSProperties, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

/* ----------------------------------------------------------
   Types
---------------------------------------------------------- */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline' | 'outline-danger' | 'outline-success'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  /** Visual variant */
  variant?: ButtonVariant
  /** Size preset */
  size?: ButtonSize
  /** Icon element (left side) */
  icon?: ReactNode
  /** Icon element (right side) */
  iconRight?: ReactNode
  /** Show loading spinner + disable */
  loading?: boolean
  /** Full width */
  block?: boolean
  /** Pill/rounded style */
  pill?: boolean
  /** Extra inline styles (merged, not replaced) */
  style?: CSSProperties
  children?: ReactNode
}

/* ----------------------------------------------------------
   Design tokens
---------------------------------------------------------- */
const TOKENS = {
  font: "var(--font-family, 'IBM Plex Sans Thai', system-ui, sans-serif)",  radius: 'var(--radius-sm, 6px)',
  radiusPill: '99px',
  transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s, opacity 0.15s',
} as const

/* ----------------------------------------------------------
   Variant styles
---------------------------------------------------------- */
const VARIANT_MAP: Record<ButtonVariant, {
  bg: string; bgHover: string; color: string
  border: string; borderHover: string
}> = {
  primary: {
    bg: 'var(--primary, #2563EB)',
    bgHover: 'var(--primary-dark, #1d4ed8)',
    color: '#fff',
    border: 'transparent',
    borderHover: 'transparent',
  },
  secondary: {
    bg: 'var(--surface, #fff)',
    bgHover: 'var(--surface-raised, #F4F4F5)',
    color: 'var(--text-primary, #18181B)',
    border: 'var(--border, #E4E4E7)',
    borderHover: 'var(--text-secondary, #71717A)',
  },
  ghost: {
    bg: 'transparent',
    bgHover: 'var(--surface-raised, #F4F4F5)',
    color: 'var(--text-secondary, #71717A)',
    border: 'transparent',
    borderHover: 'transparent',
  },
  danger: {
    bg: '#DC2626',
    bgHover: '#B91C1C',
    color: '#fff',
    border: 'transparent',
    borderHover: 'transparent',
  },
  success: {
    bg: '#16A34A',
    bgHover: '#15803D',
    color: '#fff',
    border: 'transparent',
    borderHover: 'transparent',
  },
  outline: {
    bg: 'transparent',
    bgHover: 'rgba(37,99,235,0.06)',
    color: 'var(--primary, #2563EB)',
    border: 'var(--primary, #2563EB)',
    borderHover: 'var(--primary-dark, #1d4ed8)',
  },
  'outline-danger': {
    bg: 'transparent',
    bgHover: 'rgba(220,38,38,0.06)',
    color: '#DC2626',
    border: '#DC2626',
    borderHover: '#B91C1C',
  },
  'outline-success': {
    bg: 'transparent',
    bgHover: 'rgba(22,163,74,0.06)',
    color: '#16A34A',
    border: '#16A34A',
    borderHover: '#15803D',
  },
}

/* ----------------------------------------------------------
   Size presets
---------------------------------------------------------- */
const SIZE_MAP: Record<ButtonSize, {
  padding: string; fontSize: number; fontWeight: number; iconGap: number; loaderSize: number
}> = {
  sm: { padding: '6px 12px', fontSize: 12, fontWeight: 500, iconGap: 4, loaderSize: 12 },
  md: { padding: '10px 20px', fontSize: 14, fontWeight: 600, iconGap: 6, loaderSize: 14 },
  lg: { padding: '12px 28px', fontSize: 15, fontWeight: 600, iconGap: 8, loaderSize: 16 },
}

/* ----------------------------------------------------------
   Component
---------------------------------------------------------- */
export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  block = false,
  pill = false,
  disabled,
  style: extraStyle,
  children,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: ButtonProps) {
  const v = VARIANT_MAP[variant]
  const s = SIZE_MAP[size]
  const isDisabled = disabled || loading

  const baseStyle: CSSProperties = {
    display: block ? 'flex' : 'inline-flex',
    width: block ? '100%' : undefined,
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.iconGap,
    padding: s.padding,
    fontSize: s.fontSize,
    fontWeight: s.fontWeight,
    fontFamily: TOKENS.font,
    lineHeight: 1.2,
    borderRadius: pill ? TOKENS.radiusPill : TOKENS.radius,
    border: `1px solid ${v.border}`,
    background: v.bg,
    color: v.color,
    cursor: isDisabled ? (loading ? 'wait' : 'not-allowed') : 'pointer',
    opacity: isDisabled ? 0.6 : 1,
    transition: TOKENS.transition,
    whiteSpace: 'nowrap',
    userSelect: 'none',
    outline: 'none',
    ...extraStyle,
  }

  // Hover handlers (inline — no CSS class needed)
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      e.currentTarget.style.background = v.bgHover
      e.currentTarget.style.borderColor = v.borderHover
    }
    onMouseEnter?.(e)
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      e.currentTarget.style.background = v.bg
      e.currentTarget.style.borderColor = v.border
    }
    onMouseLeave?.(e)
  }

  return (
    <button
      {...rest}
      disabled={isDisabled}
      style={baseStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {loading ? (
        <Loader2 size={s.loaderSize} style={{ animation: 'plasm-spin 0.8s linear infinite' }} />
      ) : icon ? (
        icon
      ) : null}

      {children && <span>{children}</span>}

      {!loading && iconRight}
    </button>
  )
}