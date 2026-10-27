// frontend/src/components/common/Button.tsx
//
// Reusable Button — variant, size, icon, loading
// CSS: src/assets/styles/common/button.css

import { type ReactNode, type CSSProperties, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import '../../assets/styles/components/button.css'

/* ----------------------------------------------------------
   Types
---------------------------------------------------------- */
export type ButtonVariant =
  | 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  | 'outline' | 'outline-danger' | 'outline-success'

export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  iconRight?: ReactNode
  loading?: boolean
  block?: boolean
  pill?: boolean
  style?: CSSProperties
  children?: ReactNode
}

/* ----------------------------------------------------------
   Size → loader icon size
---------------------------------------------------------- */
const LOADER_SIZE: Record<ButtonSize, number> = { sm: 12, md: 14, lg: 16 }

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
  style,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading

  const cls = [
    'plasm-btn',
    `plasm-btn--${variant}`,
    `plasm-btn--${size}`,
    block && 'plasm-btn--block',
    pill && 'plasm-btn--pill',
    loading && 'plasm-btn--loading',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={cls}
      style={style}
    >
      {loading ? (
        <Loader2 size={LOADER_SIZE[size]} className="plasm-btn__spinner" />
      ) : icon ? (
        icon
      ) : null}

      {children && <span>{children}</span>}

      {!loading && iconRight}
    </button>
  )
}