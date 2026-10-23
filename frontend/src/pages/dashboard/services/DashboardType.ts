// ============================================================
//  src/pages/dashboard/services/DashboardType.ts
// ============================================================

export { groupColor, groupSurface, groupInk } from '../../../helpers/blood'

export interface StockSummary {
  groups: string[]                       // หมู่เลือดที่แสดง (เรียงตาม master)
  stocks: Record<string, number>
  minimum: Record<string, number>        // เฉพาะหมู่ที่ตั้งขั้นต่ำ
  change: Record<string, number>
}

export interface DailyData {
  date: string
  label: string
  store: Record<string, number>
  withdraw: Record<string, number>
}

export interface LogEntryItem {
  id: string
  action: 'store' | 'withdraw'
  boxLabel: string
  type: string
  blood: string
  units: string[]
  timestamp: string
  detail: string
  unitCount?: number
}

export type StockLevel = 'danger' | 'warning' | 'normal' | 'none'

/** ไม่มีขั้นต่ำ (undefined/0) → 'none' ไม่แจ้งเตือน */
export const levelOf = (current: number, min?: number): StockLevel =>
  !min ? 'none' : current < min ? 'danger' : current < min * 1.2 ? 'warning' : 'normal'

export const levelColor = (lv: StockLevel) =>
  lv === 'danger' ? '#EF4444' : lv === 'warning' ? '#F59E0B' : lv === 'normal' ? '#10B981' : '#A1A1AA'

export const levelText = (lv: StockLevel) =>
  lv === 'danger' ? 'ต่ำกว่าขั้นต่ำ'
  : lv === 'warning' ? 'ใกล้ขั้นต่ำ'
  : lv === 'normal' ? 'ปกติ'
  : 'ไม่กำหนดขั้นต่ำ'

export const sumBlood = (r: Record<string, number>) =>
  Object.values(r).reduce((s, v) => s + (v || 0), 0)