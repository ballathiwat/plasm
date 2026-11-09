// frontend/src/components/common/PlasmaTypeSelect.tsx
//
// Dropdown ชนิดเลือด — ดึงข้อมูลจาก API อัตโนมัติ (ผ่าน usePlasmaTypes)
//
// Usage:
//   <PlasmaTypeSelect value={type} onChange={setType} />
//   <PlasmaTypeSelect value={type} onChange={setType} allLabel="ทุกชนิด" />
//   <PlasmaTypeSelect value={type} onChange={setType} showAll={false} />

import { useMemo } from 'react'
import SelectDropdown, { type OptionType } from './SelectDropdown'
import usePlasmaTypes from '../../helpers/usePlasmaTypes'

export interface PlasmaTypeSelectProps {
  /** Selected value (plasma code e.g. "FFP", "Cryo", "" for all) */
  value: string
  /** Callback — returns plasma code or "" */
  onChange: (value: string) => void
  /** Label above dropdown */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Show "ทุกชนิด" option at top (default: true) */
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

const toOption = (value: string, label: string): OptionType => ({ value, label })
const findOption = (opts: OptionType[], v: string): OptionType | null =>
  opts.find((o) => o.value === v) ?? null

export default function PlasmaTypeSelect({
  value,
  onChange,
  label = 'ชนิดเลือด',
  placeholder = 'เลือกชนิด...',
  showAll = true,
  allLabel = 'ทุกชนิด',
  isClearable = false,
  isSearchable = false,
  disabled = false,
  error,
  className,
}: PlasmaTypeSelectProps) {
  const plasmaTypes = usePlasmaTypes()

  const options = useMemo<OptionType[]>(() => {
    const opts: OptionType[] = []
    if (showAll) opts.push(toOption('', allLabel))
    opts.push(...plasmaTypes.map((code) => toOption(code, code)))
    return opts
  }, [plasmaTypes, showAll, allLabel])

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