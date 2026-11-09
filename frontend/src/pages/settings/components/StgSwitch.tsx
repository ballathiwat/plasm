// src/pages/settings/components/StgSwitch.tsx — สวิตช์เปิด/ปิด (role="switch") พร้อมข้อความ ไม่สื่อด้วยสีอย่างเดียว
import { ToggleLeft, ToggleRight } from 'lucide-react'
import { TGT } from './settingsStyles'

interface Props {
  on: boolean
  onChange: () => void
  label: string
  showText?: boolean
  size?: number
  disabled?: boolean
}

export default function StgSwitch({ on, onChange, label, showText = true, size = 22, disabled }: Props) {
  return (
    <button
      type="button" role="switch" aria-checked={on} aria-label={`เปิดใช้งาน ${label}`} disabled={disabled}
      title={on ? 'เปิดใช้งานอยู่ — คลิกเพื่อปิด' : 'ปิดอยู่ — คลิกเพื่อเปิด'}
      onClick={onChange}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        minWidth: TGT, minHeight: TGT, padding: '0 4px', background: 'none', border: 'none', borderRadius: 6,
        cursor: disabled ? 'not-allowed' : 'pointer', flexShrink: 0, font: 'inherit', fontSize: 12,
        color: on ? 'var(--success-ink)' : 'var(--text-secondary)', opacity: disabled ? 0.5 : 1,
      }}
    >
      {on ? <ToggleRight size={size} color="var(--success-ink)" /> : <ToggleLeft size={size} color="var(--text-disabled)" />}
      {showText && <span style={{ minWidth: 34, textAlign: 'left' }}>{on ? 'เปิด' : 'ปิด'}</span>}
    </button>
  )
}
