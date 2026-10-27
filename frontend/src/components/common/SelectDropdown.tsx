// frontend/src/components/common/SelectDropdown.tsx
//
// Reusable dropdown — wraps react-select + CSS classes
// CSS: src/assets/styles/common/select-dropdown.css

import { useState, useCallback, useRef } from 'react'
import Select from 'react-select'
import type {
  GroupBase,
  SingleValue,
  MultiValue,
  ActionMeta,
} from 'react-select'
import '../../assets/styles/components/select-dropdown.css'

/* ----------------------------------------------------------
   Types
---------------------------------------------------------- */
export interface OptionType {
  label: string
  value: string
  [key: string]: unknown
}

interface BaseProps {
  label?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  isClearable?: boolean
  isSearchable?: boolean
  isLoading?: boolean
  noOptionsMessage?: string
  className?: string
}

interface SingleSelectProps extends BaseProps {
  isMulti?: false
  value: OptionType | null
  onChange: (value: OptionType | null) => void
  options?: OptionType[]
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
    isMulti,
    value,
    onChange,
    options: staticOptions,
    loadOptions,
  } = props

  const [asyncOptions, setAsyncOptions] = useState<OptionType[]>([])
  const [asyncLoading, setAsyncLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isAsync = !!loadOptions
  const options = isAsync ? asyncOptions : (staticOptions ?? [])
  const isLoading = isLoadingProp || asyncLoading

  const handleInputChange = useCallback(
    (inputValue: string) => {
      if (!loadOptions) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (!inputValue.trim()) { setAsyncOptions([]); return }

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

  const wrapperClass = [
    'plasm-select-wrap',
    error ? 'has-error' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapperClass}>
      {label && <label className="plasm-select-label">{label}</label>}

      <Select<OptionType, boolean, GroupBase<OptionType>>
        classNamePrefix="plasm-select"
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
        onInputChange={isAsync ? handleInputChange : undefined}
        aria-label={label}
        aria-invalid={!!error}
      />

      {error && <p className="plasm-select-error">{error}</p>}
    </div>
  )
}