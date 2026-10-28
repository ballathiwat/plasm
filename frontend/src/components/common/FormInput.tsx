// frontend/src/components/common/FormInput.tsx
//
// Reusable form input — text, password (toggle), number, textarea
// CSS: src/assets/styles/components/form-input.css
//
// Usage:
//   <FormInput label="ชื่อผู้ใช้" value={v} onChange={setV} />
//   <FormInput label="รหัสผ่าน" type="password" value={v} onChange={setV} />
//   <FormInput label="หมายเหตุ" type="textarea" value={v} onChange={setV} />
//   <FormInput label="Unit" value={v} onChange={setV} mono icon={<Search size={14} />} />

import {
  useState,
  useCallback,
  type ReactNode,
  type CSSProperties,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { Eye, EyeOff } from 'lucide-react'
import '../../assets/styles/components/form-input.css'

/* ----------------------------------------------------------
   Types
---------------------------------------------------------- */
export type InputSize = 'sm' | 'md' | 'lg'

type SharedProps = {
  /** Field label */
  label?: string
  /** Mark as required (shows * after label) */
  required?: boolean
  /** Left icon */
  icon?: ReactNode
  /** Right icon (not available on password — toggle takes priority) */
  iconRight?: ReactNode
  /** Error message — shows red border + message */
  error?: string
  /** Helper text (shown below input when no error) */
  helper?: string
  /** Size preset */
  size?: InputSize
  /** Monospace font */
  mono?: boolean
  /** Container className */
  className?: string
  /** Container style */
  style?: CSSProperties
}

// ── Input (text, password, number, email, search, tel, url) ──
type InputFieldProps = SharedProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'style' | 'className' | 'onChange' | 'value'>& {
    type?: 'text' | 'password' | 'number' | 'email' | 'search' | 'tel' | 'url'
    value: string | number
    onChange: (value: string) => void
  }

// ── Textarea ──
type TextareaFieldProps = SharedProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'style' | 'className' | 'onChange' | 'value'>& {
    type: 'textarea'
    value: string
    onChange: (value: string) => void
    /** Number of visible rows */
    rows?: number
  }

export type FormInputProps = InputFieldProps | TextareaFieldProps

/* ----------------------------------------------------------
   Component
---------------------------------------------------------- */
export default function FormInput(props: FormInputProps) {
  const {
    label,
    required = false,
    icon,
    iconRight,
    error,
    helper,
    size = 'md',
    mono = false,
    className = '',
    style,
    type = 'text',
    value,
    onChange,
    ...rest
  } = props

  // Password toggle
  const [showPwd, setShowPwd] = useState(false)
  const isPassword = type === 'password'
  const isTextarea = type === 'textarea'

  const togglePwd = useCallback(() => setShowPwd((s) => !s), [])

  // Build field class
  const fieldCls = [
    'plasm-input__field',
    isTextarea && 'plasm-input__field--textarea',
    size !== 'md' && `plasm-input__field--${size}`,
    mono && 'plasm-input__field--mono',
    icon && 'plasm-input__field--icon-left',
    (iconRight || isPassword) && 'plasm-input__field--icon-right',
  ].filter(Boolean).join(' ')

  const wrapperCls = [
    'plasm-input',
    error && 'plasm-input--error',
    className,
  ].filter(Boolean).join(' ')

  // Label class
  const labelCls = [
    'plasm-input__label',
    required && 'plasm-input__label--required',
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapperCls} style={style}>
      {label && <label className={labelCls}>{label}</label>}

      <div className="plasm-input__wrap">
        {/* Left icon */}
        {icon && <span className="plasm-input__icon plasm-input__icon--left">{icon}</span>}

        {/* Field */}
        {isTextarea ? (
          <textarea
            className={fieldCls}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            rows={(rest as TextareaFieldProps).rows ?? 3}
            {...(rest as Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'style' | 'className'>)}
          />
        ) : (
          <input
            className={fieldCls}
            type={isPassword ? (showPwd ? 'text' : 'password') : type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            {...(rest as Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'style' | 'className'>)}
          />
        )}

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            className="plasm-input__icon-btn"
            onClick={togglePwd}
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        {/* Right icon (non-password) */}
        {!isPassword && iconRight && (
          <span className="plasm-input__icon plasm-input__icon--right">{iconRight}</span>
        )}
      </div>

      {/* Error / Helper */}
      {error && <p className="plasm-input__error">{error}</p>}
      {!error && helper && <p className="plasm-input__helper">{helper}</p>}
    </div>
  )
}