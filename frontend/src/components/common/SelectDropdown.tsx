// frontend/src/components/common/SelectDropdown.tsx
//
// Reusable dropdown — wraps react-select
// Supports: single, multi, async (load from API), creatable
//
// Install: npm install react-select
//
// Usage:
//   <SelectDropdown options={opts} value={val} onChange={setVal} />
//   <SelectDropdown isMulti options={opts} value={vals} onChange={setVals} />
//   <SelectDropdown loadOptions={fetchFromApi} value={val} onChange={setVal} />

import { useState, useCallback, useRef, type CSSProperties } from 'react'
import Select from 'react-select'
import type {
  GroupBase,
  StylesConfig,
  SingleValue,
  MultiValue,
  ActionMeta,
} from 'react-select'

/* ----------------------------------------------------------
   Types
---------------------------------------------------------- */
export interface OptionType {
  label: string
  value: string
  [key: string]: unknown // allow extra fields
}

interface BaseProps {
  /** Field label (optional) */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Disabled state */
  disabled?: boolean
  /** Error message — shows red border + message */
  error?: string
  /** Allow creating new options */
  creatable?: boolean
  /** Allow clearing selection */
  isClearable?: boolean
  /** Search/filter enabled */
  isSearchable?: boolean
  /** Loading indicator */
  isLoading?: boolean
  /** No options message */
  noOptionsMessage?: string
  /** Container className */
  className?: string
  /** Container style */
  style?: CSSProperties
}

interface SingleSelectProps extends BaseProps {
  isMulti?: false
  value: OptionType | null
  onChange: (value: OptionType | null) => void
  /** Static options (not needed if using loadOptions) */
  options?: OptionType[]
  /** Async: function to load options from API */
  loadOptions?: (inputValue: string) => Promise<OptionType[]>
}

interface MultiSelectProps extends BaseProps {
  isMulti: true
  value: OptionType[]
  onChange: (value: OptionType[]) => void
  options?: OptionType[]
  loadOptions?: (inputValue: string) => Promise<OptionType[]>
}

export type SelectDropdownProps = SingleSelectProps | MultiSelectProps

/* ----------------------------------------------------------
   Design tokens (Plasm Design System)
---------------------------------------------------------- */
const TOKENS = {
  primary: '#2563eb',
  primaryLight: '#dbeafe',
  primaryDark: '#1d4ed8',
  border: '#DDE3EA',
  borderFocus: '#2563eb',
  borderError: '#ef4444',
  bg: '#ffffff',
  bgHover: '#f8fafc',
  bgSelected: '#eff6ff',
  text: '#1a2332',
  textMuted: '#5A6A7E',
  textPlaceholder: '#94a3b8',
  radius: '8px',
  shadow: '0 4px 12px rgba(26,35,50,0.12)',
  font: "var(--font-family, 'IBM Plex Sans Thai', system-ui, sans-serif)",} as const

/* ----------------------------------------------------------
   Custom styles for react-select
---------------------------------------------------------- */
const buildStyles = (hasError: boolean): StylesConfig<OptionType, boolean, GroupBase<OptionType>> => ({
  control: (base, state) => ({
    ...base,
    fontFamily: TOKENS.font,
    fontSize: 14,
    minHeight: 40,
    borderRadius: TOKENS.radius,
    border: `1px solid ${hasError ? TOKENS.borderError : state.isFocused ? TOKENS.borderFocus : TOKENS.border}`,
    boxShadow: state.isFocused ? `0 0 0 3px ${hasError ? 'rgba(239,68,68,0.15)' : 'rgba(37,99,235,0.15)'}` : 'none',
    background: state.isDisabled ? '#f1f5f9' : TOKENS.bg,
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    '&:hover': {
      borderColor: hasError ? TOKENS.borderError : TOKENS.borderFocus,
    },
  }),
  menu: (base) => ({
    ...base,
    fontFamily: TOKENS.font,
    borderRadius: TOKENS.radius,
    border: `1px solid ${TOKENS.border}`,
    boxShadow: TOKENS.shadow,
    overflow: 'hidden',
    zIndex: 50,
  }),
  menuList: (base) => ({
    ...base,
    padding: 4,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: 14,
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    color: TOKENS.text,
    background: state.isSelected
      ? TOKENS.bgSelected
      : state.isFocused
        ? TOKENS.bgHover
        : 'transparent',
    fontWeight: state.isSelected ? 500 : 400,
    '&:active': {
      background: TOKENS.primaryLight,
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: TOKENS.textPlaceholder,
    fontSize: 14,
  }),
  singleValue: (base) => ({
    ...base,
    color: TOKENS.text,
    fontSize: 14,
  }),
  multiValue: (base) => ({
    ...base,
    background: TOKENS.primaryLight,
    borderRadius: '6px',
    border: `1px solid ${TOKENS.primary}20`,
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: TOKENS.primaryDark,
    fontSize: 13,
    fontWeight: 500,
    padding: '2px 6px',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: TOKENS.primary,
    borderRadius: '0 6px 6px 0',
    '&:hover': {
      background: TOKENS.primary,
      color: '#fff',
    },
  }),
  input: (base) => ({
    ...base,
    color: TOKENS.text,
    fontSize: 14,
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: TOKENS.textMuted,
    padding: '0 8px',
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : undefined,
    transition: 'transform 0.2s',
    '&:hover': {
      color: TOKENS.primary,
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: TOKENS.textMuted,
    padding: '0 4px',
    '&:hover': {
      color: TOKENS.borderError,
    },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    fontSize: 13,
    color: TOKENS.textMuted,
  }),
  loadingMessage: (base) => ({
    ...base,
    fontSize: 13,
    color: TOKENS.textMuted,
  }),
})

/* ----------------------------------------------------------
   Component
---------------------------------------------------------- */
export default function SelectDropdown(props: SelectDropdownProps) {
  const {
    label,
    placeholder = 'เลือก...',
    disabled = false,
    error,
    isClearable = true,
    isSearchable = true,
    isLoading: isLoadingProp = false,
    noOptionsMessage = 'ไม่พบข้อมูล',
    className = '',
    style,
    isMulti,
    value,
    onChange,
    options: staticOptions,
    loadOptions,
  } = props

  // Async state
  const [asyncOptions, setAsyncOptions] = useState<OptionType[]>([])
  const [asyncLoading, setAsyncLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isAsync = !!loadOptions
  const options = isAsync ? asyncOptions : (staticOptions ?? [])
  const isLoading = isLoadingProp || asyncLoading

  // Debounced search for async mode
  const handleInputChange = useCallback(
    (inputValue: string) => {
      if (!loadOptions) return

      if (debounceRef.current) clearTimeout(debounceRef.current)

      if (!inputValue.trim()) {
        setAsyncOptions([])
        return
      }

      debounceRef.current = setTimeout(async () => {
        setAsyncLoading(true)
        try {
          const results = await loadOptions(inputValue)
          setAsyncOptions(results)
        } catch (err) {
          console.error('SelectDropdown loadOptions error:', err)
          setAsyncOptions([])
        } finally {
          setAsyncLoading(false)
        }
      }, 300)
    },
    [loadOptions],
  )

  // Handle change — normalize types for single vs multi
  const handleChange = useCallback(
    (newValue: SingleValue<OptionType> | MultiValue<OptionType>, _action: ActionMeta<OptionType>) => {
      if (isMulti) {
        ;(onChange as MultiSelectProps['onChange'])(
          (newValue as MultiValue<OptionType>).map((v) => ({ ...v })),
        )
      } else {
        ;(onChange as SingleSelectProps['onChange'])(
          newValue ? { ...(newValue as OptionType) } : null,
        )
      }
    },
    [isMulti, onChange],
  )

  const customStyles = buildStyles(!!error)

  return (
    <div className={className} style={style}>
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

      <Select<OptionType, boolean, GroupBase<OptionType>>
        value={value}
        onChange={handleChange}
        options={options}
        isMulti={isMulti ?? false}
        isDisabled={disabled}
        isClearable={isClearable}
        isSearchable={isSearchable}
        isLoading={isLoading}
        placeholder={placeholder}
        noOptionsMessage={() => (isAsync ? 'พิมพ์เพื่อค้นหา...' : noOptionsMessage)}
        loadingMessage={() => 'กำลังค้นหา...'}
        styles={customStyles}
        onInputChange={isAsync ? handleInputChange : undefined}
        // Accessibility
        aria-label={label}
        aria-invalid={!!error}
      />

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