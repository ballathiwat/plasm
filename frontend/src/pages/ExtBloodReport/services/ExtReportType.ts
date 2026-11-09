// frontend/src/pages/ExtBloodReport/services/ExtReportType.ts
export interface ExtReportFilter {
  dateFrom: string
  dateTo: string
  sourceId?: string
  bloodProductId?: string
  bloodGroup?: string
}
export interface ExtReportKPI { totalReceived: number; totalExported: number; remaining: number; avgDaysToExport: number }
export interface ExtReportChartItem { month: string; received: number; exported: number }
export interface ExtReportMatrixRow { productCode: string; productName?: string; groups: Record<string, number>; total: number }
