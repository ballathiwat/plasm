// frontend/src/pages/report-daily/services/DailyReportType.ts

export { groupColor, groupSurface, groupInk, bloodChartColor, plasmaChartColor } from '../../../helpers/blood'

// ── API response ──
export interface MovementBucket {
  start: string
  end: string
  store: Record<string, Record<string, number>>    // type → group → qty
  withdraw: Record<string, Record<string, number>>
}

export interface SummaryItem {
  type: string
  blood: string   // e.g. "A+", "A-"
  group: string   // e.g. "A"
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
  summary: {
    store: SummaryItem[]
    withdraw: SummaryItem[]
  }
  totals: {
    store: Record<string, number>
    withdraw: Record<string, number>
  }
}

// ── Filter state ──
export type PresetKey = 'today' | '7d' | '30d' | 'this-month' | 'last-month' | 'this-year' | 'last-year'

export interface FilterDraft {
  from: string
  to: string
  preset: PresetKey | null
  type: string    // 'all' | 'FFP' | ...
  group: string   // 'all' | 'A' | ...
}

// ── Helpers ──
export const sumRecord = (r: Record<string, number>): number =>
  Object.values(r).reduce((s, v) => s + (v || 0), 0)

/** Sum across all types for a given group in a bucket action */
export const sumBucketAction = (
  actionData: Record<string, Record<string, number>>,
  group: string,
): number => {
  let total = 0
  for (const typeData of Object.values(actionData)) {
    total += typeData[group] || 0
  }
  return total
}

/** Sum all groups for a given type in a bucket action */
export const sumBucketType = (
  actionData: Record<string, Record<string, number>>,
  type: string,
): number => sumRecord(actionData[type] || {})

/** Grand total of a bucket action (all types, all groups) */
export const sumBucketAll = (
  actionData: Record<string, Record<string, number>>,
): number => {
  let total = 0
  for (const typeData of Object.values(actionData)) {
    total += sumRecord(typeData)
  }
  return total
}
