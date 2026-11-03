// frontend/src/components/common/BloodGroupSelect.tsx
//
// Dropdown หมู่เลือด — ดึงข้อมูลจาก API อัตโนมัติ (ผ่าน useBloodTypes)
//
// Usage:
//   <BloodGroupSelect value={blood} onChange={setBlood} />
//   <BloodGroupSelect value={blood} onChange={setBlood} allLabel="ทุกหมู่เลือด" />
//   <BloodGroupSelect value={blood} onChange={setBlood} showAll={false} />

import { useMemo } from 'react'
import SelectDropdown, { type OptionType } from './SelectDropdown'
import useBloodTypes from '../../helpers/useBloodTypes'

/* ----------------------------------------------------------
   Types
---------------------------------------------------------- */
export interface BloodGroupSelectProps {
  /** Selected value (blood code e.g. "A+", "B", "" for all) */
  value: string
  /** Callback — returns blood code or "" */
  onChange: (value: string) => void
  /** Label above dropdown */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Show "ทุกหมู่เลือด" option at top (default: true) */
  showAll?: boolean
  /** Label for the "all" option */
  allLabel?: string
  /** Allow clearing selection */
  isClearable?: boolean
  /** Allow searching/filtering */
  isSearchable?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Error message */
  error?: string
  /** Container className */
  className?: string
}

/* ----------------------------------------------------------
   Helpers
---------------------------------------------------------- */
const toOption = (value: string, label: string): OptionType => ({ value, label })
const findOption = (opts: OptionType[], v: string): OptionType | null =>
  opts.find((o) => o.value === v) ?? null

/* ----------------------------------------------------------
   Component
---------------------------------------------------------- */
export default function BloodGroupSelect({
  value,
  onChange,
  label = 'หมู่เลือด',
  placeholder = 'เลือกหมู่เลือด...',
  showAll = true,
  allLabel = 'ทุกหมู่เลือด',
  isClearable = false,
  isSearchable = false,
  disabled = false,
  error,
  className,
}: BloodGroupSelectProps) {
  const bloodTypes = useBloodTypes()

  const options = useMemo<OptionType[]>(() => {
    const opts: OptionType[] = []
    if (showAll) opts.push(toOption('', allLabel))
    opts.push(...bloodTypes.map((code) => toOption(code, code)))
    return opts
  }, [bloodTypes, showAll, allLabel])

  const handleChange = (opt: OptionType | null) => {
    onChange(opt?.value ?? '')
  }

  return (
    <SelectDropdown
      label={label}
      placeholder={placeholder}
      options={options}
      value={findOption(options, value)}
      onChange={handleChange}
      isClearable={isClearable}
      isSearchable={isSearchable}
      disabled={disabled}
      error={error}
      className={className}
    />
  )
}