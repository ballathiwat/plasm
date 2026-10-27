// src/pages/report/services/ReportType.ts

export { groupColor, groupSurface, groupInk } from '../../../helpers/blood'

export interface ReportData {
  types: string[]
  bloods: string[]
  data: Record<string, Record<string, { stored: number; withdrawn: number }>>
  stock: Record<string, Record<string, number>>
}

export type DateMode = 'single' | 'range'

export interface ReportFilters {
  mode: DateMode
  date: string
  from: string
  to: string
}