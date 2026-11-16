// frontend/src/components/common/MinStatusPill.tsx
//
// ป้ายสถานะสต็อกเทียบขั้นต่ำ — ไอคอน + ข้อความ เสมอ (ไม่สื่อด้วยสีอย่างเดียว)
// ใช้ร่วมกัน: ตั้งค่า › สต็อกขั้นต่ำ, แดชบอร์ด, กระดิ่งแจ้งเตือน
// CSS: src/assets/styles/components/min-stock.css
//
// Usage:
//   <MinStatusPill status="danger" />
//   <MinStatusPill status="warning" size="sm" label="100–120%" />

import { MIN_STATUS, type MinStatus } from '../../helpers/minStock'
import '../../assets/styles/components/min-stock.css'

export interface MinStatusPillProps {
  status: MinStatus
  size?: 'sm' | 'md'
  /** ข้อความแทน label มาตรฐาน (เช่น legend) */
  label?: string
  className?: string
}

export default function MinStatusPill({ status, size = 'md', label, className }: MinStatusPillProps) {
  const { icon: Icon, label: text } = MIN_STATUS[status]
  return (
    <span className={`plasm-ms-pill plasm-ms-pill--${size} ms-status--${status}${className ? ` ${className}` : ''}`}>
      <Icon size={size === 'sm' ? 12 : 14} aria-hidden="true" />
      <span>{label ?? text}</span>
    </span>
  )
}
