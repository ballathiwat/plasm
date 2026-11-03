// frontend/src/pages/report-daily/services/DailyReportType.ts

export { groupColor, groupSurface, groupInk, bloodChartColor, plasmaChartColor } from '../../../helpers/blood'

// ── API response ──
export interface MovementBucket {
  start: string
  end: string
  store: Record<string, number>     // group → qty (flat, all types summed)
  withdraw: Record<string, number>
}

export interface SummaryItem {
  type: string
  blood: string   // "A+", "A-"
  group: string   // "A"
  qty: number
}

export interface MovementResponse {
  from: string
  to: string
  days: number
  granularity: 'day' | 'week' | 'month'
  types: string[]
  groups: string[]
  buckets: MovementBucket[]
  summary: { store: SummaryItem[]; withdraw: SummaryItem[] }
  totals: { store: Record<string, number>; withdraw: Record<string, number> }
}

// ── Filter state ──
export type PresetKey = 'today' | '7d' | '30d' | 'this-month' | 'last-month' | 'this-year' | 'last-year'

export interface FilterDraft {
  from: string
  to: string
  preset: PresetKey | null
  types: string[]   // selected type codes (empty = all)
  group: string     // 'all' | 'A' | ...
}

// ── Helpers ──
export const sumRecord = (r: Record<string, number>): number =>
  Object.values(r).reduce((s, v) => s + (v || 0), 0)
