// frontend/src/pages/report-daily/services/DailyReportType.ts

export interface DailyData {
  date: string
  label: string
  store: Record<string, number>
  withdraw: Record<string, number>
}

export const sumBlood = (r: Record<string, number>) =>
  Object.values(r).reduce((s, v) => s + (v || 0), 0)