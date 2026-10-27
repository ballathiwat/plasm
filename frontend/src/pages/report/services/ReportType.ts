// ============================================================
//  src/pages/report/services/ReportType.ts
// ============================================================

export { groupColor, groupSurface, groupInk } from '../../../helpers/blood'

export interface ReportData {
  types: string[]
  bloods: string[]
  data: Record<string, Record<string, { stored: number; withdrawn: number }>>
  stock: Record<string, Record<string, number>>
}

export interface ReportFilters {
  from: string       // YYYY-MM-DD
  to: string         // YYYY-MM-DD
  type: string       // ชนิดพลาสมาที่เลือก
}