// frontend/src/pages/report-daily/services/DailyReportType.ts

export { groupColor, groupSurface, groupInk, bloodChartColor, plasmaChartColor, bloodBase } from '../../../helpers/blood'

export const ALL_KEYS = ['A','A+','A-','B','B+','B-','O','O+','O-','AB','AB+','AB-']

/** A+ → A+, A- → A−  (U+2212) */
export const displayKey = (k: string): string => k.replace(/-$/, '\u2212')

/** Base group of a key: A+ → A, AB- → AB, A → A */
export const keyGroup = (k: string): string =>
  /^AB/i.test(k) ? 'AB' : /^[ABO]/i.test(k) ? k[0].toUpperCase() : k

/** Rh suffix: '+', '-', or '' (no Rh) */
export const keyRh = (k: string): string => {
  if (k.endsWith('+')) return '+'
  if (k.endsWith('-')) return '-'
  return ''
}

// ── API response ──
export interface MovementBucket {
  start: string
  end: string
  store: Record<string, number>
  withdraw: Record<string, number>
}

export interface MatrixItem {
  type: string
  key: string
  in: number
  out: number
}

export interface MovementResponse {
  from: string
  to: string
  days: number
  granularity: 'day' | 'week' | 'month'
  types: string[]
  keys: string[]
  buckets: MovementBucket[]
  matrix: MatrixItem[]
  totals: { in: number; out: number }
}

// ── Filter state ──
export type PresetKey = 'today' | '7d' | '30d' | 'this-month' | 'last-month' | 'this-year' | 'last-year'

export interface FilterDraft {
  from: string
  to: string
  preset: PresetKey | null
  types: string[]
  blood: string   // 'all' | one of ALL_KEYS
}

// ── Helpers ──
export const sumRecord = (r: Record<string, number>): number =>
  Object.values(r).reduce((s, v) => s + (v || 0), 0)
