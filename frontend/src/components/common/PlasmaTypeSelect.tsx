// frontend/src/components/common/PlasmaTypeSelect.tsx
//
// Dropdown ชนิดเลือด — รายการตัวเลือกมาจากฐานข้อมูล master plasma-types.
// ถ้า parent ส่ง products มา จะส่ง product ID ที่มี code ตรงกันกลับไปด้วย
//
// Usage:
//   <PlasmaTypeSelect value={type} onChange={setType} />
//   <PlasmaTypeSelect value={type} onChange={setType} products={products} />

import { useMemo } from 'react'
import SelectDropdown, { type OptionType } from './SelectDropdown'
import usePlasmaTypes from '../../helpers/usePlasmaTypes'

export interface PlasmaTypeProduct {
  id: string
  code: string
  name?: string
}

export interface PlasmaTypeSelectProps {
  /** Selected value (plasma code e.g. "FFP", "Cryo", "" for all) */
  value: string
  /** Callback — returns plasma code and, when available, the matching product ID */
  onChange: (value: string, productId?: string) => void
  /** Optional list used only to resolve an ID; dropdown choices always come from master plasma-types. */
  products?: PlasmaTypeProduct[]
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
  products,
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
    const code = opt?.value ?? ''
    const productId = products?.find((product) => product.code === code)?.id
    onChange(code, productId)
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
