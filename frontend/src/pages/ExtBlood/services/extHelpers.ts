// frontend/src/pages/ExtBlood/services/extHelpers.ts

import { EXT_ATTACHMENTS } from '../../../helpers/url_helper'
import type { ExtAttachment, ExtDocStatus } from './ExtBloodType'

const API_URL = import.meta.env.VITE_API_URL || ''

// URL เปิดไฟล์แนบจริง — filePath ใน DB เปิดตรงไม่ได้ ต้องผ่าน endpoint ที่ตรวจสิทธิ์ (cookie)
export const attachmentUrl = (a: Pick<ExtAttachment, 'id'>) => `${API_URL}${EXT_ATTACHMENTS}/${a.id}/file`

// ชื่อไฟล์ภาษาไทยที่ multer อ่านเป็น latin1 → แปลงกลับเป็น UTF-8
export const fixFileName = (n: string) => { try { return /[\u00c0-\u00ff][\u0080-\u00bf]/.test(n) ? decodeURIComponent(escape(n)) : n } catch { return n } }

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
