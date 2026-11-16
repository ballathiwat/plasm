// frontend/src/helpers/minStock.ts
// สต็อกขั้นต่ำ ราย ชนิดเลือด × หมู่เลือด — กติกากลางที่ ตั้งค่า / แดชบอร์ด / กระดิ่ง ใช้ร่วมกัน
// backend มีไฟล์คู่กันที่ backend/src/lib/minStock.ts — แก้เกณฑ์ต้องแก้ทั้งสองไฟล์
// สีของแต่ละสถานะอยู่ใน CSS เท่านั้น: assets/styles/components/min-stock.css (.ms-status--*)

import { OctagonAlert, TriangleAlert, CircleCheck, CircleDashed, type LucideIcon } from 'lucide-react'

export type MinStatus = 'danger' | 'warning' | 'normal' | 'none'

/** น้อยกว่าขั้นต่ำ = danger · 100–120% = warning · มากกว่า 120% = normal · ไม่ได้ตั้งค่า = none */
export const minStatus = (stock: number, min: number | null): MinStatus =>
  min == null ? 'none' : stock < min ? 'danger' : stock <= min * 1.2 ? 'warning' : 'normal'

export const MIN_STATUS: Record<MinStatus, { label: string; icon: LucideIcon; rank: number }> = {
  danger:  { label: 'ต่ำกว่าขั้นต่ำ', icon: OctagonAlert,  rank: 0 },
  warning: { label: 'ใกล้ต่ำ',       icon: TriangleAlert, rank: 1 },
  normal:  { label: 'ปกติ',          icon: CircleCheck,   rank: 2 },
  none:    { label: 'ไม่ได้ตั้งค่า',  icon: CircleDashed,  rank: 3 },
}

/** 1 คู่ ชนิด × หมู่ จาก GET /stock/min-stock/status */
export interface MinStockStatusItem {
  type: string
  group: string
  stock: number
  minUnits: number | null
  status: MinStatus
  /** stock / minUnits (1 = 100%) — null เมื่อไม่ได้ตั้งค่าหรือขั้นต่ำเป็น 0 */
  pct: number | null
  /** จำนวนที่ขาดจากขั้นต่ำ (0 เมื่อไม่ขาด) */
  gap: number
  expiringSoon: { unitNumber: string; expiresAt: string }[]
  /** เวลาที่เข้าสู่สถานะปัจจุบัน — มีค่าเฉพาะ danger / warning */
  since: string | null
  notificationId: string | null
  acknowledged: boolean
  acknowledgedBy: string | null
  acknowledgedAt: string | null
}

export interface MinStockType { code: string; name: string | null }

export interface MinStockStatus {
  types: MinStockType[]
  groups: string[]
  items: MinStockStatusItem[]
  /** unit คงเหลือทั้งระบบ */
  totalStock: number
  /** มีค่าขั้นต่ำอย่างน้อย 1 คู่ */
  configured: boolean
}

/** วิกฤตที่สุดก่อน: danger → warning → normal → none แล้วเรียง % ของขั้นต่ำน้อยสุด */
export const sortByCritical = (
  a: Pick<MinStockStatusItem, 'status' | 'pct'>,
  b: Pick<MinStockStatusItem, 'status' | 'pct'>,
) => MIN_STATUS[a.status].rank - MIN_STATUS[b.status].rank || (a.pct ?? 9) - (b.pct ?? 9)

/** % ของขั้นต่ำสำหรับแสดงผล — ปัดให้ไม่ขัดกับสถานะ (299/300 ไม่แสดงเป็น 100%, 361/300 ไม่แสดงเป็น 120%) */
export const pctLabel = (pct: number | null): string => {
  if (pct == null) return '—'
  const r = Math.round(pct * 100)
  return `${pct < 1 ? Math.min(r, 99) : pct > 1.2 ? Math.max(r, 121) : r}%`
}

/** สเกลแถบ 0–150% — เส้นขั้นต่ำอยู่ที่ 100% */
export const barWidth = (pct: number | null) => `${(Math.min(Math.max(pct ?? 0, 0), 1.5) / 1.5) * 100}%`

/** หมู่ ABO ของรหัสหมู่เลือด: "A+" / "A-" / "A−" → "A" · "A" (ไม่ระบุ Rh) → "A" */
export const aboOf = (group: string) => group.replace(/[-+−]$/, '') || group
/** ลำดับในกลุ่ม ABO: ไม่ระบุ Rh → + → − */
export const rhRank = (group: string) => (group.endsWith('+') ? 1 : /[-−]$/.test(group) ? 2 : 0)
/** ตัวกรองหมู่เลือด: เลือก "A" (ไม่ระบุ Rh) = รวม A / A+ / A− · เลือก "A−" = เฉพาะหมู่นั้น */
export const matchesGroup = (group: string, filter: string) =>
  !filter || group === filter || (aboOf(filter) === filter && aboOf(group) === filter)

/** key ของช่อง — ใช้ใน query ?cell=FFP|A ทั้งหน้าแดชบอร์ดและตั้งค่า */
export const cellKey = (type: string, group: string) => `${type}|${group}`
export const parseCell = (v: string | null): { type: string; group: string } | null => {
  if (!v) return null
  const i = v.lastIndexOf('|')
  return i > 0 && i < v.length - 1 ? { type: v.slice(0, i), group: v.slice(i + 1) } : null
}

export const SETTINGS_MIN_STOCK_PATH = '/settings/system?tab=stock'
export const settingsCellPath = (type: string, group: string) =>
  `${SETTINGS_MIN_STOCK_PATH}&cell=${encodeURIComponent(cellKey(type, group))}`
export const dashboardCellPath = (type: string, group: string) =>
  `/?cell=${encodeURIComponent(cellKey(type, group))}`

/** ข้อความแจ้งเตือนของ 1 คู่ (ตรงกับ alertDetail ใน backend/src/lib/minStock.ts) */
export const alertDetail = (i: MinStockStatusItem): string =>
  i.status === 'danger'
    ? `${i.type} หมู่ ${i.group} คงเหลือ ${i.stock} unit ต่ำกว่าขั้นต่ำ ${i.minUnits} unit (ขาด ${i.gap} unit)`
    : `${i.type} หมู่ ${i.group} คงเหลือ ${i.stock} unit ใกล้ขั้นต่ำ ${i.minUnits} unit (${i.pct == null ? '100%' : pctLabel(i.pct)} ของขั้นต่ำ)`

/**
 * รายการแจ้งเตือนสต็อกสำหรับกระดิ่ง จัดกลุ่มตามชนิดเลือด
 * ลำดับ: ชนิดที่มี danger ก่อน → ในกลุ่ม danger ก่อน แล้วเรียง % ของขั้นต่ำน้อยสุด
 */
export const groupStockAlerts = (items: MinStockStatusItem[]): { type: string; items: MinStockStatusItem[] }[] => {
  const alerts = items
    .filter((i) => i.status === 'danger' || i.status === 'warning')
    .sort(sortByCritical)
  const out: { type: string; items: MinStockStatusItem[] }[] = []
  for (const a of alerts) {
    const g = out.find((x) => x.type === a.type)
    if (g) g.items.push(a)
    else out.push({ type: a.type, items: [a] })
  }
  return out
}
