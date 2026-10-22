// ============================================================
//  src/pages/dashboard/services/DashboardType.ts
// ============================================================

import type { BloodGroup } from '../../../types/models'
export { groupColor, groupSurface, groupInk } from '../../../helpers/blood'

export interface StockSummary {
  stocks: Record<BloodGroup, number>
  minimum: Record<BloodGroup, number>
  change: Record<BloodGroup, number>
}

export interface DailyData {
  date: string
  label: string
  store: Record<BloodGroup, number>
  withdraw: Record<BloodGroup, number>
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
}

export type StockLevel = 'danger' | 'warning' | 'normal'

export const BLOOD_GROUPS: BloodGroup[] = ['A', 'B', 'O', 'AB']



export const levelOf = (current: number, min: number): StockLevel =>
  current < min ? 'danger' : current < min * 1.2 ? 'warning' : 'normal'

export const levelColor = (lv: StockLevel) =>
  lv === 'danger' ? '#EF4444' : lv === 'warning' ? '#F59E0B' : '#10B981'

export const levelText = (lv: StockLevel) =>
  lv === 'danger' ? 'ต่ำกว่าขั้นต่ำ' : lv === 'warning' ? 'ใกล้ขั้นต่ำ' : 'ปกติ'

export const sumBlood = (r: Record<BloodGroup, number>) =>
  BLOOD_GROUPS.reduce((s, g) => s + (r[g] || 0), 0)