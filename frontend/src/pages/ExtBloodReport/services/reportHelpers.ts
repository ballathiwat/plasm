// frontend/src/pages/ExtBloodReport/services/reportHelpers.ts
//
// helper ของหน้ารายงาน: วันที่ (เวลาเครื่องผู้ใช้), ตัวเลข, สี

import type { Abo, Granularity, RangePreset } from './ReportType'

/* ----------------------------------------------------------
   วันที่
---------------------------------------------------------- */
export const MAX_RANGE_DAYS = 366
const DAY_MS = 24 * 60 * 60 * 1000

const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
]

export const toIso = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const isIsoDay = (s: string | null | undefined): s is string => {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const [y, m, d] = s.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
}

const parseIso = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** จำนวนวันในช่วง (นับรวมวันแรกและวันสุดท้าย) */
export const rangeDays = (from: string, to: string): number =>
  Math.round((parseIso(to).getTime() - parseIso(from).getTime()) / DAY_MS) + 1

/** ช่วงวันที่ของ preset — สิ้นสุดที่วันนี้เสมอ */
export const presetRange = (preset: Exclude<RangePreset, 'custom'>): { from: string; to: string } => {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const d = now.getDate()
  let from: Date
  if (preset === 'month') from = new Date(y, m, 1)
  else if (preset === '3m') from = new Date(y, m - 3, d + 1)
  else if (preset === '6m') from = new Date(y, m - 6, d + 1)
  else from = new Date(m >= 9 ? y : y - 1, 9, 1) // ปีงบประมาณ เริ่ม 1 ต.ค.
  return { from: toIso(from), to: toIso(now) }
}

/** ตรวจช่วงวันที่กำหนดเอง — คืนข้อความ error หรือ null ถ้าผ่าน */
export const validateRange = (from: string, to: string): string | null => {
  if (!isIsoDay(from) || !isIsoDay(to)) return 'กรุณาเลือกวันที่เริ่มต้นและวันที่สิ้นสุด'
  if (from > to) return 'วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด'
  if (rangeDays(from, to) > MAX_RANGE_DAYS) return `ช่วงวันที่ต้องไม่เกิน ${MAX_RANGE_DAYS} วัน`
  return null
}

/** 15 พ.ย. 2569 */
export const formatThaiDay = (iso: string): string => {
  if (!isIsoDay(iso)) return '-'
  const d = parseIso(iso)
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`
}

export const formatThaiRange = (from: string, to: string): string =>
  from === to ? formatThaiDay(from) : `${formatThaiDay(from)} – ${formatThaiDay(to)}`

/** ป้ายแกน X ของกราฟ: สัปดาห์ → "3 พ.ย." · เดือน → "พ.ย. 69" */
export const bucketLabel = (iso: string, g: Granularity): string => {
  if (!isIsoDay(iso)) return iso
  const d = parseIso(iso)
  return g === 'week'
    ? `${d.getDate()} ${THAI_MONTHS[d.getMonth()]}`
    : `${THAI_MONTHS[d.getMonth()]} ${String(d.getFullYear() + 543).slice(-2)}`
}

/** ป้ายเต็มใน tooltip: สัปดาห์ → "สัปดาห์ที่เริ่ม 3 พ.ย. 2569" · เดือน → "พ.ย. 2569" */
export const bucketTitle = (iso: string, g: Granularity): string => {
  if (!isIsoDay(iso)) return iso
  const d = parseIso(iso)
  return g === 'week'
    ? `สัปดาห์ที่เริ่ม ${formatThaiDay(iso)}`
    : `${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`
}

/* ----------------------------------------------------------
   ตัวเลข
---------------------------------------------------------- */
export const fmtInt = (n: number): string => n.toLocaleString('th-TH')

/** มิลลิลิตร → ลิตร ทศนิยม 1 ตำแหน่ง */
export const fmtLiters = (ml: number): string =>
  (ml / 1000).toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export const pct = (part: number, total: number): number => (total > 0 ? (part / total) * 100 : 0)

export const fmtPct = (part: number, total: number): string =>
  `${pct(part, total).toLocaleString('th-TH', { maximumFractionDigits: 1 })}%`

/** ค่าสูงสุดของแกน Y แบบเลขกลม (≥ 4 เพื่อให้แบ่ง 4 ช่องเป็นจำนวนเต็ม) */
export const niceMax = (v: number): number => {
  if (v <= 4) return 4
  const pow = 10 ** Math.floor(Math.log10(v))
  const step = [1, 2, 4, 5, 8, 10].find((s) => s * pow >= v) ?? 10
  return step * pow
}

/* ----------------------------------------------------------
   สี
---------------------------------------------------------- */
export const ABO_ORDER: Abo[] = ['A', 'B', 'O', 'AB']

/** สีหมู่เลือดจาก token --group-a/b/o/ab (ไม่รู้จัก → --group-other) */
export const aboColor = (abo: string): string =>
  (ABO_ORDER as string[]).includes(abo) ? `var(--group-${abo.toLowerCase()})` : 'var(--group-other)'

// สีชนิดเลือด: ใช้สีจาก master ก่อน → ค่ากำหนดของรายงาน → วนสีสำรอง
const PRODUCT_COLORS: Record<string, string> = { FFP: '#2563EB', LPRC: '#E11D48', PC: '#D97706' }
const PRODUCT_FALLBACK = ['#0D9488', '#7C3AED', '#4D7C0F', '#BE185D', '#475569', '#B45309']

export const buildProductColors = (
  items: { code: string; color?: string | null }[],
): Record<string, string> => {
  const map: Record<string, string> = {}
  let spare = 0
  for (const it of items) {
    if (map[it.code]) continue
    map[it.code] =
      it.color || PRODUCT_COLORS[it.code] || PRODUCT_FALLBACK[spare++ % PRODUCT_FALLBACK.length]
  }
  return map
}
