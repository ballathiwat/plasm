// ============================================================
//  src/pages/dashboard/services/DashboardType.ts
// ============================================================

import type { LogEntryItem } from '../../log/services/LogType'
export type { LogEntryItem }

export interface DailyData {
  date: string
  label: string
  store: Record<string, number>
  withdraw: Record<string, number>
}

// สถานะเทียบขั้นต่ำย้ายไป helpers/minStock.ts (ราย ชนิด × หมู่ — ใช้ร่วมกับตั้งค่าและกระดิ่ง)

export const sumBlood = (r: Record<string, number>) =>
  Object.values(r).reduce((s, v) => s + (v || 0), 0)