// frontend/src/pages/ExtBlood/services/extHelpers.ts

import type { ExtDocStatus } from './ExtBloodType'

const THAI_MONTHS = [
  'ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.',
  'ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.',
]

export function formatThaiDate(iso?: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '-'
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`
}

export function formatThaiDateTime(iso?: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '-'
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${formatThaiDate(iso)} ${h}:${m}`
}

const STATUS_LABELS: Record<ExtDocStatus, string> = {
  DRAFT: 'ร่าง', PENDING: 'รออนุมัติ', APPROVED: 'อนุมัติแล้ว',
  REJECTED: 'ไม่อนุมัติ', EXPORTED: 'นำออกแล้ว', CANCELLED: 'ยกเลิก',
}
const STATUS_CLASS: Record<ExtDocStatus, string> = {
  DRAFT: 'st-draft', PENDING: 'st-pending', APPROVED: 'st-approved',
  REJECTED: 'st-rejected', EXPORTED: 'st-exported', CANCELLED: 'st-cancelled',
}

export const statusLabel = (s: ExtDocStatus) => STATUS_LABELS[s] || s
export const statusClass = (s: ExtDocStatus) => STATUS_CLASS[s] || ''

export function bloodGroupClass(group: string): string {
  const base = group.replace(/[+-]/g, '').toUpperCase()
  if (base === 'A') return 'bb-A'
  if (base === 'B') return 'bb-B'
  if (base === 'O') return 'bb-O'
  if (base === 'AB') return 'bb-AB'
  return ''
}
