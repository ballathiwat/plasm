// frontend/src/pages/ExtBlood/services/extHelpers.ts

import { EXT_ATTACHMENTS } from '../../../helpers/url_helper'
import type { ExtAttachment, ExtDocStatus, ExtDocument } from './ExtBloodType'

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

// ── สถานะที่ยังแก้ไขข้อมูลเอกสารได้ (ตรงกับ backend: isExtEditable) ──
export const isEditableStatus = (s: ExtDocStatus) => s === 'DRAFT' || s === 'REJECTED'

// ── รูปที่เพิ่มหลังอนุมัติ ──
export const POST_IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp'
export const POST_IMAGE_MAX_SIZE = 10 * 1024 * 1024 // 10 MB — ค่าเดียวกับ backend (extUpload)
export const POST_IMAGE_MAX_FILES = 10
const POST_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp']
const POST_IMAGE_EXT = /\.(jpe?g|png|webp)$/i

/** สิทธิ์เพิ่มรูปหลังอนุมัติ: ผู้สร้างเอกสาร, คณะกรรมการ, ADMIN — backend ตรวจซ้ำอีกชั้น */
export const canAddPostApprovalImage = (doc: ExtDocument, userId: string, isAdmin: boolean) =>
  doc.status === 'APPROVED' && (
    isAdmin ||
    [doc.createdById, doc.createdBy?.id, doc.verifier?.id, doc.storer?.id, doc.approver?.id].includes(userId) ||
    (doc.committee ?? []).some((m) => m.userId === userId)
  )

/** ตรวจไฟล์ก่อนส่ง — คืนข้อความ error หรือ null ถ้าผ่าน */
export function validatePostImages(files: File[]): string | null {
  if (files.length === 0) return 'กรุณาเลือกรูปอย่างน้อย 1 รูป'
  if (files.length > POST_IMAGE_MAX_FILES) return `อัปโหลดได้สูงสุด ${POST_IMAGE_MAX_FILES} รูปต่อครั้ง`
  const badType = files.find((f) => !POST_IMAGE_MIMES.includes(f.type) || !POST_IMAGE_EXT.test(f.name))
  if (badType) return `รับเฉพาะไฟล์รูป jpg, jpeg, png, webp — "${badType.name}" ไม่ใช่ไฟล์ที่รองรับ`
  const tooBig = files.find((f) => f.size > POST_IMAGE_MAX_SIZE)
  if (tooBig) return `ไฟล์ "${tooBig.name}" ใหญ่เกิน 10 MB`
  return null
}

/** ลบเอกสารร่างได้เฉพาะผู้สร้างเอกสารหรือ ADMIN — backend ตรวจซ้ำอีกชั้น */
export const canDeleteDraft = (doc: ExtDocument, userId: string, isAdmin: boolean) =>
  doc.status === 'DRAFT' && (isAdmin || doc.createdById === userId || doc.createdBy?.id === userId)

/** ADMIN ลบไฟล์แนบของเอกสารที่อนุมัติแล้วได้ (จัดการรูปที่อัปโหลดผิด) — backend ตรวจซ้ำอีกชั้น */
export const canAdminDeleteAttachment = (doc: ExtDocument, isAdmin: boolean) => isAdmin && doc.status === 'APPROVED'
